import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { AllData } from '@/services/globalExportService';

// Helper to format currency
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Helper to format numbers
const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Extend the jsPDF interface to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Exports an array of objects to a CSV file.
 * @param data The array of data to export.
 * @param headers An object mapping object keys to CSV header names.
 * @param filename The name of the file to download.
 */
export const exportToCsv = (data: any[], headers: Record<string, string>, filename: string) => {
  if (!data || data.length === 0) {
    console.error("Export to CSV failed: No data provided.");
    return;
  }

  const headerKeys = Object.keys(headers);
  const headerValues = Object.values(headers);

  const csvRows = [
    headerValues.join(','),
    ...data.map(row =>
      headerKeys
        .map(key => {
          let cell = row[key] === null || row[key] === undefined ? '' : String(row[key]);
          cell = cell.replace(/"/g, '""'); // Escape double quotes
          if (cell.includes(',') || cell.includes('\"') || cell.includes('\n')) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(','))
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Exports a specific HTML element to a PDF file.
 * @param elementId The ID of the HTML element to capture.
 * @param filename The name of the file to download.
 * @param orientation The orientation of the PDF ('p' for portrait, 'l' for landscape).
 */
export const exportElementToPdf = async (elementId: string, filename: string, orientation: 'p' | 'l' = 'p') => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Export to PDF failed: Element with ID "${elementId}" not found.`);
    return;
  }

  // Use html2canvas to render the element
  const canvas = await html2canvas(input, {
    scale: 2, // Increase scale for better resolution
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');
  
  // Calculate dimensions
  const pdf = new jsPDF(orientation, 'px', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const ratio = canvasWidth / canvasHeight;
  
  let imgWidth = pdfWidth;
  let imgHeight = pdfWidth / ratio;

  // If image height is greater than pdf height, scale down
  if (imgHeight > pdfHeight) {
    imgHeight = pdfHeight;
    imgWidth = imgHeight * ratio;
  }

  const x = (pdfWidth - imgWidth) / 2;
  const y = 15; // Add some margin at the top

  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
  pdf.save(`${filename}.pdf`);
};

/**
 * Exports a table to a PDF file using jspdf-autotable.
 * @param head An array of arrays for the table headers.
 * @param body An array of arrays for the table body.
 * @param filename The name of the file to download.
 * @param title A title to display at the top of the PDF.
 */
export const exportTableToPdf = (head: string[][], body: any[][], filename: string, title?: string) => {
  const doc = new jsPDF();
  
  if (title) {
    doc.text(title, 14, 15);
  }

  doc.autoTable({
    head: head,
    body: body,
    startY: title ? 20 : 10,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] }, // Example color
  });

  doc.save(`${filename}.pdf`);
};

/**
 * Exports a consolidated report of all user data to a single PDF file.
 * @param allData - The consolidated data object.
 * @param filename - The name for the output PDF file.
 */
export const exportGlobalPdf = (allData: AllData, filename: string) => {
  const doc = new jsPDF();
  const { assets, cryptos, snapshots } = allData;

  // Title Page
  doc.text('Relatório Consolidado de Portfólio', 14, 20);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

  // Assets Table
  if (assets.length > 0) {
    doc.addPage();
    doc.text('Ativos Tradicionais', 14, 20);
    doc.autoTable({
      startY: 25,
      head: [['Ativo', 'Símbolo', 'Categoria', 'Qtd.', 'Preço Médio', 'Total', 'Meta %']],
      body: assets.map((a: any) => [
        a.name,
        a.ticker,
        a.categories?.name || 'N/A',
        formatNumber(a.quantity),
        formatCurrency(a.average_price),
        formatCurrency(a.current_total_value_brl),
        `${a.goal_percentage}%`
      ]),
      theme: 'grid',
      styles: { fontSize: 8 },
    });
  }

  // Cryptos Table
  if (cryptos.length > 0) {
    doc.addPage();
    doc.text('Criptoativos', 14, 20);
    doc.autoTable({
      startY: 25,
      head: [['Ativo', 'Símbolo', 'Setor', 'Qtd.', 'Preço Médio', 'Total']],
      body: cryptos.map((c: any) => [
        c.name,
        c.ticker,
        c.sector?.name || 'N/A',
        formatNumber(c.quantity),
        formatCurrency(c.average_price),
        formatCurrency(c.totalBRL) // Corrected to camelCase from type
      ]),
      theme: 'grid',
      styles: { fontSize: 8 },
    });
  }

  // Snapshots
  if (snapshots.length > 0) {
    doc.addPage();
    doc.text('Histórico de Snapshots', 14, 20);
    let lastY = 25;
    snapshots.forEach((s, index) => {
      const tableTitle = `Snapshot de ${new Date(s.created_at).toLocaleString('pt-BR')} (Total: ${formatCurrency(s.snapshot_items.reduce((sum, i) => sum + (i.total_value_brl || 0), 0))})`;
      if (index > 0) {
        lastY = (doc as any).lastAutoTable.finalY + 15;
      }
      doc.autoTable({
        head: [[tableTitle]],
        body: [],
        startY: lastY,
        theme: 'plain',
        headStyles: { fontStyle: 'bold', fontSize: 10 },
      });
      doc.autoTable({
        head: [['Ativo', 'Categoria', 'Valor (R$)']],
        body: s.snapshot_items.map(item => [
          item.asset_name,
          item.asset_category_name,
          formatCurrency(item.total_value_brl)
        ]),
        startY: (doc as any).lastAutoTable.finalY,
        theme: 'grid',
        styles: { fontSize: 8 },
      });
    });
  }

  doc.save(`${filename}.pdf`);
};

/**
 * Exports a consolidated report of all user data to a single CSV file.
 * @param allData - The consolidated data object.
 * @param filename - The name for the output CSV file.
 */
export const exportGlobalCsv = (allData: AllData, filename: string) => {
  const { assets, cryptos, snapshots } = allData;
  let csvContent = 'data:text/csv;charset=utf-8,';

  const escapeCsvCell = (cell: any) => {
    if (cell === null || cell === undefined) return '';
    let str = String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Assets
  if (assets.length > 0) {
    csvContent += 'Ativos Tradicionais\n';
    const headers = ['Ativo', 'Símbolo', 'Categoria', 'Quantidade', 'Preço Médio (R$)', 'Total (R$)', 'Meta (%)'];
    csvContent += headers.join(',') + '\n';
    assets.forEach((a: any) => {
      const row = [
        a.name, a.ticker, a.categories?.name || 'N/A', a.quantity, a.average_price, a.current_total_value_brl, a.goal_percentage
      ].map(escapeCsvCell).join(',');
      csvContent += row + '\n';
    });
    csvContent += '\n'; // Spacer
  }

  // Cryptos
  if (cryptos.length > 0) {
    csvContent += 'Criptoativos\n';
    const headers = ['Ativo', 'Símbolo', 'Setor', 'Quantidade', 'Preço Médio (R$)', 'Total (R$)'];
    csvContent += headers.join(',') + '\n';
    cryptos.forEach((c: any) => {
      const row = [
        c.name, c.ticker, c.sector?.name || 'N/A', c.quantity, c.average_price, c.totalBRL
      ].map(escapeCsvCell).join(',');
      csvContent += row + '\n';
    });
    csvContent += '\n'; // Spacer
  }

  // Snapshots
  if (snapshots.length > 0) {
    snapshots.forEach(s => {
      const total = s.snapshot_items.reduce((sum, i) => sum + (i.total_value_brl || 0), 0);
      csvContent += `Snapshot de ${new Date(s.created_at).toLocaleString('pt-BR')} (Total: ${formatCurrency(total)})\n`;
      const headers = ['Ativo', 'Categoria', 'Valor (R$)'];
      csvContent += headers.join(',') + '\n';
      s.snapshot_items.forEach(item => {
        const row = [
          item.asset_name, item.asset_category_name, item.total_value_brl
        ].map(escapeCsvCell).join(',');
        csvContent += row + '\n';
      });
      csvContent += '\n'; // Spacer
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
