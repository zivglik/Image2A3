import { jsPDF } from 'jspdf';

/**
 * Converts a canvas to PDF and saves it
 */
export const saveCanvasAsPDF = (canvas: HTMLCanvasElement, index: number) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = (pdfHeight - imgHeight * ratio) / 2;

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  pdf.save(`print-layout-${index + 1}.pdf`);
};

/**
 * Converts multiple canvases to a single PDF and saves it
 */
export const saveAllCanvasesAsPDF = (canvases: HTMLCanvasElement[]) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  canvases.forEach((canvas, index) => {
    if (index > 0) {
      pdf.addPage();
    }

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = (pdfHeight - imgHeight * ratio) / 2;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  });

  pdf.save('print-layout-all.pdf');
}; 