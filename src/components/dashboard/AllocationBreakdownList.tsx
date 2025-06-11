import React from 'react';



interface AllocationItem {
  name: string;
  value: number;
}

interface AllocationBreakdownListProps {
  data: AllocationItem[];
  totalValue: number;
  colorMap: Map<string, string>;
}

const AllocationBreakdownList: React.FC<AllocationBreakdownListProps> = ({ data, totalValue, colorMap }) => {
  if (!data || data.length === 0 || totalValue === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Dados de alocação indisponíveis.</p>;
  }

  // Sort data by value descending for display
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-3 pt-4">
      {sortedData.map((item, index) => {
        const percentage = (item.value / totalValue) * 100;
                const barColor = colorMap.get(item.name) || '#cccccc';

        return (
          <div key={item.name} className="text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium truncate max-w-[50%]">{item.name}</span>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2 tabular-nums">{percentage.toFixed(1)}%</span>
                <span className="font-semibold tabular-nums">
                  {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ width: `${percentage}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllocationBreakdownList;
