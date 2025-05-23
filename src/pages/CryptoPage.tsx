
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Download, Bitcoin, DollarSign, Wallet, Shield } from "lucide-react";
import CryptoTable from "@/components/crypto/CryptoTable";
import AddAssetForm from "@/components/assets/AddAssetForm";
import { useToast } from "@/hooks/use-toast";
import { Crypto } from "@/types/assets";
import { calculateCryptoMetrics } from "@/lib/assetUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const CryptoPage = () => {
  const [crypto, setCrypto] = useState<Crypto[]>([]);
  const [openAddAssetDialog, setOpenAddAssetDialog] = useState(false);
  const [newCrypto, setNewCrypto] = useState<Partial<Crypto>>({
    ticker: "",
    name: "",
    sector: "",
    priceUSD: 0,
    quantity: 0,
    totalUSD: 0,
    totalBRL: 0,
    custody: "",
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchCryptoAssets();
  }, []);

  const fetchCryptoAssets = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("crypto_assets")
        .select("*")
        .eq("user_id", user?.id);
      
      if (error) throw error;
      
      if (data) {
        // Transform database format to Crypto type
        const transformedCrypto = data.map(item => ({
          id: item.id,
          ticker: item.ticker,
          name: item.name,
          sector: item.sector_id ? "Outros" : "Outros", // This would be replaced with actual sector name
          priceUSD: Number(item.price_usd),
          quantity: Number(item.quantity),
          totalUSD: Number(item.total_usd),
          totalBRL: Number(item.total_brl),
          custody: item.custody_id ? "Exchange" : "Carteira Local", // This would be replaced with actual custody name
          portfolioPercentage: Number(item.portfolio_percentage),
          changePercentage: Number(item.change_percentage),
        }));
        
        setCrypto(transformedCrypto);
      }
    } catch (error) {
      console.error("Error fetching crypto assets:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar criptoativos",
        description: "Não foi possível carregar a lista de criptoativos."
      });
      
      // Fallback to empty array
      setCrypto([]);
    } finally {
      setLoading(false);
    }
  };
  
  const usdToBRL = 5.05; // Mock exchange rate - Ideally should come from an API

  const handleAddCrypto = async () => {
    if (!newCrypto.ticker || !newCrypto.name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    const calculatedTotalUSD = (newCrypto.priceUSD || 0) * (newCrypto.quantity || 0);
    
    try {
      const { data, error } = await supabase
        .from("crypto_assets")
        .insert([
          {
            user_id: user?.id,
            ticker: newCrypto.ticker,
            name: newCrypto.name,
            sector_id: null, // This would be replaced with actual sector ID
            price_usd: newCrypto.priceUSD || 0,
            quantity: newCrypto.quantity || 0,
            total_usd: calculatedTotalUSD,
            total_brl: calculatedTotalUSD * usdToBRL,
            custody_id: null, // This would be replaced with actual custody ID
            portfolio_percentage: 0, // Will be calculated later
            change_percentage: 0,
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newAsset: Crypto = {
          id: data.id,
          ticker: data.ticker,
          name: data.name,
          sector: "Outros",
          priceUSD: Number(data.price_usd),
          quantity: Number(data.quantity),
          totalUSD: Number(data.total_usd),
          totalBRL: Number(data.total_brl),
          custody: "Carteira Local",
          portfolioPercentage: 0,
          changePercentage: 0,
        };
        
        setCrypto(prevCrypto => [...prevCrypto, newAsset]);
        setOpenAddAssetDialog(false);
        setNewCrypto({
          ticker: "",
          name: "",
          sector: "",
          priceUSD: 0,
          quantity: 0,
          totalUSD: 0,
          totalBRL: 0,
          custody: "",
        });
        
        toast({
          title: "Criptoativo adicionado",
          description: `${newAsset.name} (${newAsset.ticker}) foi adicionado com sucesso`,
        });
      }
    } catch (error) {
      console.error("Error adding crypto asset:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar criptoativo",
        description: "Não foi possível adicionar o criptoativo. Tente novamente."
      });
    }
  };
  
  const handleUpdateCrypto = async (updatedCrypto: Crypto) => {
    try {
      const { error } = await supabase
        .from("crypto_assets")
        .update({
          ticker: updatedCrypto.ticker,
          name: updatedCrypto.name,
          price_usd: updatedCrypto.priceUSD,
          quantity: updatedCrypto.quantity,
          total_usd: updatedCrypto.totalUSD,
          total_brl: updatedCrypto.totalBRL,
          portfolio_percentage: updatedCrypto.portfolioPercentage,
          change_percentage: updatedCrypto.changePercentage
        })
        .eq("id", updatedCrypto.id);
      
      if (error) throw error;
      
      setCrypto(prevCrypto => 
        prevCrypto.map(asset => asset.id === updatedCrypto.id ? updatedCrypto : asset)
      );
      
      toast({
        title: "Criptoativo atualizado",
        description: `${updatedCrypto.name} (${updatedCrypto.ticker}) foi atualizado com sucesso`
      });
    } catch (error) {
      console.error("Error updating crypto asset:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar criptoativo",
        description: "Não foi possível atualizar o criptoativo. Tente novamente."
      });
    }
  };
  
  const handleDeleteCrypto = async (id: string) => {
    try {
      const cryptoToDelete = crypto.find((asset) => asset.id === id);
      
      const { error } = await supabase
        .from("crypto_assets")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setCrypto(prevCrypto => prevCrypto.filter(asset => asset.id !== id));
      
      if (cryptoToDelete) {
        toast({
          title: "Criptoativo removido",
          description: `${cryptoToDelete.name} (${cryptoToDelete.ticker}) foi removido com sucesso`,
        });
      }
    } catch (error) {
      console.error("Error deleting crypto asset:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover criptoativo",
        description: "Não foi possível remover o criptoativo. Tente novamente."
      });
    }
  };

  const metrics = calculateCryptoMetrics(crypto);
  
  // Calcular o total em stablecoins
  const stablecoinTotal = crypto
    .filter(asset => asset.sector.toLowerCase() === "stablecoins")
    .reduce((total, asset) => total + asset.totalUSD, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Criptomoedas</h2>
          <p className="text-muted-foreground">
            Gerenciamento dos seus criptoativos
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Cripto</CardTitle>
            <Bitcoin className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalUSD.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              Valor em dólares
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montante em Caixa</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stablecoinTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Total em Stablecoins
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Principais Custódias</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {metrics.topCustody || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.cryptoCount} criptoativos
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Seus Criptoativos</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={openAddAssetDialog} onOpenChange={setOpenAddAssetDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Criptoativo
              </Button>
            </DialogTrigger>
            <AddAssetForm
              title="Adicionar Criptoativo"
              description="Insira os detalhes do novo criptoativo."
              buttonLabel="Adicionar"
              fields={[
                {
                  name: "ticker",
                  label: "Ticker",
                  type: "text",
                  placeholder: "Ex: BTC",
                  value: newCrypto.ticker,
                  onChange: (e) => setNewCrypto({ ...newCrypto, ticker: e.target.value }),
                },
                {
                  name: "name",
                  label: "Nome",
                  type: "text",
                  placeholder: "Ex: Bitcoin",
                  value: newCrypto.name,
                  onChange: (e) => setNewCrypto({ ...newCrypto, name: e.target.value }),
                },
                {
                  name: "sector",
                  label: "Setor",
                  type: "text",
                  placeholder: "Ex: Store of Value",
                  value: newCrypto.sector,
                  onChange: (e) => setNewCrypto({ ...newCrypto, sector: e.target.value }),
                },
                {
                  name: "priceUSD",
                  label: "Preço (USD)",
                  type: "number",
                  placeholder: "Ex: 50000",
                  value: newCrypto.priceUSD,
                  onChange: (e) => {
                    const priceUSD = parseFloat(e.target.value);
                    const quantity = newCrypto.quantity || 0;
                    const totalUSD = priceUSD * quantity;
                    setNewCrypto({ 
                      ...newCrypto, 
                      priceUSD,
                      totalUSD,
                      totalBRL: totalUSD * usdToBRL
                    });
                  },
                },
                {
                  name: "quantity",
                  label: "Quantidade",
                  type: "number",
                  placeholder: "Ex: 0.5",
                  value: newCrypto.quantity,
                  onChange: (e) => {
                    const quantity = parseFloat(e.target.value);
                    const priceUSD = newCrypto.priceUSD || 0;
                    const totalUSD = priceUSD * quantity;
                    setNewCrypto({ 
                      ...newCrypto, 
                      quantity,
                      totalUSD,
                      totalBRL: totalUSD * usdToBRL
                    });
                  },
                },
                {
                  name: "custody",
                  label: "Custódia",
                  type: "text",
                  placeholder: "Ex: Binance",
                  value: newCrypto.custody,
                  onChange: (e) => setNewCrypto({ ...newCrypto, custody: e.target.value }),
                },
              ]}
              onSubmit={handleAddCrypto}
            />
          </Dialog>
        </div>
      </div>
      
      <CryptoTable 
        crypto={crypto} 
        onUpdate={handleUpdateCrypto}
        onDelete={handleDeleteCrypto}
      />
    </div>
  );
};

export default CryptoPage;
