import React, { useState, useEffect, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import RegisterSnapshotModal from '@/components/reports/RegisterSnapshotModal';
import SnapshotHistoryTable from '@/components/reports/SnapshotHistoryTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetPivotTable from '@/components/reports/AssetPivotTable';
import PatrimonioTotalChart from '@/components/reports/PatrimonioTotalChart';
import AssetEvolutionStackedBarChart from '@/components/reports/AssetEvolutionStackedBarChart';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { SnapshotGroupWithTotal, SnapshotItem } from '@/types/reports'; // Import type
import { toast } from 'sonner';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { CSVLink } from 'react-csv';
import { FileDown } from 'lucide-react'; // Import type

const ReportsPage: React.FC = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90),
    to: new Date(),
  });
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [snapshotGroupsData, setSnapshotGroupsData] = useState<SnapshotGroupWithTotal[]>([]);
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [pageFetchError, setPageFetchError] = useState<string | null>(null); // <-- ADICIONAR ESTADO DE REFRESH

  const handleRegisterSnapshot = () => {
    setIsModalOpen(true);
  };

  const handleSnapshotSuccess = () => {
    setIsModalOpen(false);
    setRefreshKey(prevKey => prevKey + 1); // Incrementa a chave para forçar o refresh dos dados na ReportsPage
    // A mensagem de sucesso para registro é boa.
    // Para exclusão, a mensagem já é dada em SnapshotHistoryTable, mas o refresh é centralizado aqui.
  };

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
    const fetchSnapshotDataForPage = async () => {
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
    };

    fetchSnapshotDataForPage();
  }, [user, refreshKey]);

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

        <div className="grid grid-cols-1 gap-6 mb-8">
          <PatrimonioTotalChart snapshotGroupsData={filteredData} isLoading={pageIsLoading} />
          <AssetEvolutionStackedBarChart snapshotGroupsData={filteredData} isLoading={pageIsLoading} />
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
              <Button onClick={handleRegisterSnapshot} className="whitespace-nowrap">
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
                  fetchError={pageFetchError} 
                  onSnapshotDeleted={handleSnapshotSuccess} 
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
          onSubmitSuccess={handleSnapshotSuccess}
        />
    </div>
  );
};

export default ReportsPage;
