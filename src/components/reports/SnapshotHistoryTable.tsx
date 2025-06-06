// d:\WINDSURF\carteira\src\components\reports\SnapshotHistoryTable.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import SnapshotItemsTable from './SnapshotItemsTable'; // <-- IMPORTAR NOVO COMPONENTE

interface SnapshotItem {
  id: string;
  asset_name: string;
  asset_category_name: string;
  total_value_brl: number;
  is_crypto_total: boolean;
}

// Interface estendida para incluir o total calculado
interface SnapshotGroupWithTotal extends SnapshotGroup {
  totalPatrimonioGrupo: number;
}

interface SnapshotGroup {
  id: string;
  created_at: string;
  notes?: string | null;
  snapshot_items: SnapshotItem[];
  user_id: string;
}

interface SnapshotHistoryTableProps {
  refreshKey: number;
}

const SnapshotHistoryTable: React.FC<SnapshotHistoryTableProps> = ({ refreshKey }) => {
  const { user } = useAuth();
  // Usar a interface estendida para o estado
  const [snapshotGroups, setSnapshotGroups] = useState<SnapshotGroupWithTotal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({}); // <-- ESTADO PARA LINHAS EXPANDIDAS

  useEffect(() => {
    const fetchSnapshotHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('snapshot_groups')
          .select(`
            id,
            created_at,
            notes,
            user_id,
            snapshot_items (
              id,
              asset_name,
              asset_category_name,
              total_value_brl,
              is_crypto_total
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        // Processar dados para calcular o total e garantir que snapshot_items é um array
        const processedData = data?.map(group => {
          const items = group.snapshot_items || [];
          const totalPatrimonioGrupo = items.reduce((sum, currentItem) => sum + currentItem.total_value_brl, 0);
          return {
            ...group,
            snapshot_items: items,
            totalPatrimonioGrupo, // <-- ADICIONAR TOTAL CALCULADO
          };
        }) || [];

        setSnapshotGroups(processedData as SnapshotGroupWithTotal[]);

      } catch (e: any) {
        console.error('Erro ao buscar histórico de snapshots:', e);
        setError('Falha ao carregar o histórico de snapshots.');
        toast.error('Falha ao carregar o histórico de snapshots.');
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshotHistory();
  }, [user, refreshKey]);

  const toggleRowExpansion = (groupId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  if (loading) {
    return <div className="text-center p-4">Carregando histórico...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (snapshotGroups.length === 0) {
    return <div className="text-center p-4">Nenhum snapshot registrado ainda.</div>;
  }

  // NOVA ESTRUTURA DE TABELA
  return (
    <div className="rounded-md border bg-card shadow-md"> {/* Envolver a tabela em um card/border */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead> {/* Coluna para botão de expandir */}
            <TableHead>Data</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead className="text-right">Patrimônio Total (R$)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {snapshotGroups.map((group) => (
            <React.Fragment key={group.id}>
              <TableRow className="hover:bg-muted/50 data-[state=open]:bg-muted/50">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRowExpansion(group.id)}
                    aria-label={expandedRows[group.id] ? "Recolher itens" : "Expandir itens"}
                  >
                    {expandedRows[group.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </TableCell>
                <TableCell>{new Date(group.created_at).toLocaleString('pt-BR')}</TableCell>
                <TableCell className="max-w-xs truncate" title={group.notes || undefined}>
                  {group.notes || '-'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {group.totalPatrimonioGrupo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
              </TableRow>
              {expandedRows[group.id] && (
                <TableRow>
                  {/* Célula vazia para alinhar com o botão de expandir */}
                  <TableCell /> 
                  {/* Sub-tabela ocupando o restante das colunas */}
                  <TableCell colSpan={3}> {/* Ajustar colSpan conforme o número de colunas na tabela principal - 1 */}
                    <SnapshotItemsTable items={group.snapshot_items} />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SnapshotHistoryTable;
