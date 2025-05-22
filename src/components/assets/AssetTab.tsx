
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Download } from "lucide-react";
import { Asset } from "@/types/assets";
import { calculateTabMetrics } from "@/lib/assetUtils";
import AssetsTable from "./AssetsTable";
import AddAssetForm from "./AddAssetForm";
import { useToast } from "@/hooks/use-toast";

interface AssetTabProps {
  tabId: string;
  assets: Asset[];
}

const AssetTab = ({ tabId, assets: initialAssets }: AssetTabProps) => {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [openAddAssetDialog, setOpenAddAssetDialog] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: "",
    ticker: "",
    type: "",
    price: 0,
    quantity: 0,
    total: 0,
  });
  const { toast } = useToast();

  const metrics = calculateTabMetrics(assets);
  
  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.ticker) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    const calculatedTotal = (newAsset.price || 0) * (newAsset.quantity || 0);
    
    const asset: Asset = {
      id: Date.now().toString(),
      name: newAsset.name || "",
      ticker: newAsset.ticker || "",
      type: newAsset.type || "Outros",
      price: newAsset.price || 0,
      quantity: newAsset.quantity || 0,
      total: calculatedTotal,
      return: 0,
      returnPercentage: 0,
    };
    
    setAssets([...assets, asset]);
    setOpenAddAssetDialog(false);
    setNewAsset({
      name: "",
      ticker: "",
      type: "",
      price: 0,
      quantity: 0,
      total: 0,
    });
    
    toast({
      title: "Ativo adicionado",
      description: `${asset.name} (${asset.ticker}) foi adicionado com sucesso`,
    });
  };
  
  const handleUpdateAsset = (updatedAsset: Asset) => {
    const updatedAssets = assets.map((asset) =>
      asset.id === updatedAsset.id ? updatedAsset : asset
    );
    setAssets(updatedAssets);
  };
  
  const handleDeleteAsset = (id: string) => {
    const assetToDelete = assets.find((asset) => asset.id === id);
    const updatedAssets = assets.filter((asset) => asset.id !== id);
    setAssets(updatedAssets);
    
    if (assetToDelete) {
      toast({
        title: "Ativo removido",
        description: `${assetToDelete.name} (${assetToDelete.ticker}) foi removido com sucesso`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alocado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.assetCount} ativos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageReturn > 0 ? "+" : ""}
              {metrics.averageReturn.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Retorno médio dos ativos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% da Carteira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.percentOfPortfolio.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Do portfólio total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Posição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.largestPosition?.ticker || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.largestPosition
                ? `${(metrics.largestPositionPercentage).toFixed(2)}% desta categoria`
                : "Sem ativos"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Lista de Ativos</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={openAddAssetDialog} onOpenChange={setOpenAddAssetDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Ativo
              </Button>
            </DialogTrigger>
            <AddAssetForm
              title="Adicionar Novo Ativo"
              description="Insira os detalhes do novo ativo."
              buttonLabel="Adicionar"
              fields={[
                {
                  name: "name",
                  label: "Nome",
                  type: "text",
                  placeholder: "Ex: Tesouro IPCA+",
                  value: newAsset.name,
                  onChange: (e) => setNewAsset({ ...newAsset, name: e.target.value }),
                },
                {
                  name: "ticker",
                  label: "Ticker/Código",
                  type: "text",
                  placeholder: "Ex: IPCA+2026",
                  value: newAsset.ticker,
                  onChange: (e) => setNewAsset({ ...newAsset, ticker: e.target.value }),
                },
                {
                  name: "type",
                  label: "Tipo",
                  type: "text",
                  placeholder: "Ex: Tesouro Direto",
                  value: newAsset.type,
                  onChange: (e) => setNewAsset({ ...newAsset, type: e.target.value }),
                },
                {
                  name: "price",
                  label: "Preço Unitário (R$)",
                  type: "number",
                  placeholder: "Ex: 1000",
                  value: newAsset.price,
                  onChange: (e) => {
                    const price = parseFloat(e.target.value);
                    const quantity = newAsset.quantity || 0;
                    setNewAsset({ 
                      ...newAsset, 
                      price,
                      total: price * quantity
                    });
                  },
                },
                {
                  name: "quantity",
                  label: "Quantidade",
                  type: "number",
                  placeholder: "Ex: 10",
                  value: newAsset.quantity,
                  onChange: (e) => {
                    const quantity = parseFloat(e.target.value);
                    const price = newAsset.price || 0;
                    setNewAsset({ 
                      ...newAsset, 
                      quantity,
                      total: price * quantity
                    });
                  },
                },
              ]}
              onSubmit={handleAddAsset}
            />
          </Dialog>
        </div>
      </div>
      
      <AssetsTable 
        assets={assets}
        onUpdate={handleUpdateAsset}
        onDelete={handleDeleteAsset}
      />
    </div>
  );
};

export default AssetTab;
