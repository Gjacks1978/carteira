import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import RegisterSnapshotModal from '@/components/reports/RegisterSnapshotModal';
import SnapshotHistoryTable from '@/components/reports/SnapshotHistoryTable'; // <-- IMPORTAR

const ReportsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // <-- ADICIONAR ESTADO DE REFRESH

  const handleRegisterSnapshot = () => {
    setIsModalOpen(true);
  };

  const handleSnapshotSuccess = () => {
    console.log('Snapshot salvo, atualizar tabela de relatórios.');
    setRefreshKey(prevKey => prevKey + 1); // <-- INCREMENTAR REFRESH KEY
    setIsModalOpen(false); // Close modal on success
  };

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
            <CardTitle>Histórico de Snapshots</CardTitle>
            <CardDescription>
              Aqui será exibida a tabela com o histórico dos seus saldos, patrimônio e performance ao longo do tempo.
              (Implementação futura)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SnapshotHistoryTable refreshKey={refreshKey} onSnapshotDeleted={handleSnapshotSuccess} />
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
