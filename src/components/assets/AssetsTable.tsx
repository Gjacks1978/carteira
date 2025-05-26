
import { useState, useEffect } from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Asset } from "@/types/assets";
import AssetTableRow from "./AssetTableRow";
import EditAssetDialog from "./EditAssetDialog";
import DeleteAssetDialog from "./DeleteAssetDialog";

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
    const uniqueTypes = Array.from(new Set(assets.map(asset => asset.type))).filter(Boolean);
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
        total: editingAsset.price * editingAsset.quantity
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

    const updatedAsset = {
      ...assetToUpdate,
      [field]: value
    };

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
      <div className="rounded-md border bg-white">
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
              <TableHead className="text-center w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map(asset => (
              <AssetTableRow
                key={asset.id}
                asset={asset}
                assetTypes={assetTypes}
                onUpdateField={updateAssetField}
                onAddAssetType={addAssetType}
                onRemoveAssetType={removeAssetType}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <EditAssetDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingAsset={editingAsset}
        onAssetChange={setEditingAsset}
        onConfirm={handleConfirmEdit}
      />

      <DeleteAssetDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default AssetsTable;
