import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SnapshotItem } from '@/types/reports'; // <-- IMPORTAR DE TYPES

interface SnapshotItemsTableProps {
  items: SnapshotItem[];
  onUpdate: () => void; // Callback para forçar a atualização da página principal
}

const SnapshotItemsTable: React.FC<SnapshotItemsTableProps> = ({ items, onUpdate }) => {
  const [editingCell, setEditingCell] = useState<{ itemId: string; field: 'total_value_brl' } | null>(null);
  const [currentValue, setCurrentValue] = useState<string>('');

  const handleCellClick = (item: SnapshotItem, field: 'total_value_brl') => {
    setEditingCell({ itemId: item.id, field });
    setCurrentValue(String(item.total_value_brl || ''));
  };

  const handleUpdate = async () => {
    if (!editingCell) return;

    const newValue = parseFloat(currentValue);
    if (isNaN(newValue)) {
      toast.error("Valor inválido. Por favor, insira um número.");
      return;
    }

    const { error } = await supabase
      .from('snapshot_items')
      .update({ [editingCell.field]: newValue })
      .eq('id', editingCell.itemId);

    if (error) {
      toast.error(`Falha ao atualizar o valor: ${error.message}`);
    } else {
      toast.success("Valor do ativo atualizado com sucesso!");
      onUpdate(); // Chama o callback para atualizar os dados na página principal
    }

    setEditingCell(null);
    setCurrentValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleUpdate();
    }
    if (event.key === 'Escape') {
      setEditingCell(null);
      setCurrentValue('');
    }
  };

  if (!items || items.length === 0) {
    return (
      // Esta TableRow será inserida na TableBody da sub-tabela
      // A TableCell com colSpan garante que a mensagem ocupe toda a largura da sub-tabela
      <TableRow> 
        <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-4">
          Nenhum item detalhado neste snapshot.
        </TableCell>
      </TableRow>
    );
  }
  return (
    // Este componente já espera estar dentro de uma TableCell com colSpan na tabela pai.
    // O div aqui é para o padding e fundo da área da sub-tabela.
    <div className="p-2 bg-background rounded-md"> {/* Adicionado rounded-md e ajustado padding */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-10">Ativo</TableHead> {/* Ajuste altura se necessário */}
            <TableHead className="h-10">Categoria</TableHead>
            <TableHead className="text-right h-10">Valor Total (R$)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow 
              key={item.id} 
              className={"hover:bg-muted/40 border-b-0"} // Removendo borda inferior se for a última
            >
              <TableCell className="py-2 font-medium">{item.asset_name}</TableCell> {/* Ajuste padding se necessário */}
              <TableCell className="py-2">{item.asset_category_name}</TableCell>
              <TableCell 
                className="text-right py-2 cursor-pointer"
                onClick={() => handleCellClick(item, 'total_value_brl')}
              >
                {editingCell?.itemId === item.id ? (
                  <Input
                    type="number"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleUpdate}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="text-right h-8"
                    onClick={(e) => e.stopPropagation()} // Evita que o clique no input feche o modo de edição
                  />
                ) : (
                  item.total_value_brl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SnapshotItemsTable;
