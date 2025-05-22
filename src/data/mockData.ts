
import { Asset, Crypto, InvestmentData } from "@/types/assets";

// Generate some sample performance data points for the past year
const generatePerformanceData = () => {
  const data = [];
  const today = new Date();
  let portfolioValue = 100000; // Starting value
  let benchmarkValue = 100000; // Starting value
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    
    // Random daily fluctuation between -2% to +2%
    const portfolioDailyChange = (Math.random() * 4 - 2) / 100;
    const benchmarkDailyChange = (Math.random() * 3 - 1) / 100;
    
    portfolioValue = portfolioValue * (1 + portfolioDailyChange);
    benchmarkValue = benchmarkValue * (1 + benchmarkDailyChange);
    
    data.push({
      date: dateString,
      portfolio: Math.round(portfolioValue),
      benchmark: Math.round(benchmarkValue),
    });
  }
  
  return data;
};

// Main investment data
export const investmentData: InvestmentData = {
  totalInvested: 250000,
  totalReturn: 32500,
  returnPercentage: 13,
  portfolioAllocation: [
    { name: "Renda Fixa", value: 115000 },
    { name: "Renda Variável BR", value: 68000 },
    { name: "Renda Variável EUA", value: 42000 },
    { name: "Criptomoedas", value: 15000 },
    { name: "Caixa", value: 10000 },
  ],
  performanceData: generatePerformanceData(),
};

// Asset data by category
export const assetData: Record<string, Asset[]> = {
  "renda-fixa": [
    {
      id: "1",
      name: "Tesouro IPCA+ 2026",
      ticker: "IPCA+2026",
      type: "Tesouro Direto",
      price: 3254.78,
      quantity: 10,
      total: 32547.80,
      return: 1254.32,
      returnPercentage: 4.25,
    },
    {
      id: "2",
      name: "CDB Banco XYZ 120% CDI",
      ticker: "CDB-XYZ",
      type: "CDB",
      price: 1000.00,
      quantity: 45,
      total: 45000.00,
      return: 3245.67,
      returnPercentage: 7.82,
    },
    {
      id: "3",
      name: "LCI Banco ABC",
      ticker: "LCI-ABC",
      type: "LCI",
      price: 5000.00,
      quantity: 5,
      total: 25000.00,
      return: 1780.45,
      returnPercentage: 7.65,
    },
    {
      id: "4",
      name: "Debênture ABEV",
      ticker: "ABEV-DEB1",
      type: "Debênture",
      price: 1070.50,
      quantity: 10,
      total: 10705.00,
      return: 705.00,
      returnPercentage: 6.85,
    },
  ],
  "renda-var-br": [
    {
      id: "5",
      name: "Petrobras",
      ticker: "PETR4",
      type: "Ação",
      price: 34.25,
      quantity: 500,
      total: 17125.00,
      return: 3425.00,
      returnPercentage: 25.00,
    },
    {
      id: "6",
      name: "Vale",
      ticker: "VALE3",
      type: "Ação",
      price: 68.79,
      quantity: 300,
      total: 20637.00,
      return: -1237.00,
      returnPercentage: -5.65,
    },
    {
      id: "7",
      name: "Itaú Unibanco",
      ticker: "ITUB4",
      type: "Ação",
      price: 32.54,
      quantity: 400,
      total: 13016.00,
      return: 2016.00,
      returnPercentage: 18.32,
    },
    {
      id: "8",
      name: "Magazine Luiza",
      ticker: "MGLU3",
      type: "Ação",
      price: 2.85,
      quantity: 3000,
      total: 8550.00,
      return: 2550.00,
      returnPercentage: 28.50,
    },
    {
      id: "9",
      name: "ETF BOVA11",
      ticker: "BOVA11",
      type: "ETF",
      price: 105.45,
      quantity: 85,
      total: 8963.25,
      return: 963.25,
      returnPercentage: 12.04,
    },
  ],
  "renda-var-eua": [
    {
      id: "10",
      name: "Apple Inc.",
      ticker: "AAPL",
      type: "Ação",
      price: 175.25,
      quantity: 50,
      total: 8762.50,
      return: 2762.50,
      returnPercentage: 46.04,
    },
    {
      id: "11",
      name: "Microsoft",
      ticker: "MSFT",
      type: "Ação",
      price: 340.67,
      quantity: 30,
      total: 10220.10,
      return: 4220.10,
      returnPercentage: 70.33,
    },
    {
      id: "12",
      name: "Amazon",
      ticker: "AMZN",
      type: "Ação",
      price: 140.90,
      quantity: 45,
      total: 6340.50,
      return: 1340.50,
      returnPercentage: 26.81,
    },
    {
      id: "13",
      name: "ETF S&P 500",
      ticker: "VOO",
      type: "ETF",
      price: 438.72,
      quantity: 25,
      total: 10968.00,
      return: 3968.00,
      returnPercentage: 56.69,
    },
    {
      id: "14",
      name: "ETF NASDAQ",
      ticker: "QQQ",
      type: "ETF",
      price: 390.15,
      quantity: 15,
      total: 5852.25,
      return: 2252.25,
      returnPercentage: 62.56,
    },
  ],
  "caixa": [
    {
      id: "15",
      name: "Conta Corrente",
      ticker: "CC-BANCO",
      type: "Conta Corrente",
      price: 1.00,
      quantity: 5000,
      total: 5000.00,
      return: 0,
      returnPercentage: 0,
    },
    {
      id: "16",
      name: "Poupança",
      ticker: "POUP-BANCO",
      type: "Poupança",
      price: 1.00,
      quantity: 5000,
      total: 5000.00,
      return: 245.67,
      returnPercentage: 4.91,
    },
  ],
};

// Crypto data
export const cryptoData: Crypto[] = [
  {
    id: "c1",
    ticker: "BTC",
    name: "Bitcoin",
    sector: "Store of Value",
    priceUSD: 48500.25,
    quantity: 0.15,
    totalUSD: 7275.04,
    totalBRL: 36739.95,
    custody: "Binance",
    portfolioPercentage: 48.50,
    changePercentage: 5.23,
  },
  {
    id: "c2",
    ticker: "ETH",
    name: "Ethereum",
    sector: "Smart Contracts",
    priceUSD: 3245.78,
    quantity: 1.25,
    totalUSD: 4057.23,
    totalBRL: 20489.01,
    custody: "Binance",
    portfolioPercentage: 27.05,
    changePercentage: -2.45,
  },
  {
    id: "c3",
    ticker: "SOL",
    name: "Solana",
    sector: "Layer 1",
    priceUSD: 125.45,
    quantity: 12,
    totalUSD: 1505.40,
    totalBRL: 7602.27,
    custody: "FTX",
    portfolioPercentage: 10.04,
    changePercentage: 12.34,
  },
  {
    id: "c4",
    ticker: "ADA",
    name: "Cardano",
    sector: "Layer 1",
    priceUSD: 0.45,
    quantity: 5000,
    totalUSD: 2250.00,
    totalBRL: 11362.50,
    custody: "Carteira Local",
    portfolioPercentage: 15.00,
    changePercentage: -5.67,
  },
];
