import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { XIcon, SaveIcon, Loader2Icon } from 'lucide-react';

interface RegisterSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface SnapshotDisplayItem {
  id: string; // Unique key for React list and form state (e.g., `asset-${asset.id}` or `crypto-total-sum`)
  displayName: string;
  currentValue: number;
  itemType: 'NON_CRYPTO_ASSET' | 'CRYPTO_TOTAL_SUM';
  originalAssetId?: string; // For NON_CRYPTO_ASSET, the actual ID from 'assets' table
  assetCategoryName?: string; // For NON_CRYPTO_ASSET
}

const RegisterSnapshotModal: React.FC<RegisterSnapshotModalProps> = ({ isOpen, onClose, onSubmitSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshotDisplayItems, setSnapshotDisplayItems] = useState<SnapshotDisplayItem[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [initialFormValues, setInitialFormValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch assets and their categories to identify non-crypto assets
        const { data: allAssetsData, error: assetsError } = await supabase
          .from('assets')
          .select('id, name, current_total_value_brl, asset_categories (name, type)')
          .eq('user_id', user.id);

        if (assetsError) throw assetsError;

        const nonCryptoDisplayItems: SnapshotDisplayItem[] = [];
        if (allAssetsData) {
          allAssetsData.forEach((asset: any) => {
            const category = Array.isArray(asset.asset_categories) 
                             ? asset.asset_categories[0] 
                             : asset.asset_categories;

            if (category && category.type !== 'crypto') {
              nonCryptoDisplayItems.push({
                id: `asset-${asset.id}`,
                displayName: `${asset.name} (Cat: ${category.name || 'N/A'})`,
                currentValue: asset.current_total_value_brl || 0,
                itemType: 'NON_CRYPTO_ASSET',
                originalAssetId: asset.id,
                assetCategoryName: category.name || 'N/A',
              });
            }
          });
        }

        // 2. Fetch ALL crypto assets for the user and sum their total_brl
        const { data: allUserCryptoAssets, error: cryptoAssetsError } = await supabase
          .from('crypto_assets')
          .select('total_brl')
          .eq('user_id', user.id); // Assuming user_id exists or RLS handles it

        if (cryptoAssetsError) throw cryptoAssetsError;

        let summedCryptoTotalValue = 0;
        if (allUserCryptoAssets) {
          summedCryptoTotalValue = allUserCryptoAssets.reduce((sum, cryptoAsset) => {
            // Ensure we don't sum up any 'TOTAL' row if it still exists and has a value
            // This check might need adjustment based on how you differentiate the 'TOTAL' row
            // For now, assuming 'TOTAL' row might have a specific symbol or name not typical of an asset
            // Or, more simply, if you plan to remove the 'TOTAL' row, this check becomes less critical.
            // For safety, let's assume any row with a 'total_brl' is a valid asset to sum,
            // unless you have a specific way to exclude the 'TOTAL' row from this sum.
            // If the 'TOTAL' row is always present and you want to sum individual assets,
            // you'd need to filter out the 'TOTAL' row here, e.g., by checking `cryptoAsset.symbol !== 'TOTAL'`.
            // Given your intent to remove 'TOTAL' row eventually, summing all seems fine for now.
            return sum + (cryptoAsset.total_brl || 0);
          }, 0);
        }
        
        const cryptoDisplayItem: SnapshotDisplayItem = {
          id: 'crypto-total-sum', // New ID for the summed crypto total
          displayName: 'Total Cripto (R$)',
          currentValue: summedCryptoTotalValue,
          itemType: 'CRYPTO_TOTAL_SUM',
        };

        const combinedItems = [...nonCryptoDisplayItems, cryptoDisplayItem];

        combinedItems.sort((a, b) => {
          if (a.itemType === 'CRYPTO_TOTAL_SUM' && b.itemType !== 'CRYPTO_TOTAL_SUM') return 1;
          if (a.itemType !== 'CRYPTO_TOTAL_SUM' && b.itemType === 'CRYPTO_TOTAL_SUM') return -1;
          return a.displayName.localeCompare(b.displayName);
        });
        
        setSnapshotDisplayItems(combinedItems);

        const initialVals = combinedItems.reduce((acc, item) => {
          acc[item.id] = item.currentValue.toFixed(2);
          return acc;
        }, {} as Record<string, string>);
        setInitialFormValues(initialVals);
        setFormValues(initialVals);

      } catch (e: any) {
        console.error("Erro ao buscar dados para o modal:", e);
        setError(`Falha ao carregar dados: ${e.message}`);
        toast.error(`Falha ao carregar dados: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && user) {
      fetchData();
    } else if (!isOpen) {
      // Reset state when modal is closed
      setSnapshotDisplayItems([]);
      setFormValues({});
      setInitialFormValues({});
      setNotes('');
      setError(null);
    }
  }, [isOpen, user, supabase]);

  const handleValueChange = (id: string, value: string) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (snapshotDisplayItems.length === 0) {
      toast.error("Não há itens para registrar. Verifique se os dados foram carregados corretamente.");
      setError("Não há itens para registrar. Tente fechar e abrir o modal novamente."); 
      return; 
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('snapshot_groups')
        .insert({ user_id: user.id, notes: notes || null })
        .select('id')
        .single();

      if (groupError) throw groupError;
      if (!groupData) throw new Error('Falha ao criar grupo de snapshot.');

      const snapshotGroupId = groupData.id;

      const itemsToInsert = snapshotDisplayItems.map(item => {
        const submittedValue = parseFloat(formValues[item.id]?.replace(',', '.') || '0');
        if (item.itemType === 'NON_CRYPTO_ASSET') {
          return {
            snapshot_group_id: snapshotGroupId,
            asset_id: item.originalAssetId,
            asset_name: item.displayName.split(' (Cat:')[0],
            asset_category_name: item.assetCategoryName,
            total_value_brl: submittedValue,
            is_crypto_total: false, // Explicitly false for these
          };
        } else { // CRYPTO_TOTAL_SUM
          return {
            snapshot_group_id: snapshotGroupId,
            asset_id: null, // This is an aggregate, not a specific asset from 'assets' table
            asset_name: item.displayName, // "Total Cripto (R$)"
            asset_category_name: 'Cripto Consolidado (Soma)', // Category for the aggregate
            total_value_brl: submittedValue,
            is_crypto_total: true, // Mark this specific snapshot item as representing the crypto total
          };
        }
      });

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase.from('snapshot_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      toast.success('Snapshot registrado com sucesso!');
      onSubmitSuccess();
      onClose();
    } catch (e: any) {
      console.error("Erro ao registrar snapshot:", e);
      setError(`Falha ao salvar snapshot: ${e.message}`);
      toast.error(`Falha ao salvar snapshot: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    return JSON.stringify(formValues) !== JSON.stringify(initialFormValues) || notes !== '';
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                  Registrar Snapshot de Patrimônio
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <XIcon className="w-5 h-5" />
                  </button>
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Confirme ou ajuste os valores totais atuais para seus ativos e para o total de criptomoedas.
                  </p>
                </div>

                {isLoading && (
                  <div className="flex justify-center items-center my-6">
                    <Loader2Icon className="w-8 h-8 animate-spin text-indigo-600" />
                    <p className='ml-3 text-gray-700'>Carregando dados...</p>
                  </div>
                )}
                {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md mt-3">{error}</p>}

                {!isLoading && !error && (
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="mt-4 space-y-4">
                    {snapshotDisplayItems.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhum item encontrado para registrar.</p>}
                    {snapshotDisplayItems.map((item) => (
                      <div key={item.id}>
                        <label htmlFor={item.id} className="block text-sm font-medium text-gray-700">
                          {item.displayName}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          id={item.id}
                          name={item.id}
                          value={formValues[item.id] || ''}
                          onChange={(e) => handleValueChange(item.id, e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                          placeholder="0.00"
                        />
                      </div>
                    ))}
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Notas (Opcional)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                        placeholder="Ex: Rebalanceamento mensal, observações..."
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !hasChanges()}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? <Loader2Icon className="w-5 h-5 animate-spin" /> : <SaveIcon className="w-5 h-5 mr-2 inline-block" />}
                        Salvar Snapshot
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RegisterSnapshotModal;