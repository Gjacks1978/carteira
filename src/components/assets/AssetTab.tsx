
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Download, Loader2 } from "lucide-react";
import { Asset } from "@/types/assets";
import { calculateTabMetrics } from "@/lib/assetUtils";
import AssetsTable from "./AssetsTable";
import AddAssetForm from "./AddAssetForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AssetTabProps {
  tabId: string;
  categoryId?: string;
}

const AssetTab = ({ tabId, categoryId }: AssetTabProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [openAddAssetDialog, setOpenAddAssetDialog] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: "",
    ticker: "",
    type: "",
    price: 0,
    quantity: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchAssets();
  }, [tabId, categoryId]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      
      const categoryFilter = categoryId 
        ? { category_id: categoryId }
        : { category_id: null }; // This should be replaced with proper category lookup
      
      let query = supabase
        .from("assets")
        .select("*");
      
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform database format to Asset type
        const transformedAssets = data.map(item => ({
          id: item.id,
          name: item.name,
          ticker: item.ticker,
          type: item.type,
          price: Number(item.price),
          quantity: Number(item.quantity),
          total: Number(item.total),
          return: Number(item.return_value),
          returnPercentage: Number(item.return_percentage),
        }));
        
        setAssets(transformedAssets);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar ativos",
        description: "Não foi possível carregar a lista de ativos."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddAsset = async () => {
    if (!newAsset.name || !newAsset.ticker) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    const calculatedTotal = (newAsset.price || 0) * (newAsset.quantity || 0);
    
    try {
      const { data, error } = await supabase
        .from("assets")
        .insert([
          {
            user_id: user?.id,
            name: newAsset.name,
            ticker: newAsset.ticker,
            type: newAsset.type || "Outros",
            price: newAsset.price || 0,
            quantity: newAsset.quantity || 0,
            total: calculatedTotal,
            return_value: 0,
            return_percentage: 0,
            category_id: categoryId
          }
        ])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Add the new asset to the state
        const newAssetItem: Asset = {
          id: data.id,
          name: data.name,
          ticker: data.ticker,
          type: data.type,
          price: Number(data.price),
          quantity: Number(data.quantity),
          total: Number(data.total),
          return: Number(data.return_value),
          returnPercentage: Number(data.return_percentage),
        };
        
        setAssets([...assets, newAssetItem]);
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
          description: `${newAssetItem.name} (${newAssetItem.ticker}) foi adicionado com sucesso`,
        });
      }
    } catch (error) {
      console.error("Error adding asset:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar ativo",
        description: "Não foi possível adicionar o ativo. Tente novamente."
      });
    }
  };
  
  const handleUpdateAsset = async (updatedAsset: Asset) => {
    try {
      const { error } = await supabase
        .from("assets")
        .update({
          name: updatedAsset.name,
          ticker: updatedAsset.ticker,
          type: updatedAsset.type,
          price: updatedAsset.price,
          quantity: updatedAsset.quantity,
          total: updatedAsset.total,
          return_value: updatedAsset.return,
          return_percentage: updatedAsset.returnPercentage
        })
        .eq("id", updatedAsset.id);
      
      if (error) {
        throw error;
      }
      
      // Update the asset in the state
      const updatedAssets = assets.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      );
      
      setAssets(updatedAssets);
      
      toast({
        title: "Ativo atualizado",
        description: `${updatedAsset.name} (${updatedAsset.ticker}) foi atualizado com sucesso`
      });
    } catch (error) {
      console.error("Error updating asset:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar ativo",
        description: "Não foi possível atualizar o ativo. Tente novamente."
      });
    }
  };
  
  const handleDeleteAsset = async (id: string) => {
    try {
      const assetToDelete = assets.find((asset) => asset.id === id);
      
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      // Remove the asset from the state
      const updatedAssets = assets.filter((asset) => asset.id !== id);
      setAssets(updatedAssets);
      
      if (assetToDelete) {
        toast({
          title: "Ativo removido",
          description: `${assetToDelete.name} (${assetToDelete.ticker}) foi removido com sucesso`,
        });
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover ativo",
        description: "Não foi possível remover o ativo. Tente novamente."
      });
    }
  };

  const metrics = calculateTabMetrics(assets);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
