import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Paper,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ImageData } from '../types/image';
import { PAGE_SIZES } from '../constants/dimensions';
import templates from '../utils/templetCollage';

interface CollageTemplate {
  id: string;
  name: string;
  imageCount: number;
  slots: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

const CollagePage: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageData[] = [];
    Array.from(files).forEach(file => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          url: img.src,
          element: img,
          name: file.name,
          width: img.width,
          height: img.height,
        });
        if (newImages.length === files.length) {
          setSelectedImages(prev => [...prev, ...newImages]);
        }
      };
    });
  };

  const handleRemoveImage = (imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleTemplateChange = (event: any) => {
    setSelectedTemplate(event.target.value);
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(event.target.value);
  };

  const handleOrientationChange = (event: any) => {
    setOrientation(event.target.value);
  };

  const drawCollage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTemplate || selectedImages.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Draw images using template slots
    template.slots.forEach((slot, index) => {
      if (index >= selectedImages.length) return;
      
      const image = selectedImages[index];
      const x = slot.x * canvas.width;
      const y = slot.y * canvas.height;
      const width = slot.width * canvas.width;
      const height = slot.height * canvas.height;

      ctx.drawImage(image.element, x, y, width, height);
    });
  };

  const availableTemplates = selectedImages.length > 10
    ? [{ id: 'random', name: 'Random Layout', imageCount: selectedImages.length }]
    : templates.filter(template => template.imageCount === selectedImages.length);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const { width, height } = PAGE_SIZES[pageSize];
      // Swap width and height if landscape
      canvas.width = orientation === 'landscape' ? height : width;
      canvas.height = orientation === 'landscape' ? width : height;
      drawCollage();
    }
  }, [selectedTemplate, selectedImages, pageSize, orientation]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create Collage
      </Typography>
      <Typography variant="body1" paragraph>
        Create beautiful collages from your selected images
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Page Size</InputLabel>
            <Select
              value={pageSize}
              label="Page Size"
              onChange={handlePageSizeChange}
            >
              {Object.entries(PAGE_SIZES).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Orientation</InputLabel>
            <Select
              value={orientation}
              label="Orientation"
              onChange={handleOrientationChange}
            >
              <MenuItem value="portrait">Portrait</MenuItem>
              <MenuItem value="landscape">Landscape</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box>
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
              Select Images
            </Button>
          </label>
        </Box>

        {selectedImages.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Selected Images ({selectedImages.length})
            </Typography>
            <Grid container spacing={2}>
              {selectedImages.map((image) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={image.url}
                      alt={image.name}
                    />
                    <CardContent sx={{ position: 'relative' }}>
                      <Typography variant="body2" noWrap>
                        {image.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(image.id)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {availableTemplates.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <FormControl fullWidth>
                  <InputLabel id="template-select-label">Select Template</InputLabel>
                  <Select
                    labelId="template-select-label"
                    id="template-select"
                    value={selectedTemplate}
                    label="Select Template"
                    onChange={handleTemplateChange}
                  >
                    {availableTemplates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </>
        )}

        {selectedTemplate && selectedImages.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default CollagePage; 