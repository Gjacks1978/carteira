import { supabase } from '@/integrations/supabase/client';
import { Asset, Crypto } from '@/types/assets';
import { SnapshotGroup, SnapshotItem } from '@/types/reports';

export interface AllData {
  assets: any[]; // Using any to accommodate joined data not strictly in Asset type
  cryptos: Crypto[];
  snapshots: SnapshotGroup[];
}

/**
 * Fetches all necessary data for a global export from the database.
 * @param userId The ID of the user for whom to fetch data.
 * @returns An object containing arrays of assets, cryptos, and snapshots.
 */
export const fetchAllDataForExport = async (userId: string): Promise<AllData> => {
  if (!userId) {
    throw new Error('User ID is required to fetch data for export.');
  }

  try {
    // Fetch all assets
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*, categories:asset_categories(name)')
      .eq('user_id', userId);
    if (assetsError) throw assetsError;

    // Fetch all cryptos
    const { data: cryptos, error: cryptosError } = await supabase
      .from('crypto_assets')
      .select('*, sector:crypto_sectors(name)')
      .eq('user_id', userId);
    if (cryptosError) throw cryptosError;

    // Fetch all snapshot groups
    const { data: snapshotGroups, error: groupsError } = await supabase
      .from('snapshot_groups')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (groupsError) throw groupsError;

    // For each group, fetch its items
    const snapshotsWithItems: SnapshotGroup[] = await Promise.all(
      (snapshotGroups || []).map(async (group) => {
        const { data: items, error: itemsError } = await supabase
          .from('snapshot_items')
          .select('*')
          .eq('snapshot_group_id', group.id);

        if (itemsError) {
          console.error(`Error fetching items for snapshot group ${group.id}:`, itemsError);
          // Explicitly cast to satisfy the SnapshotGroup type, even with empty items
          return { ...group, snapshot_items: [] as SnapshotItem[] } as SnapshotGroup;
        }
        // Ensure the returned object matches the SnapshotGroup interface
        return { ...group, snapshot_items: (items as SnapshotItem[]) || [] } as SnapshotGroup;
      })
    );

    return {
      assets: (assets as Asset[]) || [],
      cryptos: (cryptos as Crypto[]) || [],
      snapshots: snapshotsWithItems,
    };
  } catch (error) {
    console.error('Error fetching all data for export:', error);
    throw new Error('Failed to fetch all data for export. Please check the console for details.');
  }
};
