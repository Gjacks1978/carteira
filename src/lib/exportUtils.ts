import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

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
