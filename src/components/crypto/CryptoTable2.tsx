import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { Crypto } from "@/types/assets";
import { EditableCell } from "@/components/ui/editable-cell";
import { EditableSelectCell } from "@/components/ui/editable-select-cell";
import { Input } from "@/components/ui/input";

interface CryptoTable2Props {
  data: Crypto[];
  onUpdateRow: (crypto: Crypto) => void;
  onDeleteRow: (id: string) => void;
  sectors: string[];
  custodies: string[];
  onAddSector: (sectorName: string) => void;
  onRemoveSector: (sectorName: string) => void;
  onAddCustody: (custodyName: string) => void;
  onRemoveCustody: (custodyName: string) => void;
}

const CryptoTable2 = ({
  data,
  onUpdateRow,
  onDeleteRow,
  sectors,
  custodies,
  onAddSector,
  onRemoveSector,
  onAddCustody,
  onRemoveCustody,
}: CryptoTable2Props) => {
  const [editingCrypto, setEditingCrypto] = useState<Crypto | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cryptoToDelete, setCryptoToDelete] = useState<string | null>(null);

  const usdToBRL = 5.05; // Mock exchange rate - consider moving to a shared config or prop if dynamic

  const handleEdit = (asset: Crypto) => {
    setEditingCrypto({ ...asset });
    setIsEditDialogOpen(true);
  };

  const updateCryptoField = (id: string, field: keyof Crypto, value: string | number) => {
    const crypto = data.find((item) => item.id === id);
    if (!crypto) return;

    const updatedCrypto: Crypto = { 
      ...crypto,
      [field]: typeof value === 'string' ? parseFloat(value) : value
    };

    // Recalculate totals if price or quantity changed
    if (field === "priceUSD" || field === "quantity") {
      updatedCrypto.totalUSD = Number(updatedCrypto.priceUSD) * Number(updatedCrypto.quantity);
      updatedCrypto.totalBRL = Number(updatedCrypto.totalUSD) * usdToBRL;
    }

    onUpdateRow(updatedCrypto);
  };

  const handleConfirmEdit = () => {
    if (editingCrypto) {
      const updatedCrypto = {
        ...editingCrypto,
        totalUSD: editingCrypto.priceUSD * editingCrypto.quantity,
        totalBRL: editingCrypto.priceUSD * editingCrypto.quantity * usdToBRL,
      };
      onUpdateRow(updatedCrypto);
      setIsEditDialogOpen(false);
      setEditingCrypto(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setCryptoToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cryptoToDelete) {
      onDeleteRow(cryptoToDelete);
      setIsDeleteDialogOpen(false);
      setCryptoToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Criptoativos 2</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ticker</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[150px]">Setor</TableHead>
                <TableHead className="w-[150px]">Preço USD</TableHead>
                <TableHead className="w-[150px]">Quantidade</TableHead>
                <TableHead className="w-[150px]">Total USD</TableHead>
                <TableHead className="w-[150px]">Total BRL</TableHead>
                <TableHead className="w-[150px]">Custódia</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((crypto) => (
                <TableRow key={crypto.id}>
                  <TableCell className="font-medium">{crypto.ticker}</TableCell>
                  <TableCell>
                    <EditableCell
                      value={crypto.name}
                      onUpdate={(value: string) => updateCryptoField(crypto.id, "name", value)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableSelectCell
                      value={crypto.sector}
                      options={sectors}
                      onUpdate={(value: string) => updateCryptoField(crypto.id, "sector", value)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={crypto.priceUSD.toString()}
                      onUpdate={(value: string) =>
                        updateCryptoField(crypto.id, "priceUSD", parseFloat(value))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={crypto.quantity.toString()}
                      onUpdate={(value: string) =>
                        updateCryptoField(crypto.id, "quantity", parseFloat(value))
                      }
                    />
                  </TableCell>
                  <TableCell>{crypto.totalUSD.toFixed(2)}</TableCell>
                  <TableCell>{crypto.totalBRL.toFixed(2)}</TableCell>
                  <TableCell>
                    <EditableSelectCell
                      value={crypto.custody}
                      options={custodies}
                      onUpdate={(value: string) => updateCryptoField(crypto.id, "custody", value)}
                    />
                  </TableCell>
                  <TableCell className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(crypto)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(crypto.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Criptomoeda</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label htmlFor="ticker" className="block text-sm font-medium">
                  Ticker
                </label>
                <Input
                  id="ticker"
                  value={editingCrypto?.ticker || ""}
                  onChange={(e) =>
                    setEditingCrypto((prev) =>
                      prev ? { ...prev, ticker: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Nome
                </label>
                <Input
                  id="name"
                  value={editingCrypto?.name || ""}
                  onChange={(e) =>
                    setEditingCrypto((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="sector" className="block text-sm font-medium">
                  Setor
                </label>
                <select
                  id="sector"
                  value={editingCrypto?.sector || ""}
                  onChange={(e) =>
                    setEditingCrypto((prev) =>
                      prev ? { ...prev, sector: e.target.value } : null
                    )
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label htmlFor="custody" className="block text-sm font-medium">
                  Custódia
                </label>
                <select
                  id="custody"
                  value={editingCrypto?.custody || ""}
                  onChange={(e) =>
                    setEditingCrypto((prev) =>
                      prev ? { ...prev, custody: e.target.value } : null
                    )
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {custodies.map((custody) => (
                    <option key={custody} value={custody}>
                      {custody}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label htmlFor="priceUSD" className="block text-sm font-medium">
                  Preço USD
                </label>
                <Input
                  id="priceUSD"
                  type="number"
                  value={editingCrypto?.priceUSD || ""}
                  onChange={(e) =>
                    setEditingCrypto((prev) =>
                      prev ? { ...prev, priceUSD: parseFloat(e.target.value) } : null
                    )
                  }
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="quantity" className="block text-sm font-medium">
                  Quantidade
                </label>
                <Input
                  id="quantity"
                  type="number"
                  value={editingCrypto?.quantity || ""}
                  onChange={(e) =>
                    setEditingCrypto((prev) =>
                      prev ? { ...prev, quantity: parseFloat(e.target.value) } : null
                    )
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir esta criptomoeda?
            </p>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CryptoTable2;
