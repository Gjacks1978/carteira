import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Asset } from "@/types/assets";

interface AssetsSummaryCardsProps {
  assets: Asset[];
  totalCryptoValue: number;
}

const AssetsSummaryCards = ({ assets, totalCryptoValue }: AssetsSummaryCardsProps) => {
  // Calcular métricas totais para os ativos desta página
  const totalAllocatedAssets = assets.reduce((sum, asset) => sum + asset.current_total_value_brl, 0);
  const assetCount = assets.length;
  
  // Calcular alocação por setor/tipo
  const allocationBySector = assets.reduce((acc, asset) => {
    const sector = asset.type || "Outros"; // Usando type como setor para ativos
    acc[sector] = (acc[sector] || 0) + asset.current_total_value_brl;
    return acc;
  }, {} as Record<string, number>);

  // Encontrar o maior setor
  const largestSector = Object.entries(allocationBySector).reduce(
    (max, [sector, value]) => value > max.value ? { sector, value } : max,
    { sector: "N/A", value: 0 }
  );

  // Calcular percentual da carteira
  const grandTotalPortfolio = totalAllocatedAssets + totalCryptoValue;
  const calculatedPortfolioPercentage = grandTotalPortfolio > 0 
    ? (totalAllocatedAssets / grandTotalPortfolio) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Alocado (Ativos)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalAllocatedAssets.toLocaleString("pt-BR", {
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
          <CardTitle className="text-sm font-medium">Alocação (Setores Ativos)</CardTitle>
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
          <CardTitle className="text-sm font-medium">Maior Setor (Ativos)</CardTitle>
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
          <CardTitle className="text-sm font-medium">% Ativos na Carteira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {calculatedPortfolioPercentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            De R$ {grandTotalPortfolio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} no portfólio total
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetsSummaryCards;
