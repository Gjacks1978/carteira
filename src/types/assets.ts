export interface Asset {
  id: string;
  name: string;
  ticker: string;
  type: string;
  price: number;
  quantity: number;
  current_total_value_brl: number;
  return: number;
  returnPercentage: number;
  categoryId?: string;
}

export interface Crypto {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  priceUSD: number;
  quantity: number;
  totalUSD: number;
  totalBRL: number;
  custody: string;
  portfolioPercentage: number;
  changePercentage: number;
}

export interface AssetTabMetrics {
  total: number;
  assetCount: number;
  averageReturn: number;
  percentOfPortfolio: number;
  largestPosition: Asset | null;
  largestPositionPercentage: number;
}

export interface SectorAllocationItem {
  sectorName: string;
  totalUSD: number;
  percentage: number; // of total crypto portfolio
}

export interface CryptoMetrics {
  totalUSD: number;
  totalBRL: number;
  cryptoCount: number;
  portfolioPercentage: number;
  topCustody: string | null;
  stablecoinsTotal?: number;
  sectorAllocation?: SectorAllocationItem[];
}

export interface PortfolioAllocation {
  name: string;
  value: number;
}

export interface PerformancePoint {
  date: string;
  portfolio: number;
  benchmark: number;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
  is_default: boolean;
}

export interface InvestmentData {
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  portfolioAllocation: PortfolioAllocation[];
  performanceData: PerformancePoint[];
}
