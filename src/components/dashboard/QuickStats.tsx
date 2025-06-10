
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart,
  Percent,
  Banknote,
  TrendingUp,
  Award,
  Star,
} from "lucide-react";

const QuickStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Maior Rentabilidade
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-xl font-bold">MGLU3</div>
          <div className="flex items-center">
            <ArrowUpRight className="h-4 w-4 text-success mr-1" />
            <span className="font-medium text-success">+28.5%</span>
          </div>
          <p className="text-xs text-muted-foreground">Ações - BR</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Maior Exposição
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-xl font-bold">CDB XYZ</div>
          <div className="flex items-center">
            <Percent className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="font-medium">18.2%</span>
          </div>
          <p className="text-xs text-muted-foreground">Renda Fixa</p>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Próximos Vencimentos
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-xl font-bold">LCI ABC</div>
          <div className="flex items-center">
            <Banknote className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="font-medium">
              {Number(5000).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Em 15 dias</p>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Melhor Setor
          </CardTitle>
          <Award className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-xl font-bold">Tecnologia</div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-warning mr-1" />
            <span className="font-medium">+15.7%</span>
          </div>
          <p className="text-xs text-muted-foreground">YTD</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
