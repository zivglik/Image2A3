import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography,
} from '@mui/material';
import { ImageData } from './types/image';
import { A3_WIDTH, A3_HEIGHT, CELL_WIDTH, CELL_HEIGHT, GRID_COLS, GRID_ROWS } from './constants/dimensions';
import { processImage, calculateImageDimensions, drawRotatedImage } from './utils/imageProcessing';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // בודק אם נבחרו יותר מ-8 תמונות
    if (files.length > 8) {
      alert('ניתן לבחור עד 8 תמונות בלבד. אנא בחר שוב.');
      // מנקה את הבחירה
      event.target.value = '';
      return;
    }

    // מאפס את מערך התמונות הקיים
    setImages([]);
    
    // מוסיף את התמונות החדשות
    const newImages: ImageData[] = [];
    Array.from(files).forEach(file => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        newImages.push(processImage(img));
        if (newImages.length === files.length) {
          setImages(newImages);
        }
      };
    });
  };

  const drawOnCanvas = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    scale: number = 1
  ) => {
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scaled dimensions
    const scaledCellWidth = CELL_WIDTH * scale;
    const scaledCellHeight = CELL_HEIGHT * scale;

    images.forEach((image, index) => {
      const col = index % GRID_COLS;
      const row = Math.floor(index / GRID_COLS);
      
      const x = col * scaledCellWidth;
      const y = row * scaledCellHeight;

      const { width: originalWidth, height: originalHeight, shouldRotate } = calculateImageDimensions(image.width, image.height);
      
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

  const drawCanvas = () => {
    // Draw on print canvas
    const printCanvas = canvasRef.current;
    const printCtx = printCanvas?.getContext('2d');
    if (printCanvas && printCtx) {
      printCanvas.width = A3_WIDTH;
      printCanvas.height = A3_HEIGHT;
      drawOnCanvas(printCanvas, printCtx, 1);
    }

    // Draw on preview canvas
    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas?.getContext('2d');
    if (previewCanvas && previewCtx) {
      // Calculate scale to fit preview canvas
      const scale = Math.min(
        previewCanvas.width / A3_WIDTH,
        previewCanvas.height / A3_HEIGHT
      );
      
      // Set dimensions maintaining aspect ratio
      const scaledWidth = A3_WIDTH * scale;
      const scaledHeight = A3_HEIGHT * scale;
      
      previewCanvas.width = scaledWidth;
      previewCanvas.height = scaledHeight;
      
      drawOnCanvas(previewCanvas, previewCtx, scale);
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [images]);

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

  const handleSaveAsPNG = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'print-layout.png';
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          תמונות להדפסה על A3
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <input
            accept="image/*"
            type="file"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button variant="contained" component="span">
              בחר תמונות
            </Button>
          </label>
        </Box>

        {/* Preview Canvas */}
        <Box sx={{ mb: 2, border: '1px solid #ccc' }}>
          {/* Canvas with A3 aspect ratio: 800 * (297/420) = 565 */}
          <canvas
            ref={previewCanvasRef}
            width={800}
            height={565}
            style={{
              width: '100%',
              height: 'auto'
            }}
          />
        </Box>

        {images.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="contained" 
              onClick={handlePrint}
            >
              הדפס
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleSaveAsPNG}
            >
              שמור כ-PNG
            </Button>
          </Box>
        )}
        
        {/* Hidden Print Canvas */}
        <canvas
          ref={canvasRef}
          width={A3_WIDTH}
          height={A3_HEIGHT}
          style={{ display: 'none' }}
        />
      </Box>
    </Container>
  );
}

export default App; 