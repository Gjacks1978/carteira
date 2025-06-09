import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SnapshotGroupWithTotal } from '@/types/reports';

// TODO: Definir tipos de props quando soubermos quais dados serão necessários
interface AssetPivotTableProps {
  snapshotGroupsData: SnapshotGroupWithTotal[];
  isLoading: boolean;
  fetchError: string | null;
}

const AssetPivotTable: React.FC<AssetPivotTableProps> = ({ snapshotGroupsData, isLoading, fetchError }) => {
  // Lógica para processar os dados e transformá-los para a visualização pivotada
  // Por enquanto, apenas um placeholder

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução de Ativos ao Longo do Tempo</CardTitle>
        <CardDescription>
          Acompanhe a variação de quantidade e valor de cada ativo através dos snapshots.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-center text-muted-foreground py-8">Carregando dados...</p>}
        {fetchError && <p className="text-center text-destructive py-8">Erro ao carregar dados: {fetchError}</p>}
        {!isLoading && !fetchError && snapshotGroupsData.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhum snapshot registrado para análise.</p>
        )}
        {!isLoading && !fetchError && snapshotGroupsData.length > 0 && (
          <p className="text-center text-muted-foreground py-8">
            Implementação da tabela pivotada por ativo pendente. {snapshotGroupsData.length} grupo(s) de snapshot carregado(s).
          </p>
        )}
        {/* 
          Futura implementação da tabela pivotada:
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead>Snapshot 1 (Data)</TableHead>
                <TableHead>Snapshot 2 (Data)</TableHead>
                <TableHead>...</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              // Exemplo de linha:
              // <TableRow>
              //   <TableCell>BTC</TableCell>
              //   <TableCell>Qtd: 1, Valor: R$ X</TableCell>
              //   <TableCell>Qtd: 1.1, Valor: R$ Y</TableCell>
              //   <TableCell>...</TableCell>
              // </TableRow>
            </TableBody>
          </Table>
        */}
      </CardContent>
    </Card>
  );
};

export default AssetPivotTable;
