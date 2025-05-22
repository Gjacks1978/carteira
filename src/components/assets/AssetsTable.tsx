
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { Asset } from "@/types/assets";
import { cn } from "@/lib/utils";
import { EditableCell } from "@/components/ui/editable-cell";
import { EditableSelectCell } from "@/components/ui/editable-select-cell";

interface AssetsTableProps {
  assets: Asset[];
  onUpdate: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

const AssetsTable = ({ assets, onUpdate, onDelete }: AssetsTableProps) => {
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [assetTypes, setAssetTypes] = useState<string[]>([]);

  // Initialize asset types from data
  useEffect(() => {
    const uniqueTypes = Array.from(
      new Set(assets.map((asset) => asset.type))
    ).filter(Boolean);
    setAssetTypes(uniqueTypes);
  }, [assets]);

  const handleEdit = (asset: Asset) => {
    setEditingAsset({ ...asset });
    setIsEditDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (editingAsset) {
      // Recalculate total
      const updatedAsset = {
        ...editingAsset,
        total: editingAsset.price * editingAsset.quantity,
      };
      onUpdate(updatedAsset);
      setIsEditDialogOpen(false);
      setEditingAsset(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setAssetToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (assetToDelete) {
      onDelete(assetToDelete);
      setIsDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  const updateAssetField = (id: string, field: keyof Asset, value: any) => {
    const assetToUpdate = assets.find(item => item.id === id);
    if (!assetToUpdate) return;

    const updatedAsset = { ...assetToUpdate, [field]: value };
    
    // Recalculate total if price or quantity changes
    if (field === 'price' || field === 'quantity') {
      updatedAsset.total = updatedAsset.price * updatedAsset.quantity;
    }
    
    onUpdate(updatedAsset);
  };

  const addAssetType = (newType: string) => {
    if (!assetTypes.includes(newType)) {
      setAssetTypes([...assetTypes, newType]);
    }
  };

  const removeAssetType = (typeToRemove: string) => {
    // Only remove if not in use
    const isInUse = assets.some(item => item.type === typeToRemove);
    if (!isInUse) {
      setAssetTypes(assetTypes.filter(t => t !== typeToRemove));
    }
  };

  if (assets.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Nenhum ativo cadastrado. Clique em "Adicionar Ativo" para começar.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Ticker</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Preço (R$)</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Total (R$)</TableHead>
              <TableHead className="text-right">Rentab. (%)</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">
                  <EditableCell
                    value={asset.name}
                    onUpdate={(value) => updateAssetField(asset.id, 'name', value)}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={asset.ticker}
                    onUpdate={(value) => updateAssetField(asset.id, 'ticker', value)}
                  />
                </TableCell>
                <TableCell>
                  <EditableSelectCell
                    value={asset.type}
                    options={assetTypes}
                    onUpdate={(value) => updateAssetField(asset.id, 'type', value)}
                    onAddOption={addAssetType}
                    onRemoveOption={removeAssetType}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <EditableCell
                    value={asset.price}
                    onUpdate={(value) => updateAssetField(asset.id, 'price', Number(value))}
                    type="number"
                    formatter={(val) => Number(val).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    className="text-right"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <EditableCell
                    value={asset.quantity}
                    onUpdate={(value) => updateAssetField(asset.id, 'quantity', Number(value))}
                    type="number"
                    className="text-right"
                  />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {asset.total.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell 
                  className={cn(
                    "text-right font-medium",
                    asset.returnPercentage > 0 && "text-success",
                    asset.returnPercentage < 0 && "text-danger"
                  )}
                >
                  {asset.returnPercentage > 0 && "+"}
                  {asset.returnPercentage.toFixed(2)}%
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(asset)}>
                        <Edit2 className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClick(asset.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Ativo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Nome
              </label>
              <Input
                id="name"
                value={editingAsset?.name || ""}
                onChange={(e) =>
                  setEditingAsset((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="ticker" className="text-right">
                Ticker
              </label>
              <Input
                id="ticker"
                value={editingAsset?.ticker || ""}
                onChange={(e) =>
                  setEditingAsset((prev) =>
                    prev ? { ...prev, ticker: e.target.value } : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="type" className="text-right">
                Tipo
              </label>
              <Input
                id="type"
                value={editingAsset?.type || ""}
                onChange={(e) =>
                  setEditingAsset((prev) =>
                    prev ? { ...prev, type: e.target.value } : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="price" className="text-right">
                Preço (R$)
              </label>
              <Input
                id="price"
                type="number"
                value={editingAsset?.price || 0}
                onChange={(e) =>
                  setEditingAsset((prev) =>
                    prev
                      ? { ...prev, price: parseFloat(e.target.value) || 0 }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="quantity" className="text-right">
                Quantidade
              </label>
              <Input
                id="quantity"
                type="number"
                value={editingAsset?.quantity || 0}
                onChange={(e) =>
                  setEditingAsset((prev) =>
                    prev
                      ? { ...prev, quantity: parseFloat(e.target.value) || 0 }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir este ativo?</p>
            <p className="text-sm text-muted-foreground mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssetsTable;
