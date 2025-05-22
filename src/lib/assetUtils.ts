
import { Asset, AssetTabMetrics, Crypto, CryptoMetrics } from "@/types/assets";
import { investmentData } from "@/data/mockData";

export const calculateTabMetrics = (assets: Asset[]): AssetTabMetrics => {
  const total = assets.reduce((acc, asset) => acc + asset.total, 0);
  const assetCount = assets.length;
  
  // Calculate averageReturn (weighted)
  let weightedReturn = 0;
  if (total > 0) {
    weightedReturn = assets.reduce((acc, asset) => {
      return acc + (asset.returnPercentage * (asset.total / total));
    }, 0);
  }
  
  // Find the largest position
  let largestPosition: Asset | null = null;
  let largestPositionValue = 0;
  
  assets.forEach((asset) => {
    if (asset.total > largestPositionValue) {
      largestPositionValue = asset.total;
      largestPosition = asset;
    }
  });
  
  // Calculate largest position percentage of this tab
  const largestPositionPercentage = total > 0 && largestPosition 
    ? (largestPositionValue / total) * 100
    : 0;
  
  // Calculate percentage of portfolio
  const percentOfPortfolio = (total / investmentData.totalInvested) * 100;
  
  return {
    total,
    assetCount,
    averageReturn: weightedReturn,
    percentOfPortfolio,
    largestPosition,
    largestPositionPercentage,
  };
};

export const calculateCryptoMetrics = (cryptos: Crypto[]): CryptoMetrics => {
  const totalUSD = cryptos.reduce((acc, crypto) => acc + crypto.totalUSD, 0);
  const totalBRL = cryptos.reduce((acc, crypto) => acc + crypto.totalBRL, 0);
  const cryptoCount = cryptos.length;
  
  // Calculate percentage of portfolio (using BRL value)
  const portfolioPercentage = (totalBRL / investmentData.totalInvested) * 100;
  
  // Find top custody
  const custodyMap: Record<string, number> = {};
  cryptos.forEach((crypto) => {
    const custody = crypto.custody || "Unknown";
    custodyMap[custody] = (custodyMap[custody] || 0) + 1;
  });
  
  let topCustody: string | null = null;
  let topCustodyCount = 0;
  
  Object.entries(custodyMap).forEach(([custody, count]) => {
    if (count > topCustodyCount) {
      topCustodyCount = count;
      topCustody = custody;
    }
  });
  
  // Calculate portfolio percentage for each crypto
  const updatedCryptos = cryptos.map((crypto) => {
    return {
      ...crypto,
      portfolioPercentage: totalUSD > 0 ? (crypto.totalUSD / totalUSD) * 100 : 0,
    };
  });
  
  return {
    totalUSD,
    totalBRL,
    cryptoCount,
    portfolioPercentage,
    topCustody,
  };
};
