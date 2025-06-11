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
import { ChevronDown, ChevronRight, Trash2, Copy } from "lucide-react";
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
  snapshotGroupsData: SnapshotGroupWithTotal[];
  isLoading: boolean;
  fetchError: string | null;
  onSnapshotDeleted: () => void; // Callback para atualizar a lista na ReportsPage
  // refreshKey pode ser removido se a atualização dos dados for gerenciada pelo pai através das novas props
}

const SnapshotHistoryTable: React.FC<SnapshotHistoryTableProps> = ({ snapshotGroupsData, isLoading, fetchError, onSnapshotDeleted }) => {
  const { user } = useAuth(); // User ainda pode ser útil para outras lógicas, como permissões futuras

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({}); // <-- ESTADO PARA LINHAS EXPANDIDAS
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] = useState<SnapshotGroupWithTotal | null>(null);

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

    const handleDuplicateSnapshot = async (snapshotToDuplicate: SnapshotGroupWithTotal) => {
    if (!snapshotToDuplicate || !user) return;

    try {
      // 1. Criar novo grupo de snapshot
      const { data: newGroup, error: groupError } = await supabase
        .from('snapshot_groups')
        .insert({
          user_id: user.id,
          notes: `Cópia de: ${snapshotToDuplicate.notes || new Date(snapshotToDuplicate.created_at).toLocaleDateString('pt-BR')}`,
        })
        .select()
        .single();

      if (groupError) throw new Error(`Falha ao criar novo grupo: ${groupError.message}`);
      if (!newGroup) throw new Error('Novo grupo de snapshot não foi retornado após a criação.');

      // 2. Preparar os itens do snapshot original para duplicação
      const originalItems = snapshotToDuplicate.snapshot_items;
      if (!originalItems || originalItems.length === 0) {
        toast.info("Snapshot original não continha itens, um snapshot vazio foi criado.");
        onSnapshotDeleted(); // Refresh
        return;
      }

      const newItems = originalItems.map(item => ({
        snapshot_group_id: newGroup.id,
        asset_id: item.asset_id,
        asset_name: item.asset_name,
        asset_category_name: item.asset_category_name,
        total_value_brl: item.total_value_brl,
        is_crypto_total: item.is_crypto_total,
      }));

      // 3. Inserir os novos itens em lote
      const { error: itemsError } = await supabase.from('snapshot_items').insert(newItems);

      if (itemsError) {
        // Rollback: se a inserção de itens falhar, exclua o grupo recém-criado
        await supabase.from('snapshot_groups').delete().eq('id', newGroup.id);
        throw new Error(`Falha ao duplicar itens do snapshot: ${itemsError.message}`);
      }

      toast.success("Snapshot duplicado com sucesso!");
      onSnapshotDeleted(); // Atualiza a lista na página de relatórios

    } catch (error: any) {
      console.error("Erro ao duplicar snapshot:", error);
      toast.error(error.message || "Erro desconhecido ao duplicar snapshot.");
    }
  };

  const confirmDelete = async () => {
    if (!snapshotToDelete || !user) return;

    try {
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
    }
  };

  if (isLoading) return <p className="text-center p-4">Carregando histórico...</p>;
  if (fetchError) return <p className="text-center p-4 text-destructive">Erro ao carregar histórico: {fetchError}</p>;
  if (snapshotGroupsData.length === 0) {
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
            <TableHead className="w-[120px] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {snapshotGroupsData.map((group) => (
            <React.Fragment key={group.id}>
              <TableRow 
                className="hover:bg-muted/50 data-[state=open]:bg-muted/50 cursor-pointer"
                onClick={() => toggleRowExpansion(group.id)}
                data-state={expandedRows[group.id] ? 'open' : 'closed'}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {expandedRows[group.id] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    {new Date(group.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate" title={group.notes || undefined}>
                  {group.notes || '-'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {group.totalPatrimonioGrupo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}> {/* Impede que o clique na área de ações expanda/recolha a linha */}
                  <div className="flex justify-center items-center space-x-1">
                     <Button variant="ghost" size="icon" onClick={() => handleDuplicateSnapshot(group)} aria-label="Duplicar snapshot">
                      <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(group)} aria-label="Excluir snapshot">
                      <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedRows[group.id] && (
                <TableRow className="bg-muted/20 hover:bg-muted/40">
                  <TableCell colSpan={4} className="p-0">
                    <div className="p-4">
                      <SnapshotItemsTable items={group.snapshot_items} onUpdate={onSnapshotDeleted} />
                    </div>
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
