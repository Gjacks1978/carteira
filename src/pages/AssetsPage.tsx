import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddAssetForm from "@/components/assets/AddAssetForm";
import AssetsSummaryCards from "@/components/assets/AssetsSummaryCards";
import AssetCategorySection from "@/components/assets/AssetCategorySection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Asset } from "@/types/assets";
import { useAuth } from "@/contexts/AuthContext";
import { AllocationByClassCard } from "@/components/assets/AllocationByClassCard";

interface Category {
  id: string;
  name: string;
}

const AssetsPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchCategoriesAndAssets();
  }, []);

  const fetchCategoriesAndAssets = async () => {
    try {
      setLoading(true);
      
      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("asset_categories")
        .select("id, name")
        .order("is_default", { ascending: false })
        .order("name");
      
      if (categoriesError) throw categoriesError;
      
      // Buscar todos os ativos
      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("*");
      
      if (assetsError) throw assetsError;
      
      if (categoriesData) {
        setCategories(categoriesData);
      }
      
      if (assetsData) {
        const transformedAssets = assetsData.map(item => ({
          id: item.id,
          name: item.name,
          ticker: item.ticker,
          type: item.type,
          price: Number(item.price),
          quantity: Number(item.quantity),
          total: Number(item.total),
          return: Number(item.return_value),
          returnPercentage: Number(item.return_percentage),
          categoryId: item.category_id,
        }));
        
        setAssets(transformedAssets);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as categorias e ativos."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === "") {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome da categoria não pode estar vazio",
      });
      return;
    }

    if (categories.some((cat) => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
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
        .insert([{ name: newCategoryName, is_default: false }])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setCategories([...categories, { id: data.id, name: data.name }]);
        setNewCategoryName("");
        setIsAddCategoryDialogOpen(false);
        
        toast({
          title: "Categoria adicionada",
          description: `A categoria "${newCategoryName}" foi adicionada com sucesso`,
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar categoria",
        description: "Não foi possível adicionar a categoria."
      });
    }
  };

  const handleAddAsset = async (categoryId: string, newAsset: Partial<Asset>) => {
    try {
      const { data, error } = await supabase
        .from("assets")
        .insert([
          {
            user_id: user?.id,
            name: newAsset.name,
            ticker: newAsset.ticker,
            type: newAsset.type || "Outros",
            price: newAsset.price || 0,
            quantity: newAsset.quantity || 0,
            total: newAsset.total || 0,
            return_value: 0,
            return_percentage: 0,
            category_id: categoryId
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newAssetItem: Asset = {
          id: data.id,
          name: data.name,
          ticker: data.ticker,
          type: data.type,
          price: Number(data.price),
          quantity: Number(data.quantity),
          total: Number(data.total),
          return: Number(data.return_value),
          returnPercentage: Number(data.return_percentage),
          categoryId: data.category_id,
        };
        
        setAssets([...assets, newAssetItem]);
        
        toast({
          title: "Ativo adicionado",
          description: `${newAssetItem.name} foi adicionado com sucesso`,
        });
      }
    } catch (error) {
      console.error("Error adding asset:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar ativo",
        description: "Não foi possível adicionar o ativo."
      });
    }
  };

  const handleUpdateAsset = async (updatedAsset: Asset) => {
    try {
      const { error } = await supabase
        .from("assets")
        .update({
          name: updatedAsset.name,
          ticker: updatedAsset.ticker,
          type: updatedAsset.type,
          price: updatedAsset.price,
          quantity: updatedAsset.quantity,
          total: updatedAsset.total,
          return_value: updatedAsset.return,
          return_percentage: updatedAsset.returnPercentage
        })
        .eq("id", updatedAsset.id);
      
      if (error) throw error;
      
      const updatedAssets = assets.map((asset) =>
        asset.id === updatedAsset.id ? updatedAsset : asset
      );
      
      setAssets(updatedAssets);
      
      toast({
        title: "Ativo atualizado",
        description: `${updatedAsset.name} foi atualizado com sucesso`
      });
    } catch (error) {
      console.error("Error updating asset:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar ativo",
        description: "Não foi possível atualizar o ativo."
      });
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      const assetToDelete = assets.find((asset) => asset.id === id);
      
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      const updatedAssets = assets.filter((asset) => asset.id !== id);
      setAssets(updatedAssets);
      
      if (assetToDelete) {
        toast({
          title: "Ativo removido",
          description: `${assetToDelete.name} foi removido com sucesso`,
        });
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover ativo",
        description: "Não foi possível remover o ativo."
      });
    }
  };

  const getAssetsByCategory = (categoryId: string) => {
    return assets.filter(asset => asset.categoryId === categoryId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-2 sm:mb-0">
          Meus Ativos
        </h1>
        <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Categoria
            </Button>
          </DialogTrigger>
          <AddAssetForm
            title="Adicionar Nova Categoria"
            description="Crie uma nova categoria para seus ativos."
            inputLabel="Nome da Categoria"
            inputPlaceholder="Ex: Imóveis, Previdência, etc."
            buttonLabel="Adicionar Categoria"
            inputValue={newCategoryName}
            onInputChange={(e) => setNewCategoryName(e.target.value)}
            onSubmit={handleAddCategory}
          />
        </Dialog>
      </div>

      {/* Grid para os cards de resumo e alocação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* AssetsSummaryCards ocupará 2 colunas em telas médias e grandes, 1 em pequenas */}
        <div className="md:col-span-2">
          <AssetsSummaryCards assets={assets} /> 
        </div>
        {/* AllocationByClassCard ocupará 1 coluna em telas médias e grandes, 1 em pequenas */}
        <div className="md:col-span-1">
          <AllocationByClassCard assets={assets} />
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma categoria encontrada</p>
          <Button onClick={() => setIsAddCategoryDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Categoria
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryAssets = getAssetsByCategory(category.id);
            
            return (
              <AssetCategorySection
                key={category.id}
                categoryName={category.name}
                categoryId={category.id}
                assets={categoryAssets}
                onAddAsset={(newAsset) => handleAddAsset(category.id, newAsset)}
                onUpdateAsset={handleUpdateAsset}
                onDeleteAsset={handleDeleteAsset}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
