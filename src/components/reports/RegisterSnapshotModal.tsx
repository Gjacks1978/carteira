import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext'; // Para obter o user_id
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // Usando sonner para notificações

// Represents an individual asset or a special aggregated item like 'Total Crypto'
interface SnapshotDisplayItem {
  id: string; // asset_id for individual assets, or a special ID like 'TOTAL_CRYPTO'
  displayName: string; // Asset name or 'Total Cripto (R$)'
  isCryptoTotal?: boolean; // Flag to identify the special crypto total item
  // For non-crypto assets, this is the current unit price.
  // For 'Total Crypto', this is the current total value of all crypto assets.
  currentValueOrPrice: number;
  userInput: string; // User's input, initialized with currentValueOrPrice formatted
  // Optional: for displaying quantity for non-crypto assets
  quantity?: number;
  categoryName?: string;
}

interface RegisterSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in .env file");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const RegisterSnapshotModal: React.FC<RegisterSnapshotModalProps> = ({ isOpen, onClose, onSubmitSuccess }) => {
  const { user } = useAuth();
  const [displayItems, setDisplayItems] = useState<SnapshotDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchAndProcessDisplayItems = useCallback(async () => {
    if (!user || !isOpen) return;
    setIsLoading(true);
    try {
      // ASSUMPTIONS:
      // - 'assets' table has 'name', 'quantity'.
      // - 'assets' has 'current_unit_price_brl' for non-crypto OR 'current_total_value_brl' for all.
      // - 'asset_categories' (related to 'assets') has 'name' and 'type' (e.g., 'crypto').
      const { data: rawAssets, error } = await supabase
        .from('assets')
        .select(`
          id,
          name,
          quantity,
          current_unit_price_brl, 
          current_total_value_brl,
          asset_categories ( name, type )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const processedDisplayItems: SnapshotDisplayItem[] = [];
      let cryptoTotalValue = 0;

      rawAssets.forEach((asset: any) => {
        const categoryType = asset.asset_categories?.type;
        const assetTotalValueBrl = asset.current_total_value_brl || 0;

        if (categoryType === 'crypto') {
          cryptoTotalValue += assetTotalValueBrl;
          // Individual crypto assets are not added to displayItems for direct input,
          // as per request to only have 'Total Crypto (R$)' for crypto input.
        } else {
          // For non-crypto, use total value.
          const totalValue = asset.current_total_value_brl || 0;

          processedDisplayItems.push({
            id: asset.id,
            displayName: asset.name,
            currentValueOrPrice: totalValue,
            userInput: totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            quantity: asset.quantity, // Still useful for display context
            categoryName: asset.asset_categories?.name || 'Sem Categoria',
          });
        }
      });

      // Add the 'Total Crypto (R$)' item
      // Ensure it's added even if total is 0, as long as there were crypto assets processed or user expects it.
      if (rawAssets.some((a: any) => a.asset_categories?.type === 'crypto') || cryptoTotalValue >= 0) { // Show if any crypto or if total is 0 (explicitly)
        processedDisplayItems.push({
          id: 'TOTAL_CRYPTO',
          displayName: 'Total Cripto (R$)',
          isCryptoTotal: true,
          currentValueOrPrice: cryptoTotalValue,
          userInput: cryptoTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        });
      }
      
      // Sort: Non-crypto assets alphabetically, then 'Total Crypto (R$)' at the end.
      processedDisplayItems.sort((a, b) => {
        if (a.isCryptoTotal) return 1;
        if (b.isCryptoTotal) return -1;
        return a.displayName.localeCompare(b.displayName);
      });

      setDisplayItems(processedDisplayItems);
    } catch (error: any) {
      console.error('Erro ao buscar e processar itens para o modal:', error);
      toast.error('Erro ao preparar dados para o snapshot.', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchAndProcessDisplayItems();
      setNotes('');
    }
  }, [isOpen, fetchAndProcessDisplayItems]);

  const handleInputChange = (itemId: string, value: string) => {
    setDisplayItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, userInput: value } : item
      )
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const snapshotEntries = displayItems.map(item => {
      const numericValue = parseFloat(item.userInput.replace(/\./g, '').replace(',', '.'));
      return {
        id: item.id, // asset_id or 'TOTAL_CRYPTO'
        name: item.displayName,
        value: isNaN(numericValue) ? 0 : numericValue,
        isCryptoTotal: !!item.isCryptoTotal,
        // For non-crypto assets, we might want to store quantity if submitting unit prices
        quantity: item.isCryptoTotal ? undefined : item.quantity 
      };
    });

    for (const entry of snapshotEntries) {
      if (isNaN(entry.value) || entry.value < 0) {
        toast.error('Valor inválido.', { description: `Por favor, insira um valor válido para ${entry.name}.` });
        setIsSubmitting(false);
        return;
      }
    }

    console.log('Dados do Snapshot para Enviar (Nova Lógica):', { snapshot_date: new Date(), notes, entries: snapshotEntries });
    // TODO: Adaptar chamada para a Supabase Edge Function.
    // 'snapshot_items' table would need to store:
    // - For non-crypto: asset_id, quantity_snapshotted, unit_price_snapshotted.
    // - For 'TOTAL_CRYPTO': a special type/id and the total_crypto_value_snapshotted.

    setTimeout(() => {
      toast.success('Snapshot registrado com sucesso! (Simulação)');
      onSubmitSuccess();
      onClose();
      setIsSubmitting(false);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Registrar Snapshot de Patrimônio</DialogTitle>
          <DialogDescription>
            Confirme ou ajuste os valores totais atuais para seus ativos e para o total de criptomoedas. Isso criará um registro do seu patrimônio.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : displayItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhum ativo encontrado para registrar.</p>
        ) : (
          <div className="grid gap-4 py-4">
            <ScrollArea className="h-[300px] pr-3">
              {displayItems.map((item) => (
                <div key={item.id} className="grid grid-cols-3 items-center gap-4 mb-3 p-2 border rounded-md">
                  <div className="col-span-2">
                    <Label htmlFor={`input-${item.id}`} className="text-sm font-medium">
                      {item.displayName}
                      {!item.isCryptoTotal && item.quantity !== undefined && (
                        <span className="text-xs text-muted-foreground"> (Qtd: {item.quantity}, Cat: {item.categoryName})</span>
                      )}
                    </Label>
                  </div>
                  <Input
                    id={`input-${item.id}`}
                    type="text"
                    inputMode="decimal"
                    placeholder={item.isCryptoTotal ? "Total Cripto (R$)" : "Valor Total (R$)"}
                    value={item.userInput}
                    onChange={(e) => handleInputChange(item.id, e.target.value)}
                    className="col-span-1"
                  />
                </div>
              ))}
            </ScrollArea>
            <div>
              <Label htmlFor="snapshot-notes">Notas (Opcional)</Label>
              <Input 
                id="snapshot-notes"
                placeholder="Ex: Rebalanceamento mensal, mercado em alta..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading || displayItems.length === 0 || isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Salvar Snapshot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterSnapshotModal;
