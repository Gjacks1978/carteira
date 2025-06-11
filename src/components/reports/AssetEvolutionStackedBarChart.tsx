import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SnapshotGroupWithTotal, SnapshotItem } from '@/types/reports';


interface AssetEvolutionStackedBarChartProps {
  snapshotGroupsData: SnapshotGroupWithTotal[];
  isLoading: boolean;
}

const formatDateForAxis = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
};

const formatCurrencyForAxis = (value: number) => {
  if (value >= 1000000)
    return `R$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000)
    return `R$${(value / 1000).toFixed(0)}K`;
  return `R$${value.toFixed(0)}`;
};

// Placeholder for data transformation and color generation
const processDataForStackedBarChart = (snapshotGroups: SnapshotGroupWithTotal[]) => {
  if (!snapshotGroups || snapshotGroups.length === 0) return { chartData: [], assetKeys: [] };

  const sortedGroups = [...snapshotGroups]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const assetKeysSet = new Set<string>();
  sortedGroups.forEach(group => {
    group.snapshot_items.forEach(item => {
      // Use asset_name for keys; consider a more robust unique ID if names can change but ID remains
      // For simplicity, using asset_name. Handle 'Total Cripto (R$)' as a distinct asset.
      const key = item.is_crypto_total && item.asset_name.includes('Cripto Consolidado') ? 'Total Cripto (R$)' : item.asset_name;
      assetKeysSet.add(key);
    });
  });
  const assetKeys = Array.from(assetKeysSet);

  const chartData = sortedGroups.map(group => {
    const entry: any = {
      date: group.created_at,
      formattedDate: formatDateForAxis(group.created_at),
    };
    assetKeys.forEach(key => entry[key] = 0); // Initialize all asset values to 0 for this date

    group.snapshot_items.forEach(item => {
      const key = item.is_crypto_total && item.asset_name.includes('Cripto Consolidado') ? 'Total Cripto (R$)' : item.asset_name;
      if (assetKeys.includes(key)) { // Ensure the key is one we're tracking
         entry[key] = (entry[key] || 0) + (item.total_value_brl || 0);
      }
    });
    return entry;
  });

  return { chartData, assetKeys };
};

// Generate distinct colors for assets
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FFC658', '#A4DE6C', '#D0ED57', '#FF7300',
  '#4CAF50', '#F44336', '#E91E63', '#9C27B0', '#3F51B5'
];

const AssetEvolutionStackedBarChart: React.FC<AssetEvolutionStackedBarChartProps> = ({ snapshotGroupsData, isLoading }) => {
  const { chartData, assetKeys } = React.useMemo(
    () => processDataForStackedBarChart(snapshotGroupsData),
    [snapshotGroupsData]
  );

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Carregando gráfico...</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0 || assetKeys.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Dados insuficientes para exibir o gráfico.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 50 /* Increased bottom margin for legend */ }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
        <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" interval={0} stroke="hsl(var(--muted-foreground))" />
        <YAxis tickFormatter={formatCurrencyForAxis} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={80}/>
        <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <Legend wrapperStyle={{fontSize: "12px", paddingTop: "20px"}} />
        {assetKeys.map((key, index) => (
          <Bar key={key} dataKey={key} stackId="a" fill={COLORS[index % COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AssetEvolutionStackedBarChart;
