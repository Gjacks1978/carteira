import { NavLink } from "react-router-dom";
import { Home, PieChart, Bitcoin, DollarSign, AlertCircle, BarChart3 } from "lucide-react"; // Adicionado BarChart3
import { useEffect, useState } from "react";
import { fetchUSDtoBRLRate, ExchangeRateData, FALLBACK_USD_TO_BRL_RATE } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "./ThemeToggle";

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
      <div className="space-y-1 py-2 px-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center py-2 px-3 rounded-md transition-colors ${
              isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
            }`
          }
        >
          <Home className="h-4 w-4 mr-2" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/ativos"
          className={({ isActive }) =>
            `flex items-center py-2 px-3 rounded-md transition-colors ${
              isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
            }`
          }
        >
          <PieChart className="h-4 w-4 mr-2" />
          <span>Ativos</span>
        </NavLink>
        <NavLink
          to="/cripto"
          className={({ isActive }) =>
            `flex items-center py-2 px-3 rounded-md transition-colors ${
              isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
            }`
          }
        >
          <Bitcoin className="h-4 w-4 mr-2" />
          <span>Cripto</span>
        </NavLink>
        <NavLink
          to="/relatorios"
          className={({ isActive }) =>
            `flex items-center py-2 px-3 rounded-md transition-colors ${
              isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
            }`
          }
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          <span>Relatórios</span>
        </NavLink>

        <div className="pt-4 mt-4 border-t border-muted">
          <div className="flex items-center py-2 px-3 text-sm">
            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground mr-1">USD/BRL:</span>
            <span className="font-semibold">
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

        {/* User Info / Theme Toggle Footer Bar */}
        <div className="mt-auto flex items-center justify-between p-3 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {/* Futuro local para nome/avatar do usuário */}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
