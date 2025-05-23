
export interface Asset {
  id: string;
  name: string;
  ticker: string;
  type: string;
  price: number;
  quantity: number;
  total: number;
  return: number;
  returnPercentage: number;
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

export interface CryptoMetrics {
  totalUSD: number;
  totalBRL: number;
  cryptoCount: number;
  portfolioPercentage: number;
  topCustody: string | null;
  stablecoinsTotal?: number;
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

export interface InvestmentData {
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  portfolioAllocation: PortfolioAllocation[];
  performanceData: PerformancePoint[];
}
