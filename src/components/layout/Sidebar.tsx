import { NavLink } from "react-router-dom";
import { Home, PieChart, Bitcoin, DollarSign, AlertCircle, BarChart3 } from "lucide-react"; // Adicionado BarChart3
import { useEffect, useState } from "react";
import { fetchUSDtoBRLRate, ExchangeRateData, FALLBACK_USD_TO_BRL_RATE } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Sidebar = () => {
  const [exchangeRateInfo, setExchangeRateInfo] = useState<ExchangeRateData>({
    rate: FALLBACK_USD_TO_BRL_RATE,
    isReal: false,
  });

  useEffect(() => {
    const getRate = async () => {
      const data = await fetchUSDtoBRLRate();
      setExchangeRateInfo(data);
    };
    getRate();
    // Opcional: configurar um intervalo para atualizar a cotação periodicamente
    // const intervalId = setInterval(getRate, 60000); // A cada 1 minuto
    // return () => clearInterval(intervalId);
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-1.5 py-3 px-2 flex-1 overflow-y-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              isActive 
                ? "bg-accent text-accent-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`
          }
        >
          <Home className="h-4 w-4 mr-2" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/ativos"
          className={({ isActive }) =>
            `flex items-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              isActive 
                ? "bg-accent text-accent-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`
          }
        >
          <PieChart className="h-4 w-4 mr-2" />
          <span>Ativos</span>
        </NavLink>
        <NavLink
          to="/cripto"
          className={({ isActive }) =>
            `flex items-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              isActive 
                ? "bg-accent text-accent-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`
          }
        >
          <Bitcoin className="h-4 w-4 mr-2" />
          <span>Cripto</span>
        </NavLink>
        <NavLink
          to="/relatorios"
          className={({ isActive }) =>
            `flex items-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              isActive 
                ? "bg-accent text-accent-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`
          }
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          <span>Relatórios</span>
        </NavLink>

        <div className="pt-4 mt-4 border-t border-muted/30">
          <div className="flex items-center py-2.5 px-3 text-sm bg-muted/20 rounded-lg border border-muted/30">
            <DollarSign className="h-4 w-4 mr-2 text-primary" />
            <span className="text-muted-foreground mr-1">USD/BRL:</span>
            <span className="font-semibold text-foreground">
              {exchangeRateInfo.rate.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}
            </span>
            {!exchangeRateInfo.isReal && (
              <Tooltip delayDuration={300}>
                <TooltipTrigger className="ml-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cotação não atualizada. Usando valor de fallback.</p>
                  {exchangeRateInfo.timestamp && <p className="text-xs text-muted-foreground">Última tentativa: {exchangeRateInfo.timestamp}</p>}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {exchangeRateInfo.isReal && exchangeRateInfo.timestamp && (
            <div className="px-3 text-xs text-muted-foreground/80">
              Atualizado em: {exchangeRateInfo.timestamp}
            </div>
          )}
        </div>

        {/* Footer removed: handled by SidebarWrapper */}
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
