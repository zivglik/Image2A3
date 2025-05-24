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
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        <Stack 
          direction={isMobile ? "column" : "row"} 
          spacing={2} 
          sx={{ 
            mb: 2,
            '& .MuiFormControl-root': {
              width: isMobile ? '100%' : 200
            }
          }}
        >
          <FormControl>
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

          <FormControl>
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
            <Button variant="contained" component="span" fullWidth={isMobile}>
              Select Images
            </Button>
          </label>
        </Box>

        {selectedImages.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Selected Images ({selectedImages.length})
            </Typography>
            <Box
              sx={{
                width: '100%',
                overflow: 'hidden',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '20px',
                  background: 'linear-gradient(to right, transparent, white)',
                  pointerEvents: 'none',
                  zIndex: 1
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: 2,
                  pb: 2,
                  width: '82vw',
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                    '&:hover': {
                      background: '#555',
                    },
                  },
                  // Prevent horizontal page stretching
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                }}
              >
                {selectedImages.map((image) => (
                  <Card
                    key={image.id}
                    sx={{
                      minWidth: isMobile ? 100 : 150,
                      maxWidth: isMobile ? 100 : 150,
                      flexShrink: 0,
                    }}
                  >
                    <CardMedia
                      component="img"
                      height={isMobile ? 50 : 100}
                      image={image.url}
                      alt={image.name}
                      sx={{
                        objectFit: 'cover',
                        width: '100%'
                      }}
                    />
                    <CardContent sx={{ 
                      position: 'relative', 
                      p: isMobile ? 0.5 : 1,
                      '&:last-child': {
                        pb: isMobile ? 0.5 : 1
                      }
                    }}>
                      <Typography 
                        variant="caption" 
                        noWrap 
                        sx={{ 
                          fontSize: isMobile ? '0.6rem' : 'inherit'
                        }}
                      >
                        {image.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(image.id)}
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          right: 0,
                          p: isMobile ? 0.25 : 0.5
                        }}
                      >
                        <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>

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
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300
                        }
                      }
                    }}
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
                p: isMobile ? 1 : 2, 
                display: 'flex', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                overflow: 'hidden'
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