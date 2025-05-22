
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
import { Crypto } from "@/types/assets";
import { cn } from "@/lib/utils";
import { EditableCell } from "@/components/ui/editable-cell";
import { EditableSelectCell } from "@/components/ui/editable-select-cell";

interface CryptoTableProps {
  crypto: Crypto[];
  onUpdate: (crypto: Crypto) => void;
  onDelete: (id: string) => void;
}

const CryptoTable = ({ crypto, onUpdate, onDelete }: CryptoTableProps) => {
  const [editingCrypto, setEditingCrypto] = useState<Crypto | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cryptoToDelete, setCryptoToDelete] = useState<string | null>(null);
  const [sectors, setSectors] = useState<string[]>([]);
  const [custodies, setCustodies] = useState<string[]>([]);
  
  const usdToBRL = 5.05; // Mock exchange rate

  // Initialize sectors and custodies from crypto data
  useEffect(() => {
    const uniqueSectors = Array.from(
      new Set(crypto.map((item) => item.sector))
    ).filter(Boolean);
    
    const uniqueCustodies = Array.from(
      new Set(crypto.map((item) => item.custody))
    ).filter(Boolean);
    
    setSectors(uniqueSectors);
    setCustodies(uniqueCustodies);
  }, [crypto]);

  const handleEdit = (crypto: Crypto) => {
    setEditingCrypto({ ...crypto });
    setIsEditDialogOpen(true);
  };

  const handleConfirmEdit = () => {
    if (editingCrypto) {
      // Recalculate totals
      const totalUSD = editingCrypto.priceUSD * editingCrypto.quantity;
      const updatedCrypto = {
        ...editingCrypto,
        totalUSD,
        totalBRL: totalUSD * usdToBRL,
      };
      onUpdate(updatedCrypto);
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
      onDelete(cryptoToDelete);
      setIsDeleteDialogOpen(false);
      setCryptoToDelete(null);
    }
  };

  const updateCryptoField = (id: string, field: keyof Crypto, value: any) => {
    const cryptoToUpdate = crypto.find(item => item.id === id);
    if (!cryptoToUpdate) return;

    const updatedCrypto = { ...cryptoToUpdate, [field]: value };
    
    // Recalculate derived values if price or quantity changes
    if (field === 'priceUSD' || field === 'quantity') {
      const totalUSD = updatedCrypto.priceUSD * updatedCrypto.quantity;
      updatedCrypto.totalUSD = totalUSD;
      updatedCrypto.totalBRL = totalUSD * usdToBRL;
    }
    
    onUpdate(updatedCrypto);
  };

  const addSector = (newSector: string) => {
    if (!sectors.includes(newSector)) {
      setSectors([...sectors, newSector]);
    }
  };

  const removeSector = (sectorToRemove: string) => {
    // Only remove if not in use
    const isInUse = crypto.some(item => item.sector === sectorToRemove);
    if (!isInUse) {
      setSectors(sectors.filter(s => s !== sectorToRemove));
    }
  };

  const addCustody = (newCustody: string) => {
    if (!custodies.includes(newCustody)) {
      setCustodies([...custodies, newCustody]);
    }
  };

  const removeCustody = (custodyToRemove: string) => {
    // Only remove if not in use
    const isInUse = crypto.some(item => item.custody === custodyToRemove);
    if (!isInUse) {
      setCustodies(custodies.filter(c => c !== custodyToRemove));
    }
  };

  if (crypto.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Nenhum criptoativo cadastrado. Clique em "Adicionar Criptoativo" para começar.
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
              <TableHead>Ticker</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead className="text-right">Preço (USD)</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Total (USD)</TableHead>
              <TableHead className="text-right">Total (BRL)</TableHead>
              <TableHead>Custódia</TableHead>
              <TableHead className="text-right">% Carteira</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {crypto.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <EditableCell
                    value={item.ticker}
                    onUpdate={(value) => updateCryptoField(item.id, 'ticker', value)}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={item.name}
                    onUpdate={(value) => updateCryptoField(item.id, 'name', value)}
                  />
                </TableCell>
                <TableCell>
                  <EditableSelectCell
                    value={item.sector}
                    options={sectors}
                    onUpdate={(value) => updateCryptoField(item.id, 'sector', value)}
                    onAddOption={addSector}
                    onRemoveOption={removeSector}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <EditableCell
                    value={item.priceUSD}
                    onUpdate={(value) => updateCryptoField(item.id, 'priceUSD', Number(value))}
                    type="number"
                    formatter={(val) => `$${Number(val).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                    className="text-right"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <EditableCell
                    value={item.quantity}
                    onUpdate={(value) => updateCryptoField(item.id, 'quantity', Number(value))}
                    type="number"
                    formatter={(val) => 
                      Number(val) < 1 
                        ? Number(val).toFixed(6) 
                        : Number(val).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          })
                    }
                    className="text-right"
                  />
                </TableCell>
                <TableCell className="text-right">
                  ${item.totalUSD.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {item.totalBRL.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell>
                  <EditableSelectCell
                    value={item.custody}
                    options={custodies}
                    onUpdate={(value) => updateCryptoField(item.id, 'custody', value)}
                    onAddOption={addCustody}
                    onRemoveOption={removeCustody}
                  />
                </TableCell>
                <TableCell 
                  className="text-right font-medium"
                >
                  {item.portfolioPercentage.toFixed(2)}%
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
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit2 className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClick(item.id)}
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
            <DialogTitle>Editar Criptoativo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="ticker" className="text-right">
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
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
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
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="sector" className="text-right">
                Setor
              </label>
              <Input
                id="sector"
                value={editingCrypto?.sector || ""}
                onChange={(e) =>
                  setEditingCrypto((prev) =>
                    prev ? { ...prev, sector: e.target.value } : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="priceUSD" className="text-right">
                Preço (USD)
              </label>
              <Input
                id="priceUSD"
                type="number"
                value={editingCrypto?.priceUSD || 0}
                onChange={(e) =>
                  setEditingCrypto((prev) =>
                    prev
                      ? { ...prev, priceUSD: parseFloat(e.target.value) || 0 }
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
                value={editingCrypto?.quantity || 0}
                onChange={(e) =>
                  setEditingCrypto((prev) =>
                    prev
                      ? { ...prev, quantity: parseFloat(e.target.value) || 0 }
                      : null
                  )
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="custody" className="text-right">
                Custódia
              </label>
              <Input
                id="custody"
                value={editingCrypto?.custody || ""}
                onChange={(e) =>
                  setEditingCrypto((prev) =>
                    prev ? { ...prev, custody: e.target.value } : null
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
            <p>Tem certeza que deseja excluir este criptoativo?</p>
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

export default CryptoTable;
