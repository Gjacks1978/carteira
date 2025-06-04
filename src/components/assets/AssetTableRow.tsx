
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Asset } from "@/types/assets";
import { cn } from "@/lib/utils";
import { EditableCell } from "@/components/ui/editable-cell";
import { EditableSelectCell } from "@/components/ui/editable-select-cell";

interface AssetTableRowProps {
  asset: Asset;
  assetTypes: string[];
  onUpdateField: (id: string, field: keyof Asset, value: any) => void;
  onAddAssetType: (newType: string) => void;
  onRemoveAssetType: (typeToRemove: string) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

const AssetTableRow = ({
  asset,
  assetTypes,
  onUpdateField,
  onAddAssetType,
  onRemoveAssetType,
  onEdit,
  onDelete,
}: AssetTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <EditableCell
          value={asset.name}
          onUpdate={(value) => onUpdateField(asset.id, 'name', value)}
        />
      </TableCell>
      <TableCell>
        <EditableCell
          value={asset.ticker}
          onUpdate={(value) => onUpdateField(asset.id, 'ticker', value)}
        />
      </TableCell>
      <TableCell>
        <EditableSelectCell
          value={asset.type}
          options={assetTypes}
          onUpdate={(value) => onUpdateField(asset.id, 'type', value)}
          onAddOption={onAddAssetType}
          onRemoveOption={onRemoveAssetType}
        />
      </TableCell>
      <TableCell className="text-right">
        <EditableCell
          value={asset.price}
          onUpdate={(value) => onUpdateField(asset.id, 'price', Number(value))}
          type="number"
          formatter={(val) =>
            Number(val).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }
          className="text-right"
        />
      </TableCell>
      <TableCell className="text-right">
        <EditableCell
          value={asset.quantity}
          onUpdate={(value) => onUpdateField(asset.id, 'quantity', Number(value))}
          type="number"
          className="text-right"
        />
      </TableCell>
      <TableCell className="text-right font-medium">
        {(asset.current_total_value_brl ?? 0).toLocaleString("pt-BR", {
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
      <TableCell className="text-center">
        <div className="flex justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(asset)}
          >
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(asset.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Excluir</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default AssetTableRow;
