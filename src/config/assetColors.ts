export const ASSET_CATEGORY_COLORS: { [key: string]: string } = {
  'Renda Fixa': '#0088FE',
  'Ações': '#00C49F',
  'Fundos Imobiliários': '#FFBB28',
  'Fundos de Investimento': '#FF8042',
  'BDRs': '#8884D8',
  'ETFs': '#82CA9D',
  'Criptomoedas': '#FF7300',
  'Outros': '#A4DE6C',
};

export const FALLBACK_COLOR = '#D0ED57';

export const getCategoryColor = (category: string) => {
  return ASSET_CATEGORY_COLORS[category] || FALLBACK_COLOR;
};
