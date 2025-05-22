
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Download, Bitcoin, DollarSign, Wallet } from "lucide-react";
import { cryptoData } from "@/data/mockData";
import CryptoTable from "@/components/crypto/CryptoTable";
import AddAssetForm from "@/components/assets/AddAssetForm";
import { useToast } from "@/hooks/use-toast";
import { Crypto } from "@/types/assets";
import { calculateCryptoMetrics } from "@/lib/assetUtils";

const CryptoPage = () => {
  const [crypto, setCrypto] = useState<Crypto[]>(cryptoData);
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
  const { toast } = useToast();
  
  const metrics = calculateCryptoMetrics(crypto);
  const usdToBRL = 5.05; // Mock exchange rate

  const handleAddCrypto = () => {
    if (!newCrypto.ticker || !newCrypto.name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    const calculatedTotalUSD = (newCrypto.priceUSD || 0) * (newCrypto.quantity || 0);
    
    const asset: Crypto = {
      id: Date.now().toString(),
      ticker: newCrypto.ticker || "",
      name: newCrypto.name || "",
      sector: newCrypto.sector || "Outros",
      priceUSD: newCrypto.priceUSD || 0,
      quantity: newCrypto.quantity || 0,
      totalUSD: calculatedTotalUSD,
      totalBRL: calculatedTotalUSD * usdToBRL,
      custody: newCrypto.custody || "Carteira Local",
      portfolioPercentage: 0, // Will be calculated in the metrics
      changePercentage: 0,
    };
    
    setCrypto([...crypto, asset]);
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
      description: `${asset.name} (${asset.ticker}) foi adicionado com sucesso`,
    });
  };
  
  const handleUpdateCrypto = (updatedCrypto: Crypto) => {
    const updatedCryptos = crypto.map((asset) =>
      asset.id === updatedCrypto.id ? updatedCrypto : asset
    );
    setCrypto(updatedCryptos);
  };
  
  const handleDeleteCrypto = (id: string) => {
    const cryptoToDelete = crypto.find((asset) => asset.id === id);
    const updatedCryptos = crypto.filter((asset) => asset.id !== id);
    setCrypto(updatedCryptos);
    
    if (cryptoToDelete) {
      toast({
        title: "Criptoativo removido",
        description: `${cryptoToDelete.name} (${cryptoToDelete.ticker}) foi removido com sucesso`,
      });
    }
  };

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Total (R$)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalBRL.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Convertido em reais
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% do Portfólio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.portfolioPercentage.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Do total de investimentos
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
