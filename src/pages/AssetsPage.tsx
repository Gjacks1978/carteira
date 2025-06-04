import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddAssetForm from "@/components/assets/AddAssetForm";
import AssetsSummaryCards from "@/components/assets/AssetsSummaryCards";
import AssetCategorySection from "@/components/assets/AssetCategorySection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Asset, Category as AssetCategoryType } from "@/types/assets";
import { useAuth } from "@/contexts/AuthContext";
import { AllocationByClassCard } from "@/components/assets/AllocationByClassCard";
import {
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogContent // Adicionado para envolver o conteúdo do diálogo de exclusão
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
}

const AssetsPage = () => {
  const [categories, setCategories] = useState<AssetCategoryType[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalCryptoValue, setTotalCryptoValue] = useState<number>(0);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<{ id: string, name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCategoriesAndAssets();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCategoriesAndAssets = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      
      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("asset_categories")
        .select("id, name, user_id, is_default")
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order("is_default", { ascending: false })
        .order("name");
      
      if (categoriesError) throw categoriesError;
      
      // Buscar todos os ativos
      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id);
      
      if (assetsError) throw assetsError;

      // BUSCAR DADOS DE CRIPTO E CALCULAR TOTAL
      const { data: cryptoData, error: cryptoError } = await supabase
        .from("crypto_assets") // Corrigido nome da tabela
        .select("total_brl") // Corrigido para o nome da coluna conforme Supabase Studio
        .eq("user_id", user.id); // Assumindo coluna user_id

      if (cryptoError) throw cryptoError;

      let calculatedTotalCryptoValue = 0;
      if (cryptoData) {
        calculatedTotalCryptoValue = cryptoData.reduce((sum, crypto) => {
          const value = parseFloat(crypto.total_brl as any);
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
      }
      setTotalCryptoValue(calculatedTotalCryptoValue);
      // FIM DA BUSCA DE CRIPTO
      
      if (categoriesData) {
        setCategories(categoriesData as AssetCategoryType[]);
      }
      
      if (assetsData) {
        const transformedAssets = assetsData.map(item => ({
          id: item.id,
          name: item.name,
          ticker: item.ticker,
          type: item.type,
          price: Number(item.price),
          quantity: Number(item.quantity),
          current_total_value_brl: Number((item as any).current_total_value_brl || 0),
          return: Number(item.return_value),
          returnPercentage: Number(item.return_percentage),
          categoryId: item.category_id,
          user_id: item.user_id
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
      // Obter o usuário atual da sessão
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user or no user logged in:", userError);
        toast({
          variant: "destructive",
          title: "Erro de Autenticação",
          description: "Usuário não autenticado. Faça login para adicionar categorias.",
        });
        return;
      }

      const trimmedNewCategoryName = newCategoryName.trim(); // Usar nome trimado na inserção

      const { data, error } = await supabase
        .from("asset_categories")
        .insert([{ 
            name: trimmedNewCategoryName, 
            is_default: false, 
            user_id: user.id 
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Assumindo que 'data' retorna o objeto completo, incluindo id, name, user_id
        setCategories([...categories, { id: data.id, name: data.name, user_id: data.user_id, is_default: data.is_default }]);
        setNewCategoryName("");
        setIsAddCategoryDialogOpen(false);
        
        toast({
          title: "Categoria adicionada",
          description: `A categoria "${trimmedNewCategoryName}" foi adicionada com sucesso`,
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
            current_total_value_brl: (newAsset as any).total || 0,
            return_value: (newAsset as any).return || 0,
            return_percentage: (newAsset as any).returnPercentage || 0,
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
          current_total_value_brl: Number((data as any).current_total_value_brl || 0),
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
      const calculatedTotal = (updatedAsset.price || 0) * (updatedAsset.quantity || 0);

      const { error } = await supabase
        .from("assets")
        .update({
          name: updatedAsset.name,
          ticker: updatedAsset.ticker,
          type: updatedAsset.type,
          price: updatedAsset.price,
          quantity: updatedAsset.quantity,
          current_total_value_brl: calculatedTotal,
          return_value: updatedAsset.return,
          return_percentage: updatedAsset.returnPercentage
        })
        .eq("id", updatedAsset.id);
      
      if (error) throw error;
      
      const assetsWithRecalculatedTotal = assets.map((asset) =>
        asset.id === updatedAsset.id ? { ...updatedAsset, current_total_value_brl: calculatedTotal } : asset
      );
      setAssets(assetsWithRecalculatedTotal);
      
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

  const handleOpenEditCategoryDialog = (categoryId: string, currentName: string) => {
    setEditingCategory({ id: categoryId, name: currentName });
    setEditedCategoryName(currentName);
    setIsEditCategoryDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editedCategoryName) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Dados da categoria inválidos.",
      });
      return;
    }

    const trimmedNewName = editedCategoryName.trim();

    if (trimmedNewName === "") {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "O nome da categoria não pode ser vazio.",
      });
      return;
    }

    if (trimmedNewName === editingCategory.name) {
      toast({
        title: "Nenhuma Alteração",
        description: "O nome da categoria não foi alterado.",
      });
      setIsEditCategoryDialogOpen(false);
      setEditingCategory(null);
      setEditedCategoryName("");
      return;
    }

    // Verificar se o novo nome da categoria já existe
    const { data: existingCategories, error: fetchError } = await supabase
      .from('asset_categories')
      .select('name')
      .eq('name', trimmedNewName)
      .neq('id', editingCategory.id); // Excluir a categoria atual da verificação

    if (fetchError) {
      console.error('Erro ao verificar categorias existentes:', fetchError);
      toast({
        variant: "destructive",
        title: "Erro no Servidor",
        description: "Não foi possível verificar nomes de categoria duplicados.",
      });
      return;
    }

    if (existingCategories && existingCategories.length > 0) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: `A categoria "${trimmedNewName}" já existe.`,
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("asset_categories")
        .update({ name: trimmedNewName })
        .eq("id", editingCategory.id);

      if (error) throw error;

      // Atualizar estado local
      setCategories(prevCategories =>
        prevCategories.map(cat =>
          cat.id === editingCategory.id ? { ...cat, name: trimmedNewName } : cat
        )
      );

      toast({ title: "Categoria Atualizada", description: `Categoria "${editingCategory.name}" renomeada para "${trimmedNewName}".` });
      setIsEditCategoryDialogOpen(false);
      setEditingCategory(null);
      setEditedCategoryName("");

    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar a categoria.",
      });
    }
  };

  const handleOpenDeleteCategoryDialog = (categoryId: string, categoryName: string) => {
    setDeletingCategory({ id: categoryId, name: categoryName });
    setIsDeleteCategoryDialogOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    // TODO: Implement category deletion logic
    if (!deletingCategory) return;

    // Check if category has assets
    const assetsInCategory = assets.filter(asset => asset.categoryId === deletingCategory.id);
    if (assetsInCategory.length > 0) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: `A categoria "${deletingCategory.name}" possui ativos. Mova ou exclua os ativos primeiro.`,
      });
      setIsDeleteCategoryDialogOpen(false);
      setDeletingCategory(null);
      return;
    }
    try {
      if (!deletingCategory) return; // Adicionando uma verificação extra de segurança

      const { error } = await supabase
        .from("asset_categories")
        .delete()
        .eq("id", deletingCategory.id);

      if (error) throw error;

      // Atualizar estado local
      setCategories(prevCategories =>
        prevCategories.filter(cat => cat.id !== deletingCategory!.id)
      );
      
      toast({ title: "Categoria Excluída", description: `A categoria "${deletingCategory.name}" foi excluída com sucesso.` });
      setIsDeleteCategoryDialogOpen(false);
      setDeletingCategory(null);

    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: "Não foi possível excluir a categoria.",
      });
      // Mesmo em caso de erro, fechar o diálogo e limpar o estado.
      setIsDeleteCategoryDialogOpen(false);
      setDeletingCategory(null);
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
          <AssetsSummaryCards assets={assets} totalCryptoValue={totalCryptoValue} /> 
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
                onEditCategory={handleOpenEditCategoryDialog}
                onDeleteCategoryRequest={handleOpenDeleteCategoryDialog}
              />
            );
          })}
        </div>
      )}

      {/* Modal para Renomear Categoria */}
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {editingCategory && (
            <AddAssetForm
              title="Renomear Categoria"
              description={`Renomeie a categoria "${editingCategory.name}".`}
              inputLabel="Novo Nome da Categoria"
              inputPlaceholder="Ex: Renda Fixa Global"
              buttonLabel="Salvar Alterações"
              inputValue={editedCategoryName}
              onInputChange={(e) => setEditedCategoryName(e.target.value)}
              onSubmit={handleUpdateCategory} // onClose foi removido daqui
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Confirmar Exclusão de Categoria */}
      <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              {deletingCategory &&
                `Tem certeza que deseja excluir a categoria "${deletingCategory.name}"? Esta ação não pode ser desfeita.`}
              {deletingCategory && assets.some(asset => asset.categoryId === deletingCategory.id) &&
                <p className="text-red-500 mt-2">Atenção: Esta categoria contém ativos. Se você excluir a categoria, os ativos associados podem ficar órfãos ou precisarão ser reatribuídos.</p>
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteCategory}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetsPage;
