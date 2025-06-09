// src/types/reports.ts

// This represents the detailed structure of a single item within a snapshot,
// as used by the frontend, particularly for the pivot table.
export interface SnapshotItem {
  id: string; // This is the id of the snapshot_item record itself
  asset_id: string | null; // The id of the original asset, null for 'Total Cripto'
  asset_name: string;
  asset_category_name: string | null; // Category name, can be null
  total_value_brl: number;
  is_crypto_total: boolean;
}

// Represents a snapshot group event.
// This should ideally align with or extend Supabase's generated type for 'snapshot_groups'.
// For frontend purposes, it's augmented with its snapshot_items.
export interface SnapshotGroup {
  id: string; // id of the snapshot_group
  created_at: string; // or Date
  notes?: string | null;
  user_id: string; 
  snapshot_items: SnapshotItem[]; 
}

// Extends SnapshotGroup to include the calculated total portfolio value for that group.
export interface SnapshotGroupWithTotal extends SnapshotGroup {
  totalPatrimonioGrupo: number;
}
