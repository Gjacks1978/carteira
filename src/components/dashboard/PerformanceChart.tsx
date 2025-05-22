
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
import { investmentData } from "@/data/mockData";

interface PerformanceChartProps {
  period: "1m" | "3m" | "6m" | "1y" | "all";
}

const PerformanceChart = ({ period }: PerformanceChartProps) => {
  const { performanceData } = investmentData;
  
  // Filter data based on selected period
  const filterData = () => {
    switch (period) {
      case "1m":
        return performanceData.slice(-30);
      case "3m":
        return performanceData.slice(-90);
      case "6m":
        return performanceData.slice(-180);
      case "1y":
        return performanceData.slice(-365);
      case "all":
      default:
        return performanceData;
    }
  };

  const filteredData = filterData();

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
            name="Benchmark"
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
