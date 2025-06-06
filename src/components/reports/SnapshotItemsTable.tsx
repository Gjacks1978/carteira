import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Definindo SnapshotItem aqui temporariamente. Idealmente, viria de @/types/...
interface SnapshotItem {
  id: string;
  asset_name: string;
  asset_category_name: string;
  total_value_brl: number;
  is_crypto_total: boolean;
}

interface SnapshotItemsTableProps {
  items: SnapshotItem[];
}

const SnapshotItemsTable: React.FC<SnapshotItemsTableProps> = ({ items }) => {
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
              className={`${item.is_crypto_total ? 'bg-primary/10' : ''} hover:bg-muted/40 border-b-0`} // Removendo borda inferior se for a última
            >
              <TableCell className="py-2 font-medium">{item.asset_name}</TableCell> {/* Ajuste padding se necessário */}
              <TableCell className="py-2">{item.asset_category_name}</TableCell>
              <TableCell className="text-right py-2">
                {item.total_value_brl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SnapshotItemsTable;
