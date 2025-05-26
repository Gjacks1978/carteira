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
