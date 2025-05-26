
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Asset } from "@/types/assets";

interface EditAssetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingAsset: Asset | null;
  onAssetChange: (asset: Asset | null) => void;
  onConfirm: () => void;
}

const EditAssetDialog = ({
  isOpen,
  onOpenChange,
  editingAsset,
  onAssetChange,
  onConfirm,
}: EditAssetDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                onAssetChange(
                  editingAsset
                    ? { ...editingAsset, name: e.target.value }
                    : null
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
                onAssetChange(
                  editingAsset
                    ? { ...editingAsset, ticker: e.target.value }
                    : null
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
                onAssetChange(
                  editingAsset
                    ? { ...editingAsset, type: e.target.value }
                    : null
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
                onAssetChange(
                  editingAsset
                    ? { ...editingAsset, price: parseFloat(e.target.value) || 0 }
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
                onAssetChange(
                  editingAsset
                    ? { ...editingAsset, quantity: parseFloat(e.target.value) || 0 }
                    : null
                )
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssetDialog;
