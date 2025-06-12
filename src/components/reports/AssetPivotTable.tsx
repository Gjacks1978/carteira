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

const formatCurrency = (value: number | null) => {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const PerformanceCell: React.FC<{ value: number | null; previousValue: number | null }> = ({ value, previousValue }) => {
  let textColorClass = ''; // Default color

  if (value !== null && previousValue !== null) {
    if (value > previousValue) {
      textColorClass = 'text-green-600 dark:text-green-500';
    } else if (value < previousValue) {
      textColorClass = 'text-red-600 dark:text-red-500';
    }
  }

  return (
    <span className={textColorClass}>
      {formatCurrency(value)}
    </span>
  );
};

interface AssetEvolutionRow {
  uniqueKey: string;
  assetName: string;
  assetCategory: string | null;
  values: (number | null)[];
}

const AssetPivotTable: React.FC<AssetPivotTableProps> = ({ snapshotGroupsData, isLoading, fetchError }) => {
  const processedData = React.useMemo(() => {
    if (!snapshotGroupsData || snapshotGroupsData.length === 0) {
      return { dateColumns: [], assetRows: [] };
    }

    // Sort snapshot groups by date ascending (oldest first)
    const sortedGroups = [...snapshotGroupsData].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const dateColumns = sortedGroups.map(group => group.created_at);
    const formattedDateColumns = dateColumns.map(formatDate);

    const assetRowsMap = new Map<string, AssetEvolutionRow>();

    sortedGroups.forEach((group, dateIndex) => {
      group.snapshot_items.forEach(item => {
        const uniqueKey = item.is_crypto_total ? 'CRYPTO_TOTAL_CONSOLIDATED' : item.asset_id;
        if (!uniqueKey) return; // Should not happen for non-crypto if asset_id is guaranteed

        if (!assetRowsMap.has(uniqueKey)) {
          assetRowsMap.set(uniqueKey, {
            uniqueKey,
            assetName: item.asset_name,
            assetCategory: item.asset_category_name,
            values: Array(dateColumns.length).fill(null),
          });
        }
        const assetRow = assetRowsMap.get(uniqueKey)!;
        // Ensure assetName and category are updated if they somehow change (e.g. for crypto total if name was generic initially)
        // For most assets, these should be consistent if asset_id is the key.
        assetRow.assetName = item.asset_name; 
        assetRow.assetCategory = item.asset_category_name;
        assetRow.values[dateIndex] = item.total_value_brl;
      });
    });

    const calculatedAssetRows = Array.from(assetRowsMap.values());

    const totalRowValues: (number | null)[] = Array(dateColumns.length).fill(null);
    if (calculatedAssetRows.length > 0) {
      for (let i = 0; i < dateColumns.length; i++) {
        let sumForDate: number | null = 0;
        let hasNonNullValue = false;
        calculatedAssetRows.forEach(row => {
          if (row.values[i] !== null) {
            sumForDate = (sumForDate === null ? 0 : sumForDate) + row.values[i]!;
            hasNonNullValue = true;
          }
        });
        totalRowValues[i] = hasNonNullValue ? sumForDate : null;
      }
    }

    const totalRow: AssetEvolutionRow | null = calculatedAssetRows.length > 0 ? {
      uniqueKey: 'GRAND_TOTAL',
      assetName: 'TOTAL',
      assetCategory: '', // No category for total
      values: totalRowValues,
    } : null;

    return { dateColumns: formattedDateColumns, assetRows: calculatedAssetRows, totalRow };
  }, [snapshotGroupsData]);

  if (isLoading) return <p className="text-center text-muted-foreground py-8">Carregando dados...</p>;
  if (fetchError) return <p className="text-center text-destructive py-8">Erro ao carregar dados: {fetchError}</p>;
  if (!snapshotGroupsData || snapshotGroupsData.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Nenhum snapshot registrado para análise.</p>;
  }

  const { dateColumns, assetRows, totalRow } = processedData;

  if (assetRows.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Nenhum item de snapshot encontrado para exibir na tabela de evolução.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução de Ativos ao Longo do Tempo</CardTitle>
        <CardDescription>
          Acompanhe a variação de valor de cada ativo através dos snapshots.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card z-10">Ativo</TableHead>
              <TableHead>Categoria</TableHead>
              {dateColumns.map((date, index) => (
                <TableHead key={`${date}-${index}`} className="text-right">{date}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {assetRows.map((row, rowIndex) => (
              <TableRow key={row.uniqueKey} className={rowIndex % 2 === 0 ? 'bg-muted/25' : ''}>
                <TableCell className={`font-medium sticky left-0 z-10 ${rowIndex % 2 === 0 ? 'bg-muted/25' : 'bg-card'}`}>{row.assetName}</TableCell>
                <TableCell>{row.assetCategory || '-'}</TableCell>
                {row.values.map((value, valueIndex) => (
                  <TableCell key={`${row.uniqueKey}-val-${valueIndex}`} className="text-right">
                    <PerformanceCell value={value} previousValue={valueIndex > 0 ? row.values[valueIndex - 1] : null} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          {totalRow && (
            <TableBody className="border-t-2 border-primary">
              <TableRow className="bg-muted/50 hover:bg-muted/60">
                <TableCell className="font-bold sticky left-0 bg-muted/50 z-10">{totalRow.assetName}</TableCell>
                <TableCell className="font-bold">{totalRow.assetCategory}</TableCell>
                {totalRow.values.map((value, index) => (
                  <TableCell key={`total-val-${index}`} className="text-right font-bold">{formatCurrency(value)}</TableCell>
                ))}
              </TableRow>
            </TableBody>
          )}
        </Table>
      </CardContent>
    </Card>
  );
};

export default AssetPivotTable;
