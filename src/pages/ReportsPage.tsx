import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import RegisterSnapshotModal from '@/components/reports/RegisterSnapshotModal';
import SnapshotHistoryTable from '@/components/reports/SnapshotHistoryTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetPivotTable from '@/components/reports/AssetPivotTable';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { SnapshotGroupWithTotal } from '@/types/reports'; // Import type
import { toast } from 'sonner';

const ReportsPage: React.FC = () => {
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
              .select('id, total_value_brl, asset_name') // Select a few more fields for clarity
              .eq('snapshot_group_id', group.id);

            if (itemsError) {
              console.error(`[ReportsPage] Error fetching items for group ${group.id}:`, itemsError);
              return { ...group, totalPatrimonioGrupo: 0, itemsData: [] }; // Return 0 if items fetch fails
            }

            const totalPatrimonioGrupo = items?.reduce((sum, item) => sum + (item.total_value_brl || 0), 0) || 0;
            return { ...group, totalPatrimonioGrupo, itemsData: items || [] }; 
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
        <h1 className="text-3xl font-bold mb-6">Relatórios de Patrimônio</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Registrar Novos Saldos</CardTitle>
            <CardDescription>
              Clique no botão abaixo para registrar os saldos e preços atuais dos seus ativos.
              Isso criará um "snapshot" do seu portfólio na data de hoje, permitindo que você acompanhe a evolução do seu patrimônio.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button size="lg" onClick={handleRegisterSnapshot}>
              Registrar Saldos Atuais
            </Button>
          </CardFooter>
        </Card>

        <Separator className="my-8" />

        <Card>
          <CardHeader>
            <CardTitle>Análise de Snapshots</CardTitle>
            <CardDescription>
              Visualize o histórico de seus snapshots por data ou analise a evolução de cada ativo ao longo do tempo.
            </CardDescription>
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
                <AssetPivotTable snapshotGroupsData={snapshotGroupsData} isLoading={pageIsLoading} fetchError={pageFetchError} />
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
