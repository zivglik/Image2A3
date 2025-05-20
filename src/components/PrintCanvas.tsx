import React, { forwardRef, useImperativeHandle } from 'react';
import { Box, Button, Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import { ImageData } from '../types/image';
import { PAGE_SIZES, calculateCellDimensions } from '../constants/dimensions';
import { calculateImageDimensions, drawRotatedImage } from '../utils/imageProcessing';
import { saveCanvasAsPDF } from '../utils/pdfUtils';

export interface PrintCanvasRef {
  getPrintCanvas: () => HTMLCanvasElement | null;
}

interface PrintCanvasProps {
  index: number;
  images: ImageData[];
  onPrint: (index: number) => void;
  onSaveAsPNG: (index: number) => void;
  pageSize: keyof typeof PAGE_SIZES;
  rows: number;
  cols: number;
  stretchImages: boolean;
}

const PrintCanvas = forwardRef<PrintCanvasRef, PrintCanvasProps>(({ 
  index, 
  images, 
  onPrint, 
  onSaveAsPNG,
  pageSize,
  rows,
  cols,
  stretchImages
}, ref) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useImperativeHandle(ref, () => ({
    getPrintCanvas: () => canvasRef.current
  }));

  const drawOnCanvas = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    images: ImageData[],
    scale: number = 1
  ) => {
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { cellWidth, cellHeight } = calculateCellDimensions(pageSize, rows, cols);
    const scaledCellWidth = cellWidth * scale;
    const scaledCellHeight = cellHeight * scale;

    images.forEach((image, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = col * scaledCellWidth;
      const y = row * scaledCellHeight;

      const { width: originalWidth, height: originalHeight, shouldRotate } = calculateImageDimensions(
        image.width,
        image.height,
        cellWidth,
        cellHeight,
        stretchImages
      );
      
      // Scale the dimensions
      const width = originalWidth * scale;
      const height = originalHeight * scale;
      
      const centerX = x + (scaledCellWidth - width) / 2;
      const centerY = y + (scaledCellHeight - height) / 2;

      if (shouldRotate) {
        drawRotatedImage(ctx, image.element, centerX, centerY, width, height);
      } else {
        ctx.drawImage(image.element, centerX, centerY, width, height);
      }
    });
  };

  React.useEffect(() => {
    const { width, height } = PAGE_SIZES[pageSize];
    
    // Draw on print canvas
    const printCanvas = canvasRef.current;
    const printCtx = printCanvas?.getContext('2d');
    if (printCanvas && printCtx) {
      printCanvas.width = width;
      printCanvas.height = height;
      drawOnCanvas(printCanvas, printCtx, images, 1);
    }

    // Draw on preview canvas
    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas?.getContext('2d');
    if (previewCanvas && previewCtx) {
      const scale = Math.min(
        previewCanvas.width / width,
        previewCanvas.height / height
      );
      
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      
      previewCanvas.width = scaledWidth;
      previewCanvas.height = scaledHeight;
      
      drawOnCanvas(previewCanvas, previewCtx, images, scale);
    }
  }, [images, pageSize, rows, cols, stretchImages]);

  const handleSaveAsPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveCanvasAsPDF(canvas, index);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Page {index + 1}
      </Typography>
      <Box sx={{ mb: 2, border: '1px solid #ccc' }}>
        <canvas
          ref={previewCanvasRef}
          width={800}
          height={565}
          style={{
            width: '100%',
            height: 'auto',
            backgroundColor: 'white'
          }}
        />
      </Box>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        sx={{ mb: 2, textAlign: 'left' }}
      >
        <Button 
          variant="contained" 
          onClick={() => onPrint(index)}
          fullWidth={isMobile}
        >
          Print
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => onSaveAsPNG(index)}
          fullWidth={isMobile}
        >
          Save as PNG
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleSaveAsPDF}
          fullWidth={isMobile}
        >
          Save as PDF
        </Button>
      </Stack>
      <canvas
        ref={canvasRef}
        width={PAGE_SIZES[pageSize].width}
        height={PAGE_SIZES[pageSize].height}
        style={{ display: 'none' }}
      />
    </Box>
  );
});

export default PrintCanvas; 