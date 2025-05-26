import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Asset } from "@/types/assets";
import { PieChart } from "lucide-react"; // Usando um ícone diferente para diferenciar

interface ClassAllocationItem {
  className: string;
  totalBRL: number;
  percentage: number;
}

interface AllocationByClassCardProps {
  assets: Asset[];
}

export const AllocationByClassCard: React.FC<AllocationByClassCardProps> = ({ assets }) => {
  if (!assets || assets.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alocação por Classe</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum ativo para exibir alocação.</p>
        </CardContent>
      </Card>
    );
  }

  const totalPortfolioValueBRL = assets.reduce((sum, asset) => sum + asset.total, 0);
  
  const allocationByClass: { [key: string]: number } = assets.reduce((acc, asset) => {
    const assetClass = asset.type || "Não Classificado"; // Usa 'type' como classe
    acc[assetClass] = (acc[assetClass] || 0) + asset.total;
    return acc;
  }, {} as { [key: string]: number });

  const classAllocationItems: ClassAllocationItem[] = Object.entries(allocationByClass)
    .map(([className, totalBRL]) => ({
      className,
      totalBRL,
      percentage: totalPortfolioValueBRL > 0 ? (totalBRL / totalPortfolioValueBRL) * 100 : 0,
    }))
    .sort((a, b) => b.totalBRL - a.totalBRL); // Ordena do maior para o menor

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Alocação por Classe</CardTitle>
        <PieChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {classAllocationItems.map((item) => (
          <div key={item.className} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium truncate max-w-[120px] sm:max-w-[150px]" title={item.className}>{item.className}</span>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">
                  {item.percentage.toFixed(1)}%
                </span>
                <span className="font-semibold">
                  {item.totalBRL.toLocaleString("pt-BR", { // Usando pt-BR para BRL
                    style: "currency",
                    currency: "BRL", // Moeda BRL
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full" // Pode variar a cor se quiser
                style={{ width: `${item.percentage.toFixed(1)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
