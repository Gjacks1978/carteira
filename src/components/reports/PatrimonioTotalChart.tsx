import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SnapshotGroupWithTotal } from '@/types/reports';


interface PatrimonioTotalChartProps {
  snapshotGroupsData: SnapshotGroupWithTotal[];
  isLoading: boolean;
}

const formatCurrencyForAxis = (value: number) => {
  if (value >= 1000000)
    return `R$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000)
    return `R$${(value / 1000).toFixed(0)}K`;
  return `R$${value.toFixed(0)}`;
};

const formatDateForAxis = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border shadow-lg p-3 rounded-md">
        <p className="label text-sm text-foreground">{`Data: ${new Date(label).toLocaleDateString('pt-BR')}`}</p>
        <p className="intro text-sm text-blue-500">{`Total: ${payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
      </div>
    );
  }
  return null;
};

const PatrimonioTotalChart: React.FC<PatrimonioTotalChartProps> = ({ snapshotGroupsData, isLoading }) => {
  const chartData = React.useMemo(() => {
    if (!snapshotGroupsData || snapshotGroupsData.length === 0) return [];
    // Sort data by date ascending for line chart
    return [...snapshotGroupsData]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(group => ({
        date: group.created_at, // Keep original for tooltip label
        formattedDate: formatDateForAxis(group.created_at),
        'Valor Total': group.totalPatrimonioGrupo,
      }));
  }, [snapshotGroupsData]);

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Carregando gráfico...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Dados insuficientes para exibir o gráfico.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis 
          dataKey="formattedDate" 
          tick={{ fontSize: 12 }}
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis 
          tickFormatter={formatCurrencyForAxis} 
          tick={{ fontSize: 12 }} 
          stroke="hsl(var(--muted-foreground))"
          width={80}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Legend wrapperStyle={{fontSize: "14px"}} />
        <Line type="monotone" dataKey="Valor Total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PatrimonioTotalChart;
