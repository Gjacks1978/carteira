import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectorAllocationItem } from "@/types/assets";
import { Coins } from "lucide-react"; // Using a generic icon for now

interface AllocationBySectorCardProps {
  sectorAllocation?: SectorAllocationItem[];
}

export const AllocationBySectorCard: React.FC<AllocationBySectorCardProps> = ({ sectorAllocation }) => {
  if (!sectorAllocation || sectorAllocation.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alocação por Setor</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum dado de setor para exibir.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Alocação por Setor</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {sectorAllocation.map((item) => (
          <div key={item.sectorName} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium truncate max-w-[120px] sm:max-w-[150px]" title={item.sectorName}>{item.sectorName}</span>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">
                  {item.percentage.toFixed(1)}%
                </span>
                <span className="font-semibold">
                  {item.totalUSD.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${item.percentage.toFixed(1)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
