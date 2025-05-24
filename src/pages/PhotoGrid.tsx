import React, { useState, useRef } from 'react';
import GridViewIcon from '@mui/icons-material/GridView';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ImageData } from '../types/image';
import { PAGE_SIZES } from '../constants/dimensions';
import { processImage } from '../utils/imageProcessing';
import { printCanvas, saveCanvasAsPNG, saveAllCanvasesAsPNG } from '../utils/printUtils';
import { saveAllCanvasesAsPDF } from '../utils/pdfUtils';
import PrintCanvas, { PrintCanvasRef } from '../components/PrintCanvas';
import GridControls from '../components/GridControls';
import { SelectChangeEvent } from '@mui/material';

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
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
      <Box sx={{ textAlign: 'left' }}>
        <Typography sx={{ py: 2 }} variant="h4" >
          <GridViewIcon /> Photos Grid
          <Typography sx={{ py: 0.5, fontSize: 13 }}  >
            Select photos from your gallery, set the page size, number of rows and columns, choose whether to stretch the images to fit the cells – then save as PNG or PDF, or print directly.
          </Typography>
        </Typography>

        <GridControls
          pageSize={pageSize}
          rows={rows}
          cols={cols}
          stretchImages={stretchImages}
          onPageSizeChange={handlePageSizeChange}
          onRowsChange={handleRowsChange}
          onColsChange={handleColsChange}
          onStretchChange={handleStretchChange}
          onReset={handleReset}
        />

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
              startIcon={<AddPhotoAlternateIcon />}
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
            startIcon={<ImageIcon />}
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
            startIcon={<PictureAsPdfIcon />}
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