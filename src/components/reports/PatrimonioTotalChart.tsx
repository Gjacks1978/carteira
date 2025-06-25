import React from 'react';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
        <XAxis 
          dataKey="formattedDate" 
          tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })} 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
          width={80}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--foreground))'
          }}
          labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
          formatter={(value: number) => [value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Patrimônio']}
        />
        <Area type="monotone" dataKey="Valor Total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
        <Line type="monotone" dataKey="Valor Total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PatrimonioTotalChart;
