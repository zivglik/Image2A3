import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography,
} from '@mui/material';
import { ImageData } from './types/image';
import { GRID_COLS, GRID_ROWS } from './constants/dimensions';
import { processImage } from './utils/imageProcessing';
import { printCanvas, saveCanvasAsPNG, saveAllCanvasesAsPNG } from './utils/printUtils';
import PrintCanvas, { PrintCanvasRef } from './components/PrintCanvas';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const canvasRefs = useRef<(PrintCanvasRef | null)[]>([]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Reset existing images array
    setImages([]);
    
    // Add new images
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

  const handlePrint = (index: number) => {
    const canvas = canvasRefs.current[index]?.getPrintCanvas();
    if (!canvas) return;
    printCanvas(canvas);
  };

  const handleSaveAsPNG = (index: number) => {
    const canvas = canvasRefs.current[index]?.getPrintCanvas();
    if (!canvas) return;
    saveCanvasAsPNG(canvas, index);
  };

  const handleSaveAllAsPNG = () => {
    const canvases = canvasRefs.current
      .map(ref => ref?.getPrintCanvas())
      .filter((canvas): canvas is HTMLCanvasElement => canvas !== null);
    
    saveAllCanvasesAsPNG(canvases);
  };

  const numberOfCanvases = Math.ceil(images.length / (GRID_COLS * GRID_ROWS));

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'left' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          A3 Print Layout
        </Typography>
        
        <Box sx={{ mb: 4, textAlign: 'left' }}>
          <input
            accept="image/*"
            type="file"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload" style={{ display: 'block', textAlign: 'left' }}>
            <Button variant="contained" component="span">
              Select Images
            </Button>
          </label>

          {images.length > 0 && (
            <Box sx={{ mt: 2, textAlign: 'left' }}>
              <Button 
                variant="contained" 
                color="secondary"
                onClick={handleSaveAllAsPNG}
              >
                Save All Pages as PNG
              </Button>
            </Box>
          )}
        </Box>

        {Array.from({ length: numberOfCanvases }, (_, i) => {
          const startIndex = i * (GRID_COLS * GRID_ROWS);
          const endIndex = Math.min(startIndex + (GRID_COLS * GRID_ROWS), images.length);
          const canvasImages = images.slice(startIndex, endIndex);

          return (
            <PrintCanvas
              key={i}
              ref={(el) => {
                canvasRefs.current[i] = el;
              }}
              index={i}
              images={canvasImages}
              onPrint={handlePrint}
              onSaveAsPNG={handleSaveAsPNG}
            />
          );
        })}
      </Box>
    </Container>
  );
}

export default App; 