import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography,
  Grid,
} from '@mui/material';
import { ImageData } from './types/image';
import { A3_WIDTH, A3_HEIGHT, CELL_WIDTH, CELL_HEIGHT, GRID_COLS, GRID_ROWS } from './constants/dimensions';
import { processImage, calculateImageDimensions, drawRotatedImage } from './utils/imageProcessing';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const previewCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

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
    images: ImageData[],
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
    const imagesPerCanvas = GRID_COLS * GRID_ROWS;
    const numberOfCanvases = Math.ceil(images.length / imagesPerCanvas);

    // Initialize refs arrays if needed
    if (canvasRefs.current.length !== numberOfCanvases) {
      canvasRefs.current = new Array(numberOfCanvases).fill(null);
      previewCanvasRefs.current = new Array(numberOfCanvases).fill(null);
    }

    for (let i = 0; i < numberOfCanvases; i++) {
      const startIndex = i * imagesPerCanvas;
      const endIndex = Math.min(startIndex + imagesPerCanvas, images.length);
      const canvasImages = images.slice(startIndex, endIndex);

      // Draw on print canvas
      const printCanvas = canvasRefs.current[i];
      const printCtx = printCanvas?.getContext('2d');
      if (printCanvas && printCtx) {
        printCanvas.width = A3_WIDTH;
        printCanvas.height = A3_HEIGHT;
        drawOnCanvas(printCanvas, printCtx, canvasImages, 1);
      }

      // Draw on preview canvas
      const previewCanvas = previewCanvasRefs.current[i];
      const previewCtx = previewCanvas?.getContext('2d');
      if (previewCanvas && previewCtx) {
        const scale = Math.min(
          previewCanvas.width / A3_WIDTH,
          previewCanvas.height / A3_HEIGHT
        );
        
        const scaledWidth = A3_WIDTH * scale;
        const scaledHeight = A3_HEIGHT * scale;
        
        previewCanvas.width = scaledWidth;
        previewCanvas.height = scaledHeight;
        
        drawOnCanvas(previewCanvas, previewCtx, canvasImages, scale);
      }
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [images]);

  const handlePrint = (canvasIndex: number) => {
    const canvas = canvasRefs.current[canvasIndex];
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

  const handleSaveAsPNG = (canvasIndex: number) => {
    const canvas = canvasRefs.current[canvasIndex];
    if (!canvas) return;
    
    const now = new Date();
    const dateStr = now.toISOString()
      .replace(/[:.]/g, '-')  // Replace colons and dots with dashes
      .replace('T', '_')      // Replace T with underscore
      .slice(0, 19);          // Take only date and time, remove milliseconds
    
    const link = document.createElement('a');
    link.download = `print-layout-${canvasIndex + 1}_${dateStr}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCanvas = (index: number) => {
    return (
      <Box key={index} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          עמוד {index + 1}
        </Typography>
        <Box sx={{ mb: 2, border: '1px solid #ccc' }}>
          <canvas
            ref={(el) => {
              previewCanvasRefs.current[index] = el;
            }}
            width={800}
            height={565}
            style={{
              width: '100%',
              height: 'auto'
            }}
          />
        </Box>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="contained" 
            onClick={() => handlePrint(index)}
          >
            הדפס
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => handleSaveAsPNG(index)}
          >
            שמור כ-PNG
          </Button>
        </Box>
        <canvas
          ref={(el) => {
            canvasRefs.current[index] = el;
          }}
          width={A3_WIDTH}
          height={A3_HEIGHT}
          style={{ display: 'none' }}
        />
      </Box>
    );
  };

  const numberOfCanvases = Math.ceil(images.length / (GRID_COLS * GRID_ROWS));

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

        {Array.from({ length: numberOfCanvases }, (_, i) => renderCanvas(i))}
      </Box>
    </Container>
  );
}

export default App; 