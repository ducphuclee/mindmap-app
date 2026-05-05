import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

function triggerDownload(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportPNG(element: HTMLElement, filename: string): Promise<string> {
  const dataUrl = await toPng(element, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  });
  triggerDownload(dataUrl, filename);
  return dataUrl;
}

export async function exportPDF(element: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  });
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [element.scrollWidth, element.scrollHeight],
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight);
  pdf.save(filename);
}
