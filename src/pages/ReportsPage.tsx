import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';

// Helper to retrieve saved date range from localStorage (or default)
const getInitialDateRange = (): DateRange | undefined => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('reportsDateRange');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed === null) return undefined; // 'Sempre' preset
        const from = parsed.from ? new Date(parsed.from) : undefined;
        const to = parsed.to ? new Date(parsed.to) : undefined;
        if (from || to) {
          return { from, to };
        }
      } catch (err) {
        console.error('[ReportsPage] Falha ao ler período salvo:', err);
      }
    }
  }
  return { from: subDays(new Date(), 90), to: new Date() };
};

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import RegisterSnapshotModal from '@/components/reports/RegisterSnapshotModal';
import SnapshotHistoryTable from '@/components/reports/SnapshotHistoryTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetPivotTable from '@/components/reports/AssetPivotTable';
import PatrimonioTotalChart from '@/components/reports/PatrimonioTotalChart';
import AssetEvolutionStackedBarChart from '@/components/reports/AssetEvolutionStackedBarChart';
import CategoryEvolutionStackedBarChart from '@/components/reports/CategoryEvolutionStackedBarChart';
import AllocationChart from '@/components/dashboard/AllocationChart';
import AllocationBreakdownList from '@/components/dashboard/AllocationBreakdownList';
import { getCategoryColorMap } from '@/lib/chart-colors';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { SnapshotGroupWithTotal, SnapshotItem } from '@/types/reports'; // Import type
import { toast } from 'sonner';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { CSVLink } from 'react-csv';
import { FileDown } from 'lucide-react'; // Import type

const ReportsPage: React.FC = () => {
  const [date, setDate] = useState<DateRange | undefined>(getInitialDateRange());
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snapshotGroupsData, setSnapshotGroupsData] = useState<SnapshotGroupWithTotal[]>([]);
  const [snapshotToEdit, setSnapshotToEdit] = useState<SnapshotGroupWithTotal | null>(null);
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [pageFetchError, setPageFetchError] = useState<string | null>(null);
  const [portfolioAllocationData, setPortfolioAllocationData] = useState<{name: string, value: number}[]>([]);
  const [categoryColorMap, setCategoryColorMap] = useState<Map<string, string>>(new Map());
  const [totalValueForAllocation, setTotalValueForAllocation] = useState(0);

  const filteredData = useMemo(() => {
    if (!date?.from) return snapshotGroupsData;
    
    const fromDate = date.from;
    // Set the 'to' date to the end of the selected day
    const toDate = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : new Date();

    return snapshotGroupsData.filter(group => {
      const groupDate = new Date(group.created_at);
      return groupDate >= fromDate && groupDate <= toDate;
    });
    }, [snapshotGroupsData, date]);

  const { initial, final, pnl, pnlPercent } = useMemo(() => {
    if (filteredData.length < 1) {
      return { initial: 0, final: 0, pnl: 0, pnlPercent: 0 };
    }

    // Ensure data is sorted by date ascending to correctly identify initial and final values
    const sortedData = [...filteredData].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const initialValue = sortedData[0]?.totalPatrimonioGrupo ?? 0;
    const finalValue = sortedData[sortedData.length - 1]?.totalPatrimonioGrupo ?? 0;
    const pnlValue = finalValue - initialValue;
    const pnlPercentage = initialValue !== 0 ? (pnlValue / initialValue) * 100 : 0;

    return { initial: initialValue, final: finalValue, pnl: pnlValue, pnlPercent: pnlPercentage };
  }, [filteredData]);

  const { csvData, csvHeaders } = useMemo(() => {
    if (!filteredData) return { csvData: [], csvHeaders: [] };

    const data = filteredData.map(group => ({
      data: new Date(group.created_at).toLocaleString('pt-BR'),
      notas: group.notes || '',
      patrimonio_total: group.totalPatrimonioGrupo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }));

    const headers = [
      { label: "Data", key: "data" },
      { label: "Notas", key: "notas" },
      { label: "Patrimônio Total (R$)", key: "patrimonio_total" },
    ];

    return { csvData: data, csvHeaders: headers };
  }, [filteredData]);

  useEffect(() => {
    if (filteredData.length > 0) {
      // Data is already sorted by date ascending in the 'pnl' useMemo, but let's be safe
      const latestSnapshot = [...filteredData].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      if (latestSnapshot && latestSnapshot.snapshot_items) {
        const allocationMap = new Map<string, number>();
        
        latestSnapshot.snapshot_items.forEach(item => {
          const category = item.asset_category_name || 'Sem Categoria';
          const currentValue = allocationMap.get(category) || 0;
          allocationMap.set(category, currentValue + (item.total_value_brl || 0));
        });

        const allocationData = Array.from(allocationMap)
          .map(([name, value]) => ({ name, value }))
          .filter(item => item.value > 0);
        
        setPortfolioAllocationData(allocationData);
        setTotalValueForAllocation(latestSnapshot.totalPatrimonioGrupo);

        const categoryNames = allocationData.map(item => item.name);
        setCategoryColorMap(getCategoryColorMap(categoryNames));
      }
    } else {
      setPortfolioAllocationData([]);
      setCategoryColorMap(new Map());
      setTotalValueForAllocation(0);
    }
  }, [filteredData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Podem ocorrer três cenários:
      // 1) date é undefined -> usuário selecionou "Sempre". Salvamos null.
      // 2) date definido porém sem to -> intervalo aberto.
      // 3) intervalo completo.
      const payload = date
        ? {
            from: date.from ? date.from.toISOString() : null,
            to: date.to ? date.to.toISOString() : null,
          }
        : null;
      localStorage.setItem('reportsDateRange', JSON.stringify(payload));
    }
  }, [date]);

  const fetchSnapshotHistory = useCallback(async () => {
    if (!user) {
      setPageIsLoading(false);
      setSnapshotGroupsData([]);
      return;
    }

    setPageIsLoading(true);
    setPageFetchError(null);

    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('snapshot_groups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;
      if (!groupsData) {
        setSnapshotGroupsData([]);
        setPageIsLoading(false);
        return;
      }

      const groupsWithTotals: SnapshotGroupWithTotal[] = await Promise.all(
        groupsData.map(async (group) => {
          const { data: items, error: itemsError } = await supabase
            .from('snapshot_items')
            .select('id, asset_id, asset_name, asset_category_name, total_value_brl, is_crypto_total')
            .eq('snapshot_group_id', group.id);

          if (itemsError) {
            console.error(`[ReportsPage] Error fetching items for group ${group.id}:`, itemsError);
            return { ...group, totalPatrimonioGrupo: 0, snapshot_items: [] }; // Return 0 if items fetch fails
          }

          const totalPatrimonioGrupo = items?.reduce((sum, item) => sum + (item.total_value_brl || 0), 0) || 0;
          return { ...group, totalPatrimonioGrupo, snapshot_items: items as SnapshotItem[] || [] }; 
        })
      );
      setSnapshotGroupsData(groupsWithTotals);
    } catch (err) {
      console.error('Erro ao buscar dados de snapshots na ReportsPage:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setPageFetchError(errorMessage);
      toast.error("Erro ao carregar dados dos snapshots.");
    } finally {
      setPageIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSnapshotHistory();
  }, [fetchSnapshotHistory]);

  const handleOpenModal = () => {
    setSnapshotToEdit(null); // Limpa para garantir modo de criação
    setIsModalOpen(true);
  };

  const handleEditSnapshot = (snapshot: SnapshotGroupWithTotal) => {
    setSnapshotToEdit(snapshot);
    setIsModalOpen(true);
  };

  const handleDeleteSnapshot = async (snapshotToDelete: SnapshotGroupWithTotal) => {
    if (!snapshotToDelete || !user) return;

    try {
      // A lógica de exclusão que estava na tabela foi movida para cá
      const { error: itemsError } = await supabase
        .from('snapshot_items')
        .delete()
        .eq('snapshot_group_id', snapshotToDelete.id);

      if (itemsError) throw itemsError;

      const { error: groupError } = await supabase
        .from('snapshot_groups')
        .delete()
        .eq('id', snapshotToDelete.id)
        .eq('user_id', user.id);

      if (groupError) throw groupError;

      toast.success(`Snapshot de ${new Date(snapshotToDelete.created_at).toLocaleDateString('pt-BR')} excluído com sucesso.`);
      fetchSnapshotHistory(); // Atualiza a lista

    } catch (error: any) {
      console.error("Erro ao excluir snapshot:", error);
      toast.error(error.message || "Erro desconhecido ao excluir snapshot.");
    }
  };

  const handleDuplicateSnapshot = async (snapshotId: string) => {
    if (!snapshotId || !user) return;

    const snapshotToDuplicate = snapshotGroupsData.find(s => s.id === snapshotId);
    if (!snapshotToDuplicate) {
      toast.error("Snapshot para duplicação não encontrado.");
      return;
    }

    try {
      const { data: newGroup, error: groupError } = await supabase
        .from('snapshot_groups')
        .insert({
          user_id: user.id,
          notes: `Cópia de: ${snapshotToDuplicate.notes || new Date(snapshotToDuplicate.created_at).toLocaleDateString('pt-BR')}`,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const newItems = snapshotToDuplicate.snapshot_items.map(item => ({
        snapshot_group_id: newGroup.id,
        asset_id: item.asset_id,
        asset_name: item.asset_name,
        asset_category_name: item.asset_category_name,
        total_value_brl: item.total_value_brl,
        is_crypto_total: item.is_crypto_total,
      }));

      if (newItems.length > 0) {
        const { error: itemsError } = await supabase.from('snapshot_items').insert(newItems);
        if (itemsError) {
          await supabase.from('snapshot_groups').delete().eq('id', newGroup.id); // Rollback
          throw itemsError;
        }
      }

      toast.success("Snapshot duplicado com sucesso!");
      fetchSnapshotHistory();

    } catch (error: any) {
      console.error("Erro ao duplicar snapshot:", error);
      toast.error(error.message || "Erro desconhecido ao duplicar snapshot.");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatórios de Patrimônio</h1>
        <DateRangePicker date={date} onDateChange={setDate} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patrimônio Inicial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {initial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patrimônio Final</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {final.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pnl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {pnlPercent.toFixed(2).replace('.', ',')}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 mb-8">
        {/* Bloco 1: Histórico do Patrimônio Total */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico do Patrimônio Total</CardTitle>
            <CardDescription>Evolução do valor total da carteira no período selecionado.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <PatrimonioTotalChart 
              snapshotGroupsData={filteredData} 
              isLoading={pageIsLoading} 
            />
          </CardContent>
        </Card>

        {/* Bloco 2: Alocação por Classe (Último Snapshot) */}
        <Card>
          <CardHeader>
            <CardTitle>Alocação por Classe</CardTitle>
            <CardDescription>Distribuição da carteira no último snapshot do período selecionado.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {portfolioAllocationData.length > 0 ? (
              <>
                <div className="flex flex-col gap-4">
                  <AllocationChart data={portfolioAllocationData} colorMap={categoryColorMap} />
                </div>
                <div className="flex flex-col gap-4">
                  <AllocationBreakdownList 
                    data={portfolioAllocationData} 
                    totalValue={totalValueForAllocation} 
                    colorMap={categoryColorMap}
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2 text-center text-muted-foreground py-8">
                {pageIsLoading ? 'Carregando dados de alocação...' : 'Não há dados de alocação para o período selecionado.'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bloco 3: Composição do Patrimônio por Ativo */}
        <Card>
          <CardHeader>
            <CardTitle>Composição do Patrimônio por Ativo</CardTitle>
            <CardDescription>Distribuição do valor da carteira entre os ativos ao longo do tempo.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <AssetEvolutionStackedBarChart 
              snapshotGroupsData={filteredData} 
              isLoading={pageIsLoading} 
            />
          </CardContent>
        </Card>

        {/* Bloco 4: Composição do Patrimônio por Classe */}
        <Card>
          <CardHeader>
            <CardTitle>Composição do Patrimônio por Classe</CardTitle>
            <CardDescription>Distribuição do valor da carteira entre as classes de ativo ao longo do tempo.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <CategoryEvolutionStackedBarChart 
              snapshotGroupsData={filteredData} 
              isLoading={pageIsLoading} 
            />
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle>Evolução de Patrimônio</CardTitle>
            <CardDescription>
              Visualize o histórico de seus snapshots por data ou analise a evolução de cada ativo ao longo do tempo.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <CSVLink
              data={csvData}
              headers={csvHeaders}
              filename={`relatorio_patrimonio_${new Date().toISOString().split('T')[0]}.csv`}
              className="no-underline"
              target="_blank"
            >
              <Button variant="outline" className="whitespace-nowrap">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
            </CSVLink>
            <Button onClick={handleOpenModal} className="whitespace-nowrap">
              Registrar Saldos Atuais
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 sm:px-6"> {/* Remover padding horizontal padrão do CardContent se as Tabs o gerenciarem */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
              <TabsTrigger value="history">Histórico por Data</TabsTrigger>
              <TabsTrigger value="asset_evolution">Evolução por Ativo</TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-4">
                            <SnapshotHistoryTable 
                snapshotGroupsData={snapshotGroupsData} 
                isLoading={pageIsLoading}
                onDelete={handleDeleteSnapshot}
                onDuplicate={handleDuplicateSnapshot}
                onEdit={handleEditSnapshot}
                onRefresh={fetchSnapshotHistory}
              />
            </TabsContent>
            <TabsContent value="asset_evolution" className="mt-4">
              <AssetPivotTable snapshotGroupsData={filteredData} isLoading={pageIsLoading} fetchError={pageFetchError} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <RegisterSnapshotModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmitSuccess={fetchSnapshotHistory} 
        snapshotToEdit={snapshotToEdit}
      />
    </div>
  );
};

export default ReportsPage;
