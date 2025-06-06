// src/types/reports.ts

export interface SnapshotItem {
  id: string;
  asset_name: string;
  asset_category_name: string;
  total_value_brl: number;
  is_crypto_total: boolean;
}

export interface SnapshotGroup {
  id: string;
  created_at: string;
  notes?: string | null;
  snapshot_items: SnapshotItem[]; // Referencia SnapshotItem definida acima
  user_id: string;
}

export interface SnapshotGroupWithTotal extends SnapshotGroup { // Estende SnapshotGroup
  totalPatrimonioGrupo: number;
}
