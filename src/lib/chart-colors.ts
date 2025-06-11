// src/lib/chart-colors.ts

export const CHART_COLORS = [
  "hsl(260, 70%, 60%)", // Roxo vibrante
  "hsl(217, 91%, 60%)", // Azul
  "hsl(142, 76%, 36%)", // Verde
  "hsl(37, 100%, 50%)", // Amarelo
  "hsl(0, 84%, 60%)",   // Vermelho
  "hsl(30, 95%, 55%)",  // Laranja
  "hsl(180, 70%, 45%)", // Ciano
  "hsl(330, 80%, 60%)"  // Rosa
];

/**
 * Cria um mapa de nomes de categoria para cores, garantindo cores consistentes.
 * @param categories - Um array de nomes de categoria (string[]).
 * @returns Um Map<string, string> onde a chave é o nome da categoria e o valor é uma cor hexadecimal.
 */
export const getCategoryColorMap = (categories: string[]): Map<string, string> => {
  const colorMap = new Map<string, string>();
  categories.forEach((category, index) => {
    colorMap.set(category, CHART_COLORS[index % CHART_COLORS.length]);
  });
  return colorMap;
};
