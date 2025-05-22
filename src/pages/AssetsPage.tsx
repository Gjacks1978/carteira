
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddAssetForm from "@/components/assets/AddAssetForm";
import AssetTab from "@/components/assets/AssetTab";
import { assetData } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

interface CustomTab {
  id: string;
  label: string;
}

const defaultTabs = [
  { id: "renda-fixa", label: "Renda Fixa" },
  { id: "renda-var-br", label: "Renda Variável BR" },
  { id: "renda-var-eua", label: "Renda Variável EUA" },
  { id: "caixa", label: "Caixa" },
];

const AssetsPage = () => {
  const [tabs, setTabs] = useState<CustomTab[]>(defaultTabs);
  const [activeTab, setActiveTab] = useState("renda-fixa");
  const [isAddTabDialogOpen, setIsAddTabDialogOpen] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const { toast } = useToast();

  // Function to add a new custom tab
  const handleAddTab = () => {
    if (newTabName.trim() === "") {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome da aba não pode estar vazio",
      });
      return;
    }

    const newTabId = newTabName.toLowerCase().replace(/\s+/g, "-");

    if (tabs.some((tab) => tab.id === newTabId)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Já existe uma aba com este nome",
      });
      return;
    }

    const newTab = { id: newTabId, label: newTabName };
    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
    setNewTabName("");
    setIsAddTabDialogOpen(false);
    
    toast({
      title: "Aba adicionada",
      description: `A aba "${newTabName}" foi adicionada com sucesso`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ativos</h2>
          <p className="text-muted-foreground">
            Gerenciamento dos seus investimentos
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="flex-grow overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="capitalize">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <Dialog open={isAddTabDialogOpen} onOpenChange={setIsAddTabDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Aba
              </Button>
            </DialogTrigger>
            <AddAssetForm
              title="Adicionar Nova Aba"
              description="Crie uma nova categoria para seus ativos."
              inputLabel="Nome da Aba"
              inputPlaceholder="Ex: Imóveis, Previdência, etc."
              buttonLabel="Adicionar Aba"
              inputValue={newTabName}
              onInputChange={(e) => setNewTabName(e.target.value)}
              onSubmit={handleAddTab}
            />
          </Dialog>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <AssetTab 
              tabId={tab.id} 
              assets={assetData[tab.id as keyof typeof assetData] || []} 
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AssetsPage;
