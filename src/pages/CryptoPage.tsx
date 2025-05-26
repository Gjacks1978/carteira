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
import { AllocationBySectorCard } from "@/components/crypto/AllocationBySectorCard";
import { fetchUSDtoBRLRate, ExchangeRateData, FALLBACK_USD_TO_BRL_RATE } from "@/lib/utils";

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
  const [sectors, setSectors] = useState<{[key: string]: string}>({}); 
  const [custodies, setCustodies] = useState<{[key: string]: string}>({}); 
  const [exchangeRateInfo, setExchangeRateInfo] = useState<ExchangeRateData>({ rate: FALLBACK_USD_TO_BRL_RATE, isReal: false }); 
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const getRate = async () => {
      const data = await fetchUSDtoBRLRate(); 
      setExchangeRateInfo(data);
    };
    getRate();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchSectorsAndCustodies(); 
      await fetchCryptoAssets(); 
      setLoading(false);
    };

    if (user) {
      loadData();
    } else {
      setCrypto([]); 
      setSectors({});
      setCustodies({});
      setLoading(false);
    }
  }, [user, exchangeRateInfo.rate]); 

  const fetchSectorsAndCustodies = async () => {
    try {
      const { data: sectorsData, error: sectorsError } = await supabase
        .from("sectors")
        .select("id, name");
      if (sectorsError) throw sectorsError;
      
      const sectorsMap = sectorsData?.reduce((acc, sector) => {
        acc[sector.id] = sector.name;
        return acc;
      }, {}) || {};
      setSectors(sectorsMap);

      const { data: custodiesData, error: custodiesError } = await supabase
        .from("custodies")
        .select("id, name");
      if (custodiesError) throw custodiesError;
      
      const custodiesMap = custodiesData?.reduce((acc, custody) => {
        acc[custody.id] = custody.name;
        return acc;
      }, {}) || {};
      setCustodies(custodiesMap);

    } catch (error) {
      console.error("Error fetching sectors and custodies:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados auxiliares",
        description: "Não foi possível carregar setores e custódias."
      });
      setSectors({}); 
      setCustodies({});
    }
  };

  const fetchCryptoAssets = async () => {
    if (!user) {
      setCrypto([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("crypto_assets")
        .select("*, sectors(id, name), custodies(id, name)") 
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      if (data) {
        const transformedCrypto = data.map(item => ({
          id: item.id,
          ticker: item.ticker,
          name: item.name,
          sector: item.sectors ? item.sectors.name : "Outros", 
          priceUSD: Number(item.price_usd),
          quantity: Number(item.quantity),
          totalUSD: Number(item.total_usd),
          totalBRL: Number(item.total_usd) * exchangeRateInfo.rate, 
          custody: item.custodies ? item.custodies.name : "Carteira Local", 
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
      setCrypto([]); 
    } 
  };
  
  const handleAddCrypto = async () => {
    if (!newCrypto.ticker || !newCrypto.name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
      });
      return;
    }
    if (!user) return;

    const calculatedTotalUSD = (newCrypto.priceUSD || 0) * (newCrypto.quantity || 0);
    
    const sectorId = Object.keys(sectors).find(id => sectors[id] === newCrypto.sector) || null;
    const custodyId = Object.keys(custodies).find(id => custodies[id] === newCrypto.custody) || null;

    try {
      const { data, error } = await supabase
        .from("crypto_assets")
        .insert([
          {
            user_id: user.id,
            ticker: newCrypto.ticker,
            name: newCrypto.name,
            sector_id: sectorId, 
            price_usd: newCrypto.priceUSD || 0,
            quantity: newCrypto.quantity || 0,
            total_usd: calculatedTotalUSD,
            total_brl: calculatedTotalUSD * exchangeRateInfo.rate, 
            custody_id: custodyId, 
            portfolio_percentage: 0, 
            change_percentage: 0,
          }
        ])
        .select("*, sectors(id, name), custodies(id, name)") 
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newAsset: Crypto = {
          id: data.id,
          ticker: data.ticker,
          name: data.name,
          sector: data.sectors ? data.sectors.name : (newCrypto.sector || "Outros"),
          priceUSD: Number(data.price_usd),
          quantity: Number(data.quantity),
          totalUSD: Number(data.total_usd),
          totalBRL: Number(data.total_brl), 
          custody: data.custodies ? data.custodies.name : (newCrypto.custody || "Carteira Local"),
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
    if (!user) return;

    const sectorId = Object.keys(sectors).find(id => sectors[id] === updatedCrypto.sector) || null;
    const custodyId = Object.keys(custodies).find(id => custodies[id] === updatedCrypto.custody) || null;

    try {
      const { error } = await supabase
        .from("crypto_assets")
        .update({
          ticker: updatedCrypto.ticker,
          name: updatedCrypto.name,
          price_usd: updatedCrypto.priceUSD,
          quantity: updatedCrypto.quantity,
          total_usd: updatedCrypto.totalUSD,
          total_brl: updatedCrypto.totalUSD * exchangeRateInfo.rate, 
          sector_id: sectorId, 
          custody_id: custodyId, 
          // portfolio_percentage e change_percentage podem precisar de lógica de atualização separada
        })
        .eq("id", updatedCrypto.id)
        .eq("user_id", user.id); 

      if (error) throw error;

      setCrypto(prevCrypto =>
        prevCrypto.map(c => (c.id === updatedCrypto.id ? updatedCrypto : c))
      );

      toast({
        title: "Criptoativo atualizado",
        description: `${updatedCrypto.name} foi atualizado com sucesso.`,
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
    if (!user) return;
    try {
      const cryptoToDelete = crypto.find((asset) => asset.id === id);
      
      const { error } = await supabase
        .from("crypto_assets")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); 
      
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

  const handleAddSector = async (sectorName: string) => {
    if (!user || !sectorName.trim()) return;
    const trimmedName = sectorName.trim();
    const existingSector = Object.values(sectors).find(s => s.toLowerCase() === trimmedName.toLowerCase());
    if (existingSector) {
      toast({ title: "Setor já existe", description: `O setor "${trimmedName}" já está na lista.`, variant: "default" });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('sectors') 
        .insert({ name: trimmedName, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        toast({ title: "Setor adicionado", description: `Setor "${data.name}" adicionado.` });
        await fetchSectorsAndCustodies(); 
      }
    } catch (error) {
      console.error("Error adding sector:", error);
      toast({ title: "Erro ao adicionar setor", variant: "destructive", description: (error as Error).message });
    }
  };

  const handleRemoveSector = async (sectorName: string) => {
    if (!user) return;
    const sectorIdToRemove = Object.keys(sectors).find(id => sectors[id] === sectorName);
    if (!sectorIdToRemove) {
      toast({ title: "Erro", description: "Setor não encontrado para remoção.", variant: "destructive" });
      return;
    }
    const isSectorUsed = crypto.some(c => c.sector === sectorName);
    if (isSectorUsed) {
      toast({
        title: "Não é possível remover: Setor em uso",
        description: `O setor "${sectorName}" está em uso por um ou mais criptoativos e não pode ser removido.`,
        variant: "default",
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', sectorIdToRemove)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: "Setor removido", description: `Setor "${sectorName}" removido.` });
      await fetchSectorsAndCustodies();
    } catch (error) {
      console.error("Error removing sector:", error);
      toast({ title: "Erro ao remover setor", variant: "destructive", description: (error as Error).message });
    }
  };

  const handleAddCustody = async (custodyName: string) => {
    if (!user || !custodyName.trim()) return;
    const trimmedName = custodyName.trim();
    const existingCustody = Object.values(custodies).find(c => c.toLowerCase() === trimmedName.toLowerCase());
    if (existingCustody) {
      toast({ title: "Custódia já existe", description: `A custódia "${trimmedName}" já está na lista.`, variant: "default" });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('custodies') 
        .insert({ name: trimmedName, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        toast({ title: "Custódia adicionada", description: `Custódia "${data.name}" adicionada.` });
        await fetchSectorsAndCustodies();
      }
    } catch (error) {
      console.error("Error adding custody:", error);
      toast({ title: "Erro ao adicionar custódia", variant: "destructive", description: (error as Error).message });
    }
  };

  const handleRemoveCustody = async (custodyName: string) => {
    if (!user) return;
    const custodyIdToRemove = Object.keys(custodies).find(id => custodies[id] === custodyName);
    if (!custodyIdToRemove) {
      toast({ title: "Erro", description: "Custódia não encontrada para remoção.", variant: "destructive" });
      return;
    }
    const isCustodyUsed = crypto.some(c => c.custody === custodyName);
    if (isCustodyUsed) {
      toast({
        title: "Não é possível remover: Custódia em uso",
        description: `A custódia "${custodyName}" está em uso por um ou mais criptoativos e não pode ser removida.`,
        variant: "default",
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('custodies')
        .delete()
        .eq('id', custodyIdToRemove)
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: "Custódia removida", description: `Custódia "${custodyName}" removida.` });
      await fetchSectorsAndCustodies();
    } catch (error) {
      console.error("Error removing custody:", error);
      toast({ title: "Erro ao remover custódia", variant: "destructive", description: (error as Error).message });
    }
  };

  const metrics = calculateCryptoMetrics(crypto); 
  
  const stablecoinTotal = crypto
    .filter(asset => asset.sector.toLowerCase().includes("stablecoin"))
    .reduce((total, asset) => total + asset.totalUSD, 0);

  const totalCryptoValueBRL = metrics.totalBRL; 

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
            <p className="text-xs text-muted-foreground">
              Valor em dólares
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              {metrics.totalBRL.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
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
              Total em Stablecoins (USD)
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              {(stablecoinTotal * exchangeRateInfo.rate).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </CardContent>
        </Card>
        
        <AllocationBySectorCard sectorAllocation={metrics.sectorAllocation} />

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
                      totalBRL: totalUSD * exchangeRateInfo.rate 
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
                      totalBRL: totalUSD * exchangeRateInfo.rate 
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
        data={crypto} 
        onUpdateRow={handleUpdateCrypto} 
        onDeleteRow={handleDeleteCrypto} 
        sectors={Object.values(sectors)} 
        custodies={Object.values(custodies)} 
        onAddSector={handleAddSector} 
        onRemoveSector={handleRemoveSector} 
        onAddCustody={handleAddCustody} 
        onRemoveCustody={handleRemoveCustody} 
      />
    </div>
  );
};

export default CryptoPage;
