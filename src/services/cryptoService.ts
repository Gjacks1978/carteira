import { Crypto } from "../types/assets";

interface CoinGeckoPriceResponse {
  [id: string]: {
    brl: number;
    usd: number;
    price_change_percentage_24h: number;
  };
}

/**
 * Busca os preços atuais das criptomoedas na CoinGecko.
 * @param cryptoIds Lista de IDs das criptomoedas (ex: ["bitcoin", "ethereum"])
 * @returns Um mapa onde a chave é o ID da criptomoeda e o valor é um objeto com os preços em BRL e USD.
 */
export const fetchCryptoPrices = async (cryptoIds: string[]): Promise<Map<string, { priceBRL: number, priceUSD: number, change24h: number }>> => {
  if (cryptoIds.length === 0) {
    return new Map();
  }

  try {
    const ids = cryptoIds.join(',');
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl,usd&include_24hr_change=true`);
    
    if (!response.ok) {
      console.error(`Error fetching crypto prices: ${response.statusText}`);
      return new Map();
    }

    const data: CoinGeckoPriceResponse = await response.json();
    const pricesMap = new Map();

    for (const id in data) {
      if (data[id]?.brl && data[id]?.usd) {
        pricesMap.set(id, {
          priceBRL: data[id].brl,
          priceUSD: data[id].usd,
          change24h: data[id].price_change_percentage_24h || 0,
        });
      }
    }

    return pricesMap;
  } catch (error) {
    console.error('Failed to fetch crypto prices:', error);
    return new Map();
  }
};

/**
 * Atualiza os preços das criptomoedas na lista fornecida.
 * @param cryptoList Lista de criptomoedas a ser atualizada
 * @returns A mesma lista com os preços atualizados
 */
export const updateCryptoPrices = async (cryptoList: Crypto[]): Promise<Crypto[]> => {
  // Extrair os IDs das criptomoedas que precisam ser atualizadas
  const cryptoIds = cryptoList.map(crypto => crypto.ticker.toLowerCase());
  
  // Buscar os preços atualizados
  const prices = await fetchCryptoPrices(cryptoIds);
  
  // Atualizar cada criptomoeda com o novo preço
  return cryptoList.map(crypto => {
    const priceData = prices.get(crypto.ticker.toLowerCase());
    if (priceData) {
      return {
        ...crypto,
        priceUSD: priceData.priceUSD,
        totalUSD: priceData.priceUSD * crypto.quantity,
        totalBRL: priceData.priceBRL * crypto.quantity,
        changePercentage: priceData.change24h,
      };
    }
    return crypto; // Se não encontrou preço, mantém os valores anteriores
  });
};
