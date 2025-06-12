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
import { ChevronDown, ChevronRight, Copy, Trash2, Pencil } from 'lucide-react';
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
  onDelete: (snapshot: SnapshotGroupWithTotal) => void;
  onDuplicate: (snapshotId: string) => void;
  onRefresh: () => void;
  onEdit: (snapshot: SnapshotGroupWithTotal) => void;
}

const SnapshotHistoryTable: React.FC<SnapshotHistoryTableProps> = ({ snapshotGroupsData, isLoading, onDelete, onDuplicate, onRefresh, onEdit }) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] = useState<SnapshotGroupWithTotal | null>(null);

  const toggleRowExpansion = (groupId: string) => {
    setExpandedRows(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleDeleteClick = (snapshot: SnapshotGroupWithTotal) => {
    setSnapshotToDelete(snapshot);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (snapshotToDelete) {
      onDelete(snapshotToDelete);
    }
    setIsDeleteDialogOpen(false);
    setSnapshotToDelete(null);
  };

  if (isLoading) return <p className="text-center p-4">Carregando histórico...</p>;
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
                    <Button variant="ghost" size="icon" onClick={() => onEdit(group)} aria-label="Editar snapshot">
                      <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDuplicate(group.id)} aria-label="Duplicar snapshot">
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
                      <SnapshotItemsTable items={group.snapshot_items} onUpdate={onRefresh} />
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
