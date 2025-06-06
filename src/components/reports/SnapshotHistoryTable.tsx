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
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import SnapshotItemsTable from './SnapshotItemsTable';
import { SnapshotItem, SnapshotGroup, SnapshotGroupWithTotal } from '@/types/reports';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
interface SnapshotHistoryTableProps {
  refreshKey: number; // Mantido para compatibilidade, mas onSnapshotDeleted é preferível para refresh
  onSnapshotDeleted: () => void; // Callback para atualizar a lista na ReportsPage
}

const SnapshotHistoryTable: React.FC<SnapshotHistoryTableProps> = ({ refreshKey, onSnapshotDeleted }) => {
  const { user } = useAuth();
  // Usar a interface estendida para o estado
  const [snapshotGroups, setSnapshotGroups] = useState<SnapshotGroupWithTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({}); // <-- ESTADO PARA LINHAS EXPANDIDAS
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] = useState<SnapshotGroupWithTotal | null>(null);

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

  const handleDeleteClick = (snapshot: SnapshotGroupWithTotal) => {
    setSnapshotToDelete(snapshot);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!snapshotToDelete || !user) return;

    try {
      setLoading(true);
      // Etapa 1: Excluir snapshot_items associados (necessário se ON DELETE CASCADE não estiver configurado)
      const { error: itemsError } = await supabase
        .from('snapshot_items')
        .delete()
        .eq('snapshot_group_id', snapshotToDelete.id);

      if (itemsError) {
        console.error('Erro ao excluir itens do snapshot:', itemsError);
        throw new Error(`Falha ao excluir itens do snapshot: ${itemsError.message}`);
      }

      // Etapa 2: Excluir o snapshot_group
      const { error: groupError } = await supabase
        .from('snapshot_groups')
        .delete()
        .eq('id', snapshotToDelete.id)
        .eq('user_id', user.id); // Garante que o usuário só exclua seus próprios snapshots

      if (groupError) {
        console.error('Erro ao excluir grupo do snapshot:', groupError);
        throw new Error(`Falha ao excluir o grupo do snapshot: ${groupError.message}`);
      }

      toast.success(`Snapshot de ${new Date(snapshotToDelete.created_at).toLocaleDateString('pt-BR')} excluído com sucesso.`);
      onSnapshotDeleted(); // Chama o callback para ReportsPage atualizar a lista

    } catch (error: any) {
      console.error("Erro ao excluir snapshot:", error);
      toast.error(error.message || "Erro desconhecido ao excluir snapshot.");
    } finally {
      setIsDeleteDialogOpen(false);
      setSnapshotToDelete(null);
      setLoading(false); // Garante que o loading seja desativado
    }
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
            <TableHead className="w-[180px]">Data</TableHead>
            <TableHead className="min-w-[200px]">Notas</TableHead>
            <TableHead className="text-right">Patrimônio Total (R$)</TableHead>
            <TableHead className="w-[120px] text-center">Ações</TableHead> {/* Coluna Ações com expandir e excluir */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {snapshotGroups.map((group) => (
            <React.Fragment key={group.id}>
              <TableRow className="hover:bg-muted/50 data-[state=open]:bg-muted/50">
                <TableCell>{new Date(group.created_at).toLocaleString('pt-BR')}</TableCell>
                <TableCell className="max-w-xs truncate" title={group.notes || undefined}>
                  {group.notes || '-'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {group.totalPatrimonioGrupo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center items-center space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleRowExpansion(group.id)} aria-label={expandedRows[group.id] ? "Recolher" : "Expandir"}>
                      {expandedRows[group.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(group)} aria-label="Excluir snapshot">
                      <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                    </Button>
                  </div>
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

      {snapshotToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o snapshot de{' '}
                <strong>{new Date(snapshotToDelete.created_at).toLocaleDateString('pt-BR')}</strong>
                {snapshotToDelete.notes ? <> (Notas: <em>{snapshotToDelete.notes}</em>)</> : ''}?
                <br />
                Esta ação não pode ser desfeita e todos os itens de portfólio registrados neste snapshot serão removidos permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir Permanentemente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default SnapshotHistoryTable;
