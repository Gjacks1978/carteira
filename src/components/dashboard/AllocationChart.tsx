
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = [
  "hsl(260, 70%, 60%)", // Roxo vibrante
  "hsl(217, 91%, 60%)", // Azul
  "hsl(142, 76%, 36%)", // Verde
  "hsl(37, 100%, 50%)", // Amarelo
  "hsl(0, 84%, 60%)",  // Vermelho
  "hsl(276, 70%, 50%)"  // Roxo mais escuro
];

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
              fontWeight: 500
            }}
            labelStyle={{ 
              color: 'hsl(var(--foreground))',
              fontWeight: 600,
              marginBottom: '4px'
            }}
            formatter={(value) => 
              data && data.length > 0
                ? `${Number(value).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}`
                : "Sem dados"
            }
          />
          {data && data.length > 0 && (
            <Legend 
              wrapperStyle={{
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.75rem',
              paddingTop: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px'
            }}
            formatter={(value, entry: any, index) => {
              // Adiciona o valor percentual ao lado do nome da legenda
              const percent = (entry.payload.payload.percent * 100).toFixed(1);
              return `${entry.payload.name} (${percent}%)`;
            }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;
