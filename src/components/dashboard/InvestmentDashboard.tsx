
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { investmentData } from "@/data/mockData";
import AllocationChart from "./AllocationChart";
import PerformanceChart from "./PerformanceChart";
import QuickStats from "./QuickStats";

const InvestmentDashboard = () => {
  const [period, setPeriod] = useState<"1m" | "3m" | "6m" | "1y" | "all">("1y");
  const { toast } = useToast();
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Calculate dashboard metrics
  const totalInvested = investmentData.totalInvested;
  const totalReturn = investmentData.totalReturn;
  const returnPercentage = investmentData.returnPercentage;
  const isPositiveReturn = returnPercentage >= 0;
  
  const handleRefresh = () => {
    toast({
      description: "Dados atualizados com sucesso!",
    });
  };

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
              {totalInvested.toLocaleString("pt-BR", {
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
              {totalReturn.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span
                className={isPositiveReturn ? "text-success" : "text-danger"}
              >
                {returnPercentage.toFixed(2)}%
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
            <CardTitle className="text-sm font-medium">Rentabilidade YTD</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-success">+2.5%</span>
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span>vs. benchmark</span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidez</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.3%</div>
            <p className="text-xs text-muted-foreground">
              Ativos de alta liquidez
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="allocation">Alocação</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Performance dos Investimentos</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <PerformanceChart period={period} />
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Alocação por Classe</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <AllocationChart />
              </CardContent>
            </Card>
          </div>
          
          <QuickStats />
        </TabsContent>
        
        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Ativos</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <AllocationChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Performance por Período</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant={period === "1m" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setPeriod("1m")}
              >
                1M
              </Button>
              <Button 
                variant={period === "3m" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPeriod("3m")}
              >
                3M
              </Button>
              <Button 
                variant={period === "6m" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPeriod("6m")}
              >
                6M
              </Button>
              <Button 
                variant={period === "1y" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPeriod("1y")}
              >
                1A
              </Button>
              <Button 
                variant={period === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPeriod("all")}
              >
                Tudo
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <PerformanceChart period={period} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentDashboard;
