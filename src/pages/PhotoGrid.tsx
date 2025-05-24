import React, { useState, useRef } from 'react';
import GridViewIcon from '@mui/icons-material/GridView';
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
  Stack,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ImageData } from '../types/image';
import { GRID_COLS_OPTIONS, PAGE_SIZES, GRID_ROWS_OPTIONS } from '../constants/dimensions';
import { processImage } from '../utils/imageProcessing';
import { printCanvas, saveCanvasAsPNG, saveAllCanvasesAsPNG } from '../utils/printUtils';
import { saveAllCanvasesAsPDF } from '../utils/pdfUtils';
import PrintCanvas, { PrintCanvasRef } from '../components/PrintCanvas';

const PhotoGrid: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES>('A3');
  const [rows, setRows] = useState<number>(2);
  const [cols, setCols] = useState<number>(4);
  const [stretchImages, setStretchImages] = useState<boolean>(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const canvasRefs = useRef<(PrintCanvasRef | null)[]>([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handleSaveAllAsPDF = () => {
    const canvases = canvasRefs.current
      .map(ref => ref?.getPrintCanvas())
      .filter((canvas): canvas is HTMLCanvasElement => canvas !== null);

    saveAllCanvasesAsPDF(canvases);
  };

  const handleReset = () => {
    setOpenResetDialog(true);
  };

  const handleConfirmReset = () => {
    setImages([]);
    setPageSize('A3');
    setRows(2);
    setCols(4);
    setStretchImages(false);
    setOpenResetDialog(false);
  };

  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
  };

  const numberOfCanvases = Math.ceil(images.length / (cols * rows));

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ textAlign: 'left' }}>
        <Typography sx={{ py: 4 }} variant="h4" >
          <GridViewIcon /> Smart Photo Grid
          <Typography sx={{ py: 1, fontSize: 13 }}  >
            Select photos from your gallery, set the page size, number of rows and columns, choose whether to stretch the images to fit the cells – then save as PNG or PDF, or print directly.
          </Typography>
        </Typography>

        <Stack
          direction={{ xs: 'row', sm: 'row' }}
          spacing={2}
          sx={{
            mb: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            flexWrap: 'wrap'
          }}
        >
          <FormControl sx={{ minWidth: { xs: "30%", sm: 120 } }}>
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

          <FormControl sx={{ minWidth: { xs: "30%", sm: 120 } }}>
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

          <FormControl sx={{ minWidth: { xs: "30%", sm: 120 } }}>
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
        </Stack>

        <Stack direction="row" 
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={stretchImages}
                onChange={handleStretchChange}
              />
            }
            label="Fit images"
          />
          <Button
            variant="outlined"
            component="span"
            onClick={handleReset}
          >
            Reset
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            mb: 4,
            alignItems: { xs: 'stretch', sm: 'flex-start' }
          }}
        >
          <input
            accept="image/*"
            type="file"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload" style={{ margin: '0px', display: 'block', textAlign: 'left', width: '100%' }}>
            <Button
              variant="contained"
              component="span"
              fullWidth={isMobile}
              sx={{
                whiteSpace: 'nowrap',
                minWidth: { sm: '120px' },
                px: { sm: 3 },
              }}
            >
              Select Images
            </Button>
          </label>

          <Button
            disabled={images.length === 0}
            variant="contained"
            color="secondary"
            onClick={handleSaveAllAsPNG}
            fullWidth={isMobile}
            sx={{
              whiteSpace: 'nowrap',
              minWidth: { sm: '180px' },
              px: { sm: 7 }
            }}
          >
            Save All Pages as PNG
          </Button>

          <Button
            disabled={images.length === 0}
            variant="contained"
            color="secondary"
            onClick={handleSaveAllAsPDF}
            fullWidth={isMobile}
            sx={{
              whiteSpace: 'nowrap',
              minWidth: { sm: '180px' },
              px: { sm: 7 }
            }}
          >
            Save All Pages as PDF
          </Button>
        </Stack>

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

        <Dialog
          open={openResetDialog}
          onClose={handleCloseResetDialog}
        >
          <DialogTitle>Reset Confirmation</DialogTitle>
          <DialogContent>
            Are you sure you want to reset everything? This will clear all selected images and settings.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResetDialog}>Cancel</Button>
            <Button onClick={handleConfirmReset} color="error" autoFocus>
              Yes, Reset
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PhotoGrid; 