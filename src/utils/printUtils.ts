/**
 * Handles printing a canvas to a new window
 */
export const printCanvas = (canvas: HTMLCanvasElement) => {
  const printWindow = window.open('');
  if (!printWindow) return;

  const img = new Image();
  img.src = canvas.toDataURL('image/png');
  
  printWindow.document.write(`
    <html>
      <head>
        <style>
          @page {
            size: A3;
            margin: 0;
          }
          body {
            margin: 0;
          }
          img {
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <img src="${img.src}" />
      </body>
    </html>
  `);
  
  printWindow.document.close();
  img.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

/**
 * Saves a canvas as PNG with timestamp
 */
export const saveCanvasAsPNG = (canvas: HTMLCanvasElement, index: number) => {
  const now = new Date();
  const dateStr = now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
  
  const link = document.createElement('a');
  link.download = `print-layout-${index + 1}_${dateStr}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Saves all canvases as PNG with the same timestamp
 */
export const saveAllCanvasesAsPNG = (canvases: (HTMLCanvasElement | null)[]) => {
  const now = new Date();
  const dateStr = now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);

  // Save each canvas with a slight delay to prevent browser blocking
  canvases.forEach((canvas, index) => {
    if (!canvas) return;
    
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `print-layout-${index + 1}_${dateStr}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, index * 100); // 100ms delay between each save
  });
}; 