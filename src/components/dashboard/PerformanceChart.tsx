
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
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
            tickFormatter={(value) => value.split("-").slice(1).reverse().join("/")} 
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => 
              `R$${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` 
            }
          />
          <Tooltip 
            formatter={(value) => 
              Number(value).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            } 
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString("pt-BR");
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="portfolio"
            name="Portfólio"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="benchmark"
            name="Benchmark" // Benchmark line will be empty if no benchmark data is provided
            display={filteredData.some(d => d.benchmark !== undefined) ? 'inline' : 'none'}
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
