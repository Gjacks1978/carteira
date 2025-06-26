import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// --- Cotação Dólar ---
const USD_BRL_API_URL = "https://economia.awesomeapi.com.br/last/USD-BRL"; // URL corrigida
export const FALLBACK_USD_TO_BRL_RATE = 5.05;

interface AwesomeApiResponse {
  USDBRL: {
    bid: string;
    timestamp?: string;
    create_date?: string;
  };
}

export interface ExchangeRateData {
  rate: number;
  isReal: boolean;
  timestamp?: string; // Human-readable timestamp
}

export const fetchUSDtoBRLRate = async (): Promise<ExchangeRateData> => {
  try {
    const response = await fetch(USD_BRL_API_URL);
    if (!response.ok) {
      console.error("fetchUSDtoBRLRate (utils): Failed to fetch, using fallback. Status:", response.status);
      return { rate: FALLBACK_USD_TO_BRL_RATE, isReal: false };
    }
    const data: AwesomeApiResponse = await response.json();
    
    if (!data.USDBRL || !data.USDBRL.bid) {
      console.error("fetchUSDtoBRLRate (utils): Invalid API response structure, using fallback.");
      return { rate: FALLBACK_USD_TO_BRL_RATE, isReal: false };
    }

    const rate = parseFloat(data.USDBRL.bid);
    if (isNaN(rate)) {
      console.error("fetchUSDtoBRLRate (utils): Failed to parse rate, using fallback. Value:", data.USDBRL.bid);
      return { rate: FALLBACK_USD_TO_BRL_RATE, isReal: false };
    }

    let readableTimestamp: string | undefined = undefined;
    if (data.USDBRL.timestamp) {
      readableTimestamp = new Date(parseInt(data.USDBRL.timestamp) * 1000).toLocaleString("pt-BR", {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } else if (data.USDBRL.create_date) {
      readableTimestamp = data.USDBRL.create_date;
    }
    
    console.log("fetchUSDtoBRLRate (utils): Fetched USD to BRL rate:", rate, "Timestamp:", readableTimestamp);
    return { rate, isReal: true, timestamp: readableTimestamp };
  } catch (error) {
    console.error("fetchUSDtoBRLRate (utils): Error fetching/parsing:", error);
    return { rate: FALLBACK_USD_TO_BRL_RATE, isReal: false };
  }
};
// --- Fim Cotação Dólar ---

// --- Taxa SELIC ---
export const FALLBACK_SELIC_RATE = 10.50;

export interface SelicRateData {
  rate: number;
  isReal: boolean;
  date?: string; // Data da cotação
}

/**
 * Busca a taxa SELIC mais recente da API de Dados Abertos do Banco Central do Brasil.
 * @returns Um objeto contendo a taxa e a data de referência.
 */
export const fetchSelicRate = async (): Promise<SelicRateData> => {
  // Endpoint para obter o último valor da série da SELIC diária (código 11)
  const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("fetchSelicRate (utils): Failed to fetch from BCB API. Status:", response.status);
      return { rate: FALLBACK_SELIC_RATE, isReal: false };
    }

    const data = await response.json();

    // A API retorna um array com um único objeto
    if (data && data.length > 0 && data[0].valor) {
      const rate = parseFloat(data[0].valor);
      if (!isNaN(rate)) {
        console.log(`fetchSelicRate (utils): Fetched SELIC rate: ${rate}% on ${data[0].data}`);
        return { rate, isReal: true, date: data[0].data };
      }
    }

    console.error("fetchSelicRate (utils): Invalid API response structure.");
    return { rate: FALLBACK_SELIC_RATE, isReal: false };

  } catch (error) {
    console.error("fetchSelicRate (utils): Error fetching/parsing:", error);
    return { rate: FALLBACK_SELIC_RATE, isReal: false };
  }
};
// --- Fim Taxa SELIC ---
