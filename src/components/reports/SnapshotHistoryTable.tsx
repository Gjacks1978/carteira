// d:\WINDSURF\carteira\src\components\reports\SnapshotHistoryTable.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface SnapshotItem {
  id: string;
  asset_name: string;
  asset_category_name: string;
  total_value_brl: number;
  is_crypto_total: boolean;
}

interface SnapshotGroup {
  id: string;
  created_at: string;
  notes?: string | null;
  snapshot_items: SnapshotItem[];
  user_id: string;
}

interface SnapshotHistoryTableProps {
  refreshKey: number;
}

const SnapshotHistoryTable: React.FC<SnapshotHistoryTableProps> = ({ refreshKey }) => {
  const { user } = useAuth();
  const [snapshotGroups, setSnapshotGroups] = useState<SnapshotGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSnapshotHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('snapshot_groups')
          .select(`
            id,
            created_at,
            notes,
            user_id,
            snapshot_items (
              id,
              asset_name,
              asset_category_name,
              total_value_brl,
              is_crypto_total
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        const processedData = data?.map(group => ({
          ...group,
          snapshot_items: group.snapshot_items || [],
        })) || [];

        setSnapshotGroups(processedData as SnapshotGroup[]);

      } catch (e: any) {
        console.error('Erro ao buscar histórico de snapshots:', e);
        setError('Falha ao carregar o histórico de snapshots.');
        toast.error('Falha ao carregar o histórico de snapshots.');
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshotHistory();
  }, [user, refreshKey]);

  if (loading) {
    return <div className="text-center p-4">Carregando histórico...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (snapshotGroups.length === 0) {
    return <div className="text-center p-4">Nenhum snapshot registrado ainda.</div>;
  }

  return (
    <div className="space-y-6">
      {snapshotGroups.map((group) => (
        <div key={group.id} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Snapshot de: {new Date(group.created_at).toLocaleString('pt-BR')}
            </h3>
            {group.notes && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>Notas:</strong> {group.notes}
              </p>
            )}
          </div>
          {group.snapshot_items && group.snapshot_items.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total (R$)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {group.snapshot_items.map((item) => (
                  <tr key={item.id} className={item.is_crypto_total ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.asset_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.asset_category_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.total_value_brl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">Nenhum item neste snapshot.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default SnapshotHistoryTable;
