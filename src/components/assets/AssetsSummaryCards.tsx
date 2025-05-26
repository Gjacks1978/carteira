import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Asset } from "@/types/assets";

interface AssetsSummaryCardsProps {
  assets: Asset[];
}

const AssetsSummaryCards = ({ assets }: AssetsSummaryCardsProps) => {
  // Calcular métricas totais
  const totalAllocated = assets.reduce((sum, asset) => sum + asset.total, 0);
  const assetCount = assets.length;
  
  // Calcular alocação por setor/tipo
  const allocationBySector = assets.reduce((acc, asset) => {
    const sector = asset.type || "Outros";
    acc[sector] = (acc[sector] || 0) + asset.total;
    return acc;
  }, {} as Record<string, number>);

  // Encontrar o maior setor
  const largestSector = Object.entries(allocationBySector).reduce(
    (max, [sector, value]) => value > max.value ? { sector, value } : max,
    { sector: "N/A", value: 0 }
  );

  // Calcular percentual da carteira (assumindo um total de portfólio)
  // Para uma implementação real, isso viria de um contexto global ou API
  const portfolioPercentage = 100; // Placeholder - seria calculado com base no portfólio total

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Alocado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalAllocated.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {assetCount} ativos
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alocação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Object.keys(allocationBySector).length}
          </div>
          <p className="text-xs text-muted-foreground">
            Setores diferentes
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maior Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{largestSector.sector}</div>
          <p className="text-xs text-muted-foreground">
            {largestSector.value.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">% da Carteira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {portfolioPercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            Do portfólio total
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetsSummaryCards;
