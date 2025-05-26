
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6"];

interface AllocationChartProps {
  data?: Array<{name: string, value: number}>;
}

const AllocationChart = ({ data }: AllocationChartProps) => {
  // Default empty data if none provided
  const chartData = data && data.length > 0 ? data : [
    { name: "Sem dados", value: 1 }
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={90}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => 
              data && data.length > 0 
                ? `${name} ${(percent * 100).toFixed(0)}%`
                : ""
            }
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => 
              data && data.length > 0
                ? `${Number(value).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}`
                : "Sem dados"
            }
          />
          {data && data.length > 0 && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;
