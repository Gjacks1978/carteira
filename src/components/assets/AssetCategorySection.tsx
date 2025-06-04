import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Download } from "lucide-react";
import { Asset } from "@/types/assets";
import AssetsTable from "./AssetsTable";
import AddAssetForm from "./AddAssetForm";
interface AssetCategorySectionProps {
  categoryName: string;
  categoryId: string;
  assets: Asset[];
  onAddAsset: (asset: Partial<Asset> & { total?: number }) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onEditCategory: (categoryId: string, currentName: string) => void;
  onDeleteCategoryRequest: (categoryId: string, categoryName: string) => void;
}
const AssetCategorySection = ({
  categoryName,
  categoryId,
  assets,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onEditCategory,
  onDeleteCategoryRequest,
}: AssetCategorySectionProps) => {
  const [openAddAssetDialog, setOpenAddAssetDialog] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset> & { total?: number }>({
    name: "",
    ticker: "",
    type: "",
    price: 0,
    quantity: 0,
    total: 0
  });

  // The original initialization object for newAsset is already correct once the type is fixed.
  // The following is a placeholder to ensure the tool targets the useState line correctly if needed,
  // but the primary change is to the type parameter of useState itself.
  // This chunk might effectively be a no-op if the tool correctly changes the useState type parameter above.
  // If the useState line was: const [newAsset, setNewAsset] = useState<Partial<Asset>>({ some: 'value' });
  // Then this target would be: useState<Partial<Asset>>({
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
  const sectionTotal = assets.reduce((sum, asset) => sum + asset.current_total_value_brl, 0);
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
        {/* Category Management Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-5 w-5" />
              <span className="sr-only">Opções da Categoria</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditCategory(categoryId, categoryName)}>
              <Edit className="mr-2 h-4 w-4" />
              Renomear Categoria
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteCategoryRequest(categoryId, categoryName)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Categoria
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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