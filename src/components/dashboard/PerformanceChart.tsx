
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SnapshotGroupWithTotal } from '@/types/reports'; // Import the type

interface PerformanceChartProps {
  period: "1m" | "3m" | "6m" | "1y" | "all";
  portfolioHistoryData: Array<{ date: string; portfolio: number; benchmark?: number }>; // Expecting pre-processed data
  isLoading?: boolean;
}

const PerformanceChart = ({ period, portfolioHistoryData, isLoading }: PerformanceChartProps) => {
  // Filter data based on selected period
  // Note: The period filtering logic might need adjustment if portfolioHistoryData isn't daily.
  // For now, it assumes portfolioHistoryData is already sorted by date.
  const filterData = () => {
    if (!portfolioHistoryData) return [];
    // This slicing logic assumes daily data points. 
    // If snapshot data is not daily, this period filtering might not be accurate.
    // A more robust solution would filter by actual date ranges.
    switch (period) {
      case "1m":
        return portfolioHistoryData.slice(-30); // Approx 1 month if daily
      case "3m":
        return portfolioHistoryData.slice(-90); // Approx 3 months if daily
      case "6m":
        return portfolioHistoryData.slice(-180); // Approx 6 months if daily
      case "1y":
        return portfolioHistoryData.slice(-365); // Approx 1 year if daily
      case "all":
      default:
        return portfolioHistoryData;
    }
  };

  const filteredData = filterData();

  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dados de performance...</p>
      </div>
    );
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Dados de performance indisponíveis para o período.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={filteredData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--muted-foreground))" 
            opacity={0.2}
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            tick={{ 
              fontSize: 11, 
              fill: 'hsl(var(--muted-foreground))',
              fontFamily: 'Inter, sans-serif'
            }} 
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => value.split("-").slice(1).reverse().join("/")} 
          />
          <YAxis 
            tick={{ 
              fontSize: 11, 
              fill: 'hsl(var(--muted-foreground))',
              fontFamily: 'Inter, sans-serif'
            }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => 
              `R$${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` 
            }
            width={90}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            itemStyle={{ 
              color: 'hsl(var(--foreground))',
              fontSize: '0.875rem',
              fontWeight: 500,
              padding: '2px 0'
            }}
            labelStyle={{ 
              color: 'hsl(var(--foreground))',
              fontWeight: 600,
              marginBottom: '4px',
              fontSize: '0.875rem'
            }}
            formatter={(value, name, props) => [
              Number(value).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }),
              name
            ]}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString("pt-BR", {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
            }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '10px',
              fontSize: '0.75rem',
              color: 'hsl(var(--muted-foreground))'
            }}
            formatter={(value) => (
              <span style={{ color: 'hsl(var(--foreground))' }}>
                {value}
              </span>
            )}
          />
          <Line
            type="monotone"
            dataKey="portfolio"
            name="Portfólio"
            stroke="hsl(260, 70%, 60%)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ 
              r: 6, 
              stroke: 'hsl(var(--card))',
              strokeWidth: 2,
              fill: 'hsl(260, 70%, 60%)'
            }}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Line
            type="monotone"
            dataKey="benchmark"
            name="Benchmark" // Benchmark line will be empty if no benchmark data is provided
            display={filteredData.some(d => d.benchmark !== undefined) ? 'inline' : 'none'}
            stroke="hsl(217, 91%, 60%)"
            strokeWidth={2.5}
            dot={false}
            strokeDasharray="4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            activeDot={{ 
              r: 6, 
              stroke: 'hsl(var(--card))',
              strokeWidth: 2,
              fill: 'hsl(217, 91%, 60%)'
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
