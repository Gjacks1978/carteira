
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddAssetForm from "@/components/assets/AddAssetForm";
import AssetTab from "@/components/assets/AssetTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
}

const AssetsPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isAddTabDialogOpen, setIsAddTabDialogOpen] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("asset_categories")
        .select("id, name")
        .order("is_default", { ascending: false })
        .order("name");
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setCategories(data);
        setActiveTab(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar categorias",
        description: "Não foi possível carregar as categorias de ativos."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTab = async () => {
    if (newTabName.trim() === "") {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome da aba não pode estar vazio",
      });
      return;
    }

    if (categories.some((cat) => cat.name.toLowerCase() === newTabName.toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Já existe uma categoria com este nome",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("asset_categories")
        .insert([{ name: newTabName, is_default: false }])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newCategory: Category = {
          id: data.id,
          name: data.name
        };
        
        setCategories([...categories, newCategory]);
        setActiveTab(data.id);
        setNewTabName("");
        setIsAddTabDialogOpen(false);
        
        toast({
          title: "Categoria adicionada",
          description: `A categoria "${newTabName}" foi adicionada com sucesso`,
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar categoria",
        description: "Não foi possível adicionar a categoria. Tente novamente."
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma categoria encontrada</p>
          <Button onClick={() => setIsAddTabDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Categoria
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab || undefined} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="flex-grow overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="capitalize">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <Dialog open={isAddTabDialogOpen} onOpenChange={setIsAddTabDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <AddAssetForm
                title="Adicionar Nova Categoria"
                description="Crie uma nova categoria para seus ativos."
                inputLabel="Nome da Categoria"
                inputPlaceholder="Ex: Imóveis, Previdência, etc."
                buttonLabel="Adicionar Categoria"
                inputValue={newTabName}
                onInputChange={(e) => setNewTabName(e.target.value)}
                onSubmit={handleAddTab}
              />
            </Dialog>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <AssetTab 
                tabId={category.id} 
                categoryId={category.id}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default AssetsPage;
