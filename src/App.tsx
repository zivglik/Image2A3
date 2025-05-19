import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { ImageData } from './types/image';
import { GRID_COLS_OPTIONS, PAGE_SIZES, GRID_ROWS_OPTIONS } from './constants/dimensions';
import { processImage } from './utils/imageProcessing';
import { printCanvas, saveCanvasAsPNG, saveAllCanvasesAsPNG } from './utils/printUtils';
import PrintCanvas, { PrintCanvasRef } from './components/PrintCanvas';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES>('A3');
  const [rows, setRows] = useState<number>(2);
  const [cols, setCols] = useState<number>(4);
  const [stretchImages, setStretchImages] = useState<boolean>(false);
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

  const handlePageSizeChange = (event: SelectChangeEvent) => {
    setPageSize(event.target.value as keyof typeof PAGE_SIZES);
  };

  const handleRowsChange = (event: SelectChangeEvent) => {
    setRows(Number(event.target.value));
  };

  const handleColsChange = (event: SelectChangeEvent) => {
    setCols(Number(event.target.value));
  };

  const handleStretchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStretchImages(event.target.checked);
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

  const numberOfCanvases = Math.ceil(images.length / (cols * rows));

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'left' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Print Layout
        </Typography>
        
        <Box sx={{ mb: 4, textAlign: 'left', display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Page Size</InputLabel>
            <Select
              value={pageSize}
              label="Page Size"
              onChange={handlePageSizeChange}
            >
              {Object.entries(PAGE_SIZES).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Rows</InputLabel>
            <Select
              value={rows.toString()}
              label="Rows"
              onChange={handleRowsChange}
            >
              {GRID_ROWS_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Columns</InputLabel>
            <Select
              value={cols.toString()}
              label="Columns"
              onChange={handleColsChange}
            >
              {GRID_COLS_OPTIONS.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={stretchImages}
                onChange={handleStretchChange}
              />
            }
            label="מתיחת תמונות לגודל מקסימלי"
          />

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

          <Button 
            variant="contained" 
            color="secondary"
            onClick={handleSaveAllAsPNG}
          >
            Save All Pages as PNG
          </Button>
        </Box>

        {Array.from({ length: numberOfCanvases }, (_, i) => {
          const startIndex = i * (cols * rows);
          const endIndex = Math.min(startIndex + (cols * rows), images.length);
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
              pageSize={pageSize}
              rows={rows}
              cols={cols}
              stretchImages={stretchImages}
            />
          );
        })}
      </Box>
    </Container>
  );
}

export default App; 