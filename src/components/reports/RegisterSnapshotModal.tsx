import React, { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { XIcon, SaveIcon, Loader2Icon, PlusCircle, Trash2 } from 'lucide-react';
import { SnapshotGroupWithTotal } from '@/types/reports'; // Importar tipo
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react'

interface RegisterSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  snapshotToEdit?: SnapshotGroupWithTotal | null;
}

interface SnapshotDisplayItem {
  id: string; // Unique key for React list and form state (e.g., `asset-${asset.id}` or `crypto-total-sum`)
  displayName: string;
  currentValue: number;
  itemType: 'NON_CRYPTO_ASSET' | 'CRYPTO_TOTAL_SUM';
  originalAssetId?: string; // For NON_CRYPTO_ASSET, the actual ID from 'assets' table
  assetCategoryName?: string; // For NON_CRYPTO_ASSET
}

const RegisterSnapshotModal: React.FC<RegisterSnapshotModalProps> = ({ isOpen, onClose, onSubmitSuccess, snapshotToEdit }) => {
  const isEditMode = !!snapshotToEdit;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshotDisplayItems, setSnapshotDisplayItems] = useState<SnapshotDisplayItem[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [initialFormValues, setInitialFormValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [initialNotes, setInitialNotes] = useState('');
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialSnapshotDate, setInitialSnapshotDate] = useState(new Date().toISOString().split('T')[0]);
  const [allUserAssets, setAllUserAssets] = useState<any[]>([]);
  const [assetQuery, setAssetQuery] = useState('');

  const fetchAllUserAssets = async (userId: string) => {
    const { data, error } = await supabase
      .from('assets')
      .select('id, name, current_total_value_brl, asset_categories (name, type)')
      .eq('user_id', userId);

    if (error) {
      console.error("Erro ao buscar todos os ativos do usuário:", error);
      return [];
    }
    return data || [];
  };

  useEffect(() => {
    const fetchDataForCreateMode = async () => { // Renomeado para clareza
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
                displayName: `${asset.name} (Classe: ${category.name || 'N/A'})`,
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
          .select('current_total_value_brl')
          .eq('user_id', user.id); // Assuming user_id exists or RLS handles it

        if (cryptoAssetsError) throw cryptoAssetsError;

        let summedCryptoTotalValue = 0;
        if (allUserCryptoAssets) {
          summedCryptoTotalValue = allUserCryptoAssets.reduce((sum, cryptoAsset) => {
            return sum + (cryptoAsset.current_total_value_brl || 0);
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
      if (isEditMode) {
        // MODO DE EDIÇÃO
        setIsLoading(true);
        const itemsFromSnapshot: SnapshotDisplayItem[] = snapshotToEdit.snapshot_items.map(item => ({
          id: item.id, // Usamos o ID do snapshot_item como chave única
          displayName: item.asset_name,
          currentValue: item.total_value_brl || 0,
          itemType: item.is_crypto_total ? 'CRYPTO_TOTAL_SUM' : 'NON_CRYPTO_ASSET',
          originalAssetId: item.asset_id || undefined,
          assetCategoryName: item.asset_category_name || 'N/A',
        }));
        setSnapshotDisplayItems(itemsFromSnapshot);

        const initialVals = itemsFromSnapshot.reduce((acc, item) => {
          acc[item.id] = String(item.currentValue);
          return acc;
        }, {} as Record<string, string>);
        setFormValues(initialVals);
        setInitialFormValues(initialVals);
        const initialDate = new Date(snapshotToEdit.created_at).toISOString().split('T')[0];
        setNotes(snapshotToEdit.notes || '');
        setInitialNotes(snapshotToEdit.notes || '');
        setSnapshotDate(initialDate);
        setInitialSnapshotDate(initialDate);
        fetchAllUserAssets(user.id).then(setAllUserAssets);
        setIsLoading(false);
      } else {
        // MODO DE CRIAÇÃO (lógica original)
        fetchAllUserAssets(user.id).then(setAllUserAssets); // Também carrega para o caso de querer adicionar
        fetchDataForCreateMode();
      }
    } else if (!isOpen) {
      // Reset state when modal is closed
      setSnapshotDisplayItems([]);
      setFormValues({});
      setInitialFormValues({});
      setNotes('');
      setInitialNotes('');
      setError(null);
      const today = new Date().toISOString().split('T')[0];
      setSnapshotDate(today);
      setInitialSnapshotDate(today);
    }
  }, [isOpen, user, supabase]);

  const handleValueChange = (id: string, value: string) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const handleRemoveItem = (idToRemove: string) => {
    setSnapshotDisplayItems(prev => prev.filter(item => item.id !== idToRemove));
    setFormValues(prev => {
      const newValues = { ...prev };
      delete newValues[idToRemove];
      return newValues;
    });
  };

  const handleAddItem = (asset: any) => {
    const newItem: SnapshotDisplayItem = {
      id: `new-asset-${asset.id}-${Date.now()}`, // ID temporário único
      displayName: asset.name,
      currentValue: asset.current_total_value_brl || 0,
      itemType: 'NON_CRYPTO_ASSET',
      originalAssetId: asset.id,
      assetCategoryName: asset.asset_categories?.name || 'N/A',
    };

    setSnapshotDisplayItems(prev => [...prev, newItem]);
    setFormValues(prev => ({ ...prev, [newItem.id]: String(newItem.currentValue) }));
    setAssetQuery(''); // Limpa a busca
  };

  const filteredAssets = assetQuery === ''
    ? allUserAssets.filter(asset => 
        !snapshotDisplayItems.some(item => item.originalAssetId === asset.id) && asset.asset_categories?.type !== 'crypto'
      )
    : allUserAssets.filter(asset =>
        asset.name.toLowerCase().includes(assetQuery.toLowerCase()) &&
        !snapshotDisplayItems.some(item => item.originalAssetId === asset.id) &&
        asset.asset_categories?.type !== 'crypto'
      );


  const handleSubmit = async () => {
    if (!user) {
      toast.error("Usuário não autenticado.");
      return;
    }

    if (snapshotDisplayItems.length === 0) {
      toast.error("Não há itens para registrar. Adicione ao menos um ativo.");
      setError("Não há itens para registrar.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Lógica de preparação dos itens é a mesma para ambos os modos
      const itemsToSave = snapshotDisplayItems.map(item => {
        const rawValue = formValues[item.id] || '';
        const cleanedValue = rawValue.replace(',', '.');
        const numValue = parseFloat(cleanedValue);
        const submittedValue = isNaN(numValue) ? 0 : numValue;

        return {
          asset_id: item.itemType === 'NON_CRYPTO_ASSET' ? item.originalAssetId : null,
          asset_name: item.itemType === 'NON_CRYPTO_ASSET' ? item.displayName.split(' (Classe:')[0] : item.displayName,
          asset_category_name: item.assetCategoryName || (item.itemType === 'CRYPTO_TOTAL_SUM' ? 'Cripto Consolidado (Soma)' : 'Sem Categoria'),
          total_value_brl: submittedValue,
          is_crypto_total: item.itemType === 'CRYPTO_TOTAL_SUM',
        };
      });

      if (isEditMode && snapshotToEdit) {
        // MODO DE EDIÇÃO
        // 1. Atualiza o grupo
        const { error: groupUpdateError } = await supabase
          .from('snapshot_groups')
          .update({ notes: notes || null, created_at: snapshotDate })
          .eq('id', snapshotToEdit.id);
        if (groupUpdateError) throw groupUpdateError;

        // 2. Deleta itens antigos
        const { error: deleteError } = await supabase
          .from('snapshot_items')
          .delete()
          .eq('snapshot_group_id', snapshotToEdit.id);
        if (deleteError) throw deleteError;

        // 3. Insere novos itens
        if (itemsToSave.length > 0) {
          const itemsWithGroupId = itemsToSave.map(item => ({ ...item, snapshot_group_id: snapshotToEdit.id }));
          const { error: itemsInsertError } = await supabase.from('snapshot_items').insert(itemsWithGroupId);
          if (itemsInsertError) throw itemsInsertError;
        }
        
        toast.success('Snapshot atualizado com sucesso!');

      } else {
        // MODO DE CRIAÇÃO
        // 1. Cria novo grupo
        const { data: groupData, error: groupError } = await supabase
          .from('snapshot_groups')
          .insert({ user_id: user.id, notes: notes || null, created_at: snapshotDate })
          .select('id')
          .single();
        if (groupError) throw groupError;
        if (!groupData) throw new Error('Falha ao criar grupo de snapshot.');

        // 2. Insere novos itens
        if (itemsToSave.length > 0) {
          const itemsWithGroupId = itemsToSave.map(item => ({ ...item, snapshot_group_id: groupData.id }));
          const { error: itemsError } = await supabase.from('snapshot_items').insert(itemsWithGroupId);
          if (itemsError) throw itemsError;
        }
        
        toast.success('Snapshot registrado com sucesso!');
      }

      onSubmitSuccess();
      onClose();

    } catch (e: any) {
      const action = isEditMode ? 'atualizar' : 'registrar';
      console.error(`Erro ao ${action} snapshot:`, e);
      setError(`Falha ao ${action} snapshot: ${e.message}`);
      toast.error(`Falha ao ${action} snapshot: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    if (isLoading) return false;
    const valuesChanged = JSON.stringify(formValues) !== JSON.stringify(initialFormValues);
    const notesChanged = notes !== initialNotes;
    const dateChanged = snapshotDate !== initialSnapshotDate;
    return valuesChanged || notesChanged || dateChanged;
  };

  return (
    <Transition appear show={isOpen}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                        {isEditMode ? 'Editar Snapshot' : 'Registrar Saldos Atuais'}
                    </Dialog.Title>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isEditMode 
                      ? 'Ajuste os valores, adicione ou remova ativos deste snapshot.' 
                      : 'Confirme ou ajuste os valores totais atuais para seus ativos e para o total de criptomoedas.'
                    }
                  </p>
                </div>

                {isLoading && (
                  <div className="flex justify-center items-center my-6">
                    <Loader2Icon className="w-8 h-8 animate-spin text-indigo-600" />
                    <p className='ml-3 text-gray-700 dark:text-gray-300'>Carregando dados...</p>
                  </div>
                )}
                {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-md mt-3">{error}</p>}

                {!isLoading && !error && (
                  <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="mt-4 space-y-4">
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                        {snapshotDisplayItems.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhum item encontrado.</p>}
                        {snapshotDisplayItems.map((item) => (
                          <div key={item.id}>
                            <label htmlFor={item.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {item.displayName}
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                type="text"
                                id={item.id}
                                value={formValues[item.id] || ''}
                                onChange={(e) => handleValueChange(item.id, e.target.value)}
                                className="w-full rounded-md border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800 p-2 text-right text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              />
                              {isEditMode && item.itemType !== 'CRYPTO_TOTAL_SUM' && (
                                <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-md">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>

                    {isEditMode && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adicionar Ativo ao Snapshot</h4>
                        <Combobox as="div" value={null} onChange={handleAddItem}>
                          <div className="relative">
                            <ComboboxInput
                              className="w-full rounded-md border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              onChange={(event) => setAssetQuery(event.target.value)}
                              placeholder="Buscar ativo para adicionar..."
                              displayValue={() => assetQuery}
                            />
                            <Transition
                              as={Fragment}
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                              afterLeave={() => setAssetQuery('')}
                            >
                              <ComboboxOptions className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                {filteredAssets.length === 0 && assetQuery !== '' ? (
                                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                                    Nenhum ativo encontrado.
                                  </div>
                                ) : (
                                  filteredAssets.map((asset) => (
                                    <ComboboxOption
                                      key={asset.id}
                                      value={asset}
                                      className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-4 pr-4 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-200'}`
                                      }
                                    >
                                      {asset.name}
                                    </ComboboxOption>
                                  ))
                                )}
                              </ComboboxOptions>
                            </Transition>
                          </div>
                        </Combobox>
                      </div>
                    )}

                    <div>
                      <label htmlFor="snapshot-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Data do Snapshot
                      </label>
                      <input
                        type="date"
                        id="snapshot-date"
                        value={snapshotDate}
                        onChange={(e) => setSnapshotDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notas (Opcional)
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Ex: Snapshot antes do rebalanceamento trimestral."
                      />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={!hasChanges() || isLoading}
                        className="inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed"
                      >
                        {isLoading ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
                        {isEditMode ? 'Salvar Alterações' : 'Registrar Snapshot'}
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