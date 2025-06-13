import { NavLink } from "react-router-dom";
import { Home, PieChart, Bitcoin, DollarSign, AlertCircle, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchUSDtoBRLRate, ExchangeRateData, FALLBACK_USD_TO_BRL_RATE } from "../../lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useSidebar } from "../../contexts/SidebarContext";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/ativos", icon: PieChart, label: "Ativos" },
  { to: "/cripto", icon: Bitcoin, label: "Cripto" },
  { to: "/relatorios", icon: BarChart3, label: "Relatórios" },
];

const Sidebar = () => {
  const { isCollapsed } = useSidebar();
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
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("space-y-1.5 py-3 flex-1 overflow-y-auto", isCollapsed ? "px-2" : "px-4")}>
        <nav className="grid gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Tooltip key={to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "block h-10 rounded-lg text-sm font-medium transition-colors",
                      isCollapsed ? "w-10" : "px-3",
                      isActive
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )
                  }
                >
                  <div className={cn("flex h-full items-center", isCollapsed && "justify-center")}>
                    <Icon className="h-5 w-5" />
                    <span className={cn("ml-3", isCollapsed && "hidden")}>{label}</span>
                  </div>
                </NavLink>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={5}>
                  {label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        <div className="pt-4 mt-4 border-t border-muted/30">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center h-10 rounded-lg border border-muted/30 bg-muted/20 text-sm",
                isCollapsed ? "w-10 justify-center" : "px-3"
              )}>
                <DollarSign className="h-5 w-5 text-primary" />
                <div className={cn("ml-3 flex items-baseline", isCollapsed && "hidden")}>
                  <span className="text-muted-foreground mr-1.5">USD:</span>
                  <span className="font-semibold text-foreground">
                    {exchangeRateInfo.rate.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </span>
                  {!exchangeRateInfo.isReal && (
                     <AlertCircle className="h-4 w-4 text-red-500 ml-1.5" />
                  )}
                </div>
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" sideOffset={5}>
                <p>USD/BRL: {exchangeRateInfo.rate.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' })}</p>
                {!exchangeRateInfo.isReal && <p className="text-red-500">Cotação de fallback</p>}
              </TooltipContent>
            )}
          </Tooltip>
          {exchangeRateInfo.isReal && exchangeRateInfo.timestamp && !isCollapsed && (
            <div className="px-3 mt-1 text-xs text-muted-foreground/80">
              Atualizado: {exchangeRateInfo.timestamp}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
