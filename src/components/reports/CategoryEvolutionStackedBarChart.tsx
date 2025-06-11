import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SnapshotGroupWithTotal } from '@/types/reports';
import { getCategoryColorMap } from '@/lib/chart-colors';

interface CategoryEvolutionStackedBarChartProps {
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

const processDataForCategoryStackedBarChart = (snapshotGroups: SnapshotGroupWithTotal[]) => {
  if (!snapshotGroups || snapshotGroups.length === 0) return { chartData: [], categoryKeys: [], colorMap: new Map() };

  const sortedGroups = [...snapshotGroups]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const categoryKeysSet = new Set<string>();
  sortedGroups.forEach(group => {
    group.snapshot_items.forEach(item => {
      categoryKeysSet.add(item.asset_category_name || 'Sem Categoria');
    });
  });
  const categoryKeys = Array.from(categoryKeysSet);
  const colorMap = getCategoryColorMap(categoryKeys);

  const chartData = sortedGroups.map(group => {
    const entry: any = {
      date: group.created_at,
      formattedDate: formatDateForAxis(group.created_at),
    };
    categoryKeys.forEach(key => entry[key] = 0);

    group.snapshot_items.forEach(item => {
      const key = item.asset_category_name || 'Sem Categoria';
      if (categoryKeys.includes(key)) {
         entry[key] = (entry[key] || 0) + (item.total_value_brl || 0);
      }
    });
    return entry;
  });

  return { chartData, categoryKeys, colorMap };
};

const CategoryEvolutionStackedBarChart: React.FC<CategoryEvolutionStackedBarChartProps> = ({ snapshotGroupsData, isLoading }) => {
  const { chartData, categoryKeys, colorMap } = React.useMemo(
    () => processDataForCategoryStackedBarChart(snapshotGroupsData),
    [snapshotGroupsData]
  );

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Carregando gráfico...</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0 || categoryKeys.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Dados insuficientes para exibir o gráfico.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
        <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" interval={0} stroke="hsl(var(--muted-foreground))" />
        <YAxis tickFormatter={formatCurrencyForAxis} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={80}/>
        <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <Legend wrapperStyle={{fontSize: "12px", paddingTop: "20px"}} />
        {categoryKeys.map((key) => (
          <Bar key={key} dataKey={key} stackId="a" fill={colorMap.get(key) || '#8884d8'} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryEvolutionStackedBarChart;
