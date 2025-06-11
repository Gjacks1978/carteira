import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AllocationChart from "./AllocationChart";
import PerformanceChart from "./PerformanceChart";
import QuickStats from "./QuickStats";
import AllocationBreakdownList from './AllocationBreakdownList';
import PatrimonioTotalChart from '@/components/reports/PatrimonioTotalChart';
import AssetEvolutionStackedBarChart from '@/components/reports/AssetEvolutionStackedBarChart';
import { SnapshotGroupWithTotal } from '@/types/reports';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { fetchUSDtoBRLRate, FALLBACK_USD_TO_BRL_RATE } from "@/lib/utils";

// Helper function to safely parse numeric values
const parseNumericValue = (value: any): number => {
  if (typeof value === 'number' && isFinite(value)) {
    return value;
  }
  // Add more sophisticated parsing here if values can be strings like "1,234.56"
  // For now, only accept actual numbers or default to 0.
  return 0;
};

const InvestmentDashboard = () => {
  const [period, setPeriod] = useState<"1m" | "3m" | "6m" | "1y" | "all">("1y");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalInvested: 0,
    totalReturn: 0,
    returnPercentage: 0,
    portfolioAllocation: [] as Array<{name: string, value: number}>,
    assetsCount: 0,
    cryptoCount: 0,
  });
  const [snapshotGroupsData, setSnapshotGroupsData] = useState<SnapshotGroupWithTotal[]>([]);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(true);
  const [snapshotFetchError, setSnapshotFetchError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const portfolioPerformanceData = React.useMemo(() => {
    if (!snapshotGroupsData || snapshotGroupsData.length === 0) return [];
    return [...snapshotGroupsData]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) // Sort ascending for chart
      .map(group => ({
        date: group.created_at,
        portfolio: group.totalPatrimonioGrupo,
        // benchmark: undefined, // Add benchmark data here if available in the future
      }));
  }, [snapshotGroupsData]);
  
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

useEffect(() => {
    fetchDashboardData();
    fetchSnapshotDataForDashboard(); // Call the new function
  }, [user]);

  const fetchSnapshotDataForDashboard = async () => {
    if (!user) {
      setIsSnapshotLoading(false);
      setSnapshotGroupsData([]);
      return;
    }

    setIsSnapshotLoading(true);
    setSnapshotFetchError(null);

    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('snapshot_groups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;
      if (!groupsData) {
        setSnapshotGroupsData([]);
        setIsSnapshotLoading(false);
        return;
      }

      const groupsWithTotals: SnapshotGroupWithTotal[] = await Promise.all(
        groupsData.map(async (group) => {
          const { data: items, error: itemsError } = await supabase
            .from('snapshot_items')
            .select('id, asset_id, asset_name, asset_category_name, total_value_brl, is_crypto_total')
            .eq('snapshot_group_id', group.id);

          if (itemsError) {
            console.error(`[Dashboard] Error fetching items for group ${group.id}:`, itemsError);
            // Return group with 0 total and empty items if items fetch fails, to avoid breaking Promise.all
            return { ...group, totalPatrimonioGrupo: 0, snapshot_items: [] }; 
          }

          const totalPatrimonioGrupo = items?.reduce((sum, item) => sum + (item.total_value_brl || 0), 0) || 0;
          // Ensure snapshot_items is always an array, even if items is null/undefined
          return { ...group, totalPatrimonioGrupo, snapshot_items: items || [] }; 
        })
      );
      setSnapshotGroupsData(groupsWithTotals);
    } catch (err) {
      console.error('Erro ao buscar dados de snapshots para o Dashboard:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao buscar snapshots.';
      setSnapshotFetchError(errorMessage);
      toast({
        title: "Erro ao carregar histórico de patrimônio",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSnapshotLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      // 1. Fetch Asset Categories first
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('asset_categories')
        .select('id, name');

      if (categoriesError) throw categoriesError;
      const categoryMap = new Map<string, string>();
      (categoriesData || []).forEach(cat => categoryMap.set(cat.id, cat.name));

      // 2. Fetch current asset data (without direct join for category name)
      const { data: assets, error: assetsError } = await supabase
        .from("assets")
        .select("*, category_id, current_total_value_brl") // Select category_id
        .eq("user_id", user.id);

      // 3. Fetch current crypto data
      const { data: cryptos, error: cryptosError } = await supabase
        .from("crypto_assets")
        .select("*, sectors(name), total_brl") // Corrected column name for crypto value in BRL
        .eq("user_id", user.id);

      if (assetsError) throw assetsError;
      if (cryptosError) throw cryptosError;

      const assetsData = assets || [];
      const cryptoData = cryptos || [];

      // Calculate current total value of assets
      const currentTotalAssetsValue = assetsData.reduce((sum, asset) => sum + parseNumericValue(asset.current_total_value_brl), 0);
      // Calculate current total value of cryptos
      const currentTotalCryptoValue = cryptoData.reduce((sum, crypto) => sum + parseNumericValue(crypto.total_brl), 0);
      
      // Total invested considers both assets and cryptos
      let totalInvestedDisplay = currentTotalAssetsValue + currentTotalCryptoValue;

      let firstSnapshotTotalValue = 0;
      let totalReturnForDashboard = 0;
      let returnPercentageForDashboard = 0;

      // Fetch First Snapshot Group to use as a baseline for returns
      const { data: firstSnapshotGroupData, error: firstSnapshotGroupError } = await supabase
        .from('snapshot_groups')
        .select('id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (firstSnapshotGroupError && firstSnapshotGroupError.code !== 'PGRST116') { // PGRST116: Query returned 0 rows
        throw firstSnapshotGroupError;
      }

      if (firstSnapshotGroupData) {
        const { data: firstSnapshotItems, error: firstSnapshotItemsError } = await supabase
          .from('snapshot_items')
          .select('total_value_brl')
          .eq('snapshot_group_id', firstSnapshotGroupData.id);

        if (firstSnapshotItemsError) throw firstSnapshotItemsError;

        firstSnapshotTotalValue = (firstSnapshotItems || []).reduce(
          (sum, item) => sum + parseNumericValue(item.total_value_brl),
          0
        );

        totalReturnForDashboard = totalInvestedDisplay - firstSnapshotTotalValue;
        if (firstSnapshotTotalValue > 0) {
          returnPercentageForDashboard = (totalReturnForDashboard / firstSnapshotTotalValue) * 100;
        } else {
          returnPercentageForDashboard = 0;
        }
      } else {
        totalReturnForDashboard = 0; 
        returnPercentageForDashboard = 0;
        toast({
          title: "Primeiro snapshot não encontrado",
          description: "O 'Retorno Total' e '% Retorno' são calculados com base no seu primeiro snapshot. Cadastre um para métricas mais precisas.",
          variant: "default",
        });
      }

      // Portfolio Allocation (based on current values, using the categoryMap)
      const allocationMap = new Map<string, number>();
      assetsData.forEach(asset => {
        const categoryName = categoryMap.get(asset.category_id) || 'Outros (Ativos)';
        const value = parseNumericValue(asset.current_total_value_brl);
        allocationMap.set(categoryName, (allocationMap.get(categoryName) || 0) + value);
      });

      if (currentTotalCryptoValue > 0) {
        allocationMap.set('Criptomoedas', currentTotalCryptoValue);
      }

      const portfolioAllocation = Array.from(allocationMap)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0); // Filter out zero-value categories

      setDashboardData({
        totalInvested: totalInvestedDisplay,
        totalReturn: totalReturnForDashboard,
        returnPercentage: returnPercentageForDashboard,
        portfolioAllocation: portfolioAllocation,
        assetsCount: assetsData.length,
        cryptoCount: cryptoData.length,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar os dados do dashboard. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    toast({
      description: "Dados atualizados com sucesso!",
    });
  };

  const isPositiveReturn = dashboardData.returnPercentage >= 0;

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
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral dos seus investimentos em {currentDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Atualizar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem>Exportar como PDF</DropdownMenuItem>
              <DropdownMenuItem>Exportar como CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalInvested.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total dos seus ativos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retorno Total</CardTitle>
            {isPositiveReturn ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalReturn.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span
                className={isPositiveReturn ? "text-success" : "text-danger"}
              >
                {dashboardData.returnPercentage.toFixed(2)}%
              </span>
              {isPositiveReturn ? (
                <ArrowUpRight className="h-3 w-3 text-success" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-danger" />
              )}
              <span>desde o início</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.assetsCount + dashboardData.cryptoCount}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.assetsCount} tradicionais, {dashboardData.cryptoCount} cripto
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diversificação</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.portfolioAllocation.length}</div>
            <p className="text-xs text-muted-foreground">
              Classes de ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bloco 1: Histórico do Patrimônio Total */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico do Patrimônio Total</CardTitle>
          <CardDescription>Evolução do valor total da carteira ao longo do tempo.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <PatrimonioTotalChart 
            snapshotGroupsData={snapshotGroupsData} 
            isLoading={isSnapshotLoading} 
          />
        </CardContent>
      </Card>

      {/* Bloco 2: Alocação por Classe */}
      <Card>
        <CardHeader>
          <CardTitle>Alocação por Classe</CardTitle>
          <CardDescription>Distribuição percentual e valores da carteira por classe de ativo.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-center">Distribuição Percentual</h3>
            <AllocationChart data={dashboardData.portfolioAllocation} />
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-center">Valores por Classe</h3>
            <AllocationBreakdownList 
              data={dashboardData.portfolioAllocation} 
              totalValue={dashboardData.totalInvested} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Bloco 3: Composição do Patrimônio por Ativo */}
      <Card>
        <CardHeader>
          <CardTitle>Composição do Patrimônio por Ativo</CardTitle>
          <CardDescription>Distribuição do valor da carteira entre os ativos ao longo do tempo.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AssetEvolutionStackedBarChart 
            snapshotGroupsData={snapshotGroupsData} 
            isLoading={isSnapshotLoading} 
          />
        </CardContent>
      </Card>
    </div>
  );
};
