import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Download } from "lucide-react";
import { Asset } from "@/types/assets";
import AssetsTable from "./AssetsTable";
import AddAssetForm from "./AddAssetForm";
interface AssetCategorySectionProps {
  categoryName: string;
  categoryId: string;
  assets: Asset[];
  onAddAsset: (asset: Partial<Asset>) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
}
const AssetCategorySection = ({
  categoryName,
  categoryId,
  assets,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset
}: AssetCategorySectionProps) => {
  const [openAddAssetDialog, setOpenAddAssetDialog] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: "",
    ticker: "",
    type: "",
    price: 0,
    quantity: 0,
    total: 0
  });
  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.ticker) {
      return;
    }
    const calculatedTotal = (newAsset.price || 0) * (newAsset.quantity || 0);
    onAddAsset({
      ...newAsset,
      total: calculatedTotal
    });
    setOpenAddAssetDialog(false);
    setNewAsset({
      name: "",
      ticker: "",
      type: "",
      price: 0,
      quantity: 0,
      total: 0
    });
  };

  // Calcular métricas da seção
  const sectionTotal = assets.reduce((sum, asset) => sum + asset.total, 0);
  const assetCount = assets.length;
  return <div className="space-y-4 mb-8">
      <Card>
        <CardHeader className="bg-zinc-100">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl capitalize">{categoryName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {assetCount} ativos • {sectionTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
              })}
              </p>
            </div>
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
                <AddAssetForm title="Adicionar Novo Ativo" description={`Insira os detalhes do novo ativo para ${categoryName}.`} buttonLabel="Adicionar" fields={[{
                name: "name",
                label: "Nome",
                type: "text",
                placeholder: "Ex: Tesouro IPCA+",
                value: newAsset.name,
                onChange: e => setNewAsset({
                  ...newAsset,
                  name: e.target.value
                })
              }, {
                name: "ticker",
                label: "Ticker/Código",
                type: "text",
                placeholder: "Ex: IPCA+2026",
                value: newAsset.ticker,
                onChange: e => setNewAsset({
                  ...newAsset,
                  ticker: e.target.value
                })
              }, {
                name: "type",
                label: "Tipo",
                type: "text",
                placeholder: "Ex: Tesouro Direto",
                value: newAsset.type,
                onChange: e => setNewAsset({
                  ...newAsset,
                  type: e.target.value
                })
              }, {
                name: "price",
                label: "Preço Unitário (R$)",
                type: "number",
                placeholder: "Ex: 1000",
                value: newAsset.price,
                onChange: e => {
                  const price = parseFloat(e.target.value);
                  const quantity = newAsset.quantity || 0;
                  setNewAsset({
                    ...newAsset,
                    price,
                    total: price * quantity
                  });
                }
              }, {
                name: "quantity",
                label: "Quantidade",
                type: "number",
                placeholder: "Ex: 10",
                value: newAsset.quantity,
                onChange: e => {
                  const quantity = parseFloat(e.target.value);
                  const price = newAsset.price || 0;
                  setNewAsset({
                    ...newAsset,
                    quantity,
                    total: price * quantity
                  });
                }
              }]} onSubmit={handleAddAsset} />
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="bg-zinc-100">
          <AssetsTable assets={assets} onUpdate={onUpdateAsset} onDelete={onDeleteAsset} />
        </CardContent>
      </Card>
    </div>;
};
export default AssetCategorySection;