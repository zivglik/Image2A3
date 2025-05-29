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
  Grid,
  Modal,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { ImageData } from '../types/image';
import { PAGE_SIZES } from '../constants/dimensions';
import templates from '../utils/templetCollage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CollageTemplate {
  id: string;
  name: string;
  imageCount: number;
  grid: string;
  positions: string[];
}

interface ImagePosition {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

const CollagePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [borderRadius, setBorderRadius] = useState<number>(16);
  const [imagePositions, setImagePositions] = useState<{ [key: string]: ImagePosition }>({});
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; distance: number; angle: number } | null>(null);
  const collageRef = useRef<HTMLDivElement>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageData[] = [];
    Array.from(files).forEach(file => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const id = Math.random().toString(36).substr(2, 9);
        newImages.push({
          id,
          url: img.src,
          element: img,
          name: file.name,
          width: img.width,
          height: img.height,
        });
        if (newImages.length === files.length) {
          setSelectedImages(prev => [...prev, ...newImages]);
          const newPositions = { ...imagePositions };
          newImages.forEach(img => {
            newPositions[img.id] = { 
              x: -50, 
              y: 0, 
              scale: 1.2,
              rotation: 0
            };
          });
          setImagePositions(newPositions);
        }
      };
    });
  };

  const handleRemoveImage = (imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
    const newPositions = { ...imagePositions };
    delete newPositions[imageId];
    setImagePositions(newPositions);
  };

  const handleTemplateChange = (event: any) => {
    setSelectedTemplate(event.target.value);
    const newPositions = { ...imagePositions };
    Object.keys(newPositions).forEach(key => {
      newPositions[key] = { x: -50, y: 0, scale: 1.2, rotation: 0 };
    });
    setImagePositions(newPositions);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(event.target.value);
  };

  const handleOrientationChange = (event: any) => {
    setOrientation(event.target.value);
  };

  const handleBorderRadiusChange = (event: any) => {
    setBorderRadius(event.target.value);
  };

  const handleMouseDown = (imageId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(imageId);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = (e.clientX - dragStart.x) * 0.05;
    const dy = (e.clientY - dragStart.y) * 0.05;

    setImagePositions(prev => ({
      ...prev,
      [isDragging]: {
        ...prev[isDragging],
        x: prev[isDragging].x + dx,
        y: prev[isDragging].y + dy,
      },
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(null);
  };

  const handleWheel = (imageId: string, e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.altKey) {
      // Rotation with Alt + wheel
      const rotationDelta = e.deltaY > 0 ? -5 : 5;
      setImagePositions(prev => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          rotation: (prev[imageId].rotation + rotationDelta) % 360,
        },
      }));
    } else {
      // Scaling with wheel
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setImagePositions(prev => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          scale: Math.max(0.5, Math.min(5, prev[imageId].scale + delta)),
        },
      }));
    }
  };

  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchAngle = (touch1: React.Touch, touch2: React.Touch) => {
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
  };

  const handleTouchStart = (imageId: string, e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      setTouchStart({
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
        distance: getTouchDistance(touch1, touch2),
        angle: getTouchAngle(touch1, touch2)
      });
    } else if (e.touches.length === 1) {
      setIsDragging(imageId);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (imageId: string, e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    if (e.touches.length === 2 && touchStart) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = getTouchDistance(touch1, touch2);
      const currentAngle = getTouchAngle(touch1, touch2);
      
      // Calculate scale change
      const scaleDelta = (currentDistance - touchStart.distance) * 0.01;
      
      // Calculate rotation change
      const rotationDelta = currentAngle - touchStart.angle;
      
      setImagePositions(prev => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          scale: Math.max(0.5, Math.min(5, prev[imageId].scale + scaleDelta)),
          rotation: (prev[imageId].rotation + rotationDelta) % 360
        }
      }));

      setTouchStart({
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
        distance: currentDistance,
        angle: currentAngle
      });
    } else if (e.touches.length === 1 && isDragging === imageId) {
      // Handle dragging with single touch
      const touch = e.touches[0];
      const dx = (touch.clientX - dragStart.x) * 0.2; // Increased from 0.05 to 0.2 for faster movement
      const dy = (touch.clientY - dragStart.y) * 0.2; // Increased from 0.05 to 0.2 for faster movement

      setImagePositions(prev => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          x: prev[imageId].x + dx,
          y: prev[imageId].y + dy,
        },
      }));

      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const availableTemplates = selectedImages.length > 0
    ? templates.filter(template => template.imageCount === selectedImages.length)
    : [];

  const handlePrint = async () => {
    if (!collageRef.current) return;
    
    const canvas = await html2canvas(collageRef.current, {
      scale: 2,
      backgroundColor: 'white',
    });
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const imgData = canvas.toDataURL('image/png');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Collage</title>
          <style>
            body { margin: 0; }
            img { width: 100%; height: auto; }
            @media print {
              img { max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" />
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleSaveAsPDF = async () => {
    if (!collageRef.current) return;

    const canvas = await html2canvas(collageRef.current, {
      scale: 2,
      backgroundColor: 'white',
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize.toLowerCase()
    });

    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('collage.pdf');
  };

  const handleSaveAsPNG = async () => {
    if (!collageRef.current) return;

    const canvas = await html2canvas(collageRef.current, {
      scale: 2,
      backgroundColor: 'white',
    });
    
    const link = document.createElement('a');
    link.download = 'collage.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const renderCollage = () => {
    if (!selectedTemplate || selectedImages.length === 0) return null;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return null;

    const gridParts = template.grid.split(' ');
    const columns = parseInt(gridParts[0].replace('grid-cols-', ''));
    const rows = parseInt(gridParts[1]?.replace('grid-rows-', '') || '1');

    return (
      <Box
        ref={collageRef}
        sx={{
          width: isMobile ? '100%' : '70%',
          aspectRatio: orientation === 'landscape' ? '16/9' : '9/16',
          backgroundColor: 'white',
          p: { xs: 1, sm: 2 },
          boxShadow: 3,
          touchAction: 'none',
          overflow: 'hidden',
          margin: 'auto',
          '& *': {
            touchAction: 'none',
          },
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: { xs: '4px', sm: '8px' },
            touchAction: 'none',
          }}
        >
          {template.positions.map((position, index) => {
            if (index >= selectedImages.length) return null;
            const image = selectedImages[index];
            const [colSpan, rowSpan] = position.split(' ').map(p => parseInt(p.replace(/[^0-9]/g, '')));
            const imagePosition = imagePositions[image.id] || { x: 0, y: 0, scale: 1, rotation: 0 };
            
            return (
              <Box
                key={image.id}
                sx={{
                  gridColumn: `span ${colSpan}`,
                  gridRow: `span ${rowSpan}`,
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#f0f0f0',
                  minHeight: { xs: '50px', sm: '100px' },
                  cursor: isDragging === image.id ? 'grabbing' : 'grab',
                  borderRadius: `${borderRadius}px`,
                  touchAction: 'none',
                }}
                onMouseDown={(e) => handleMouseDown(image.id, e)}
                onTouchStart={(e) => handleTouchStart(image.id, e)}
                onTouchMove={(e) => handleTouchMove(image.id, e)}
                onTouchEnd={handleTouchEnd}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    touchAction: 'none',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale}) rotate(${imagePosition.rotation}deg)`,
                      transformOrigin: 'center',
                      transition: isDragging === image.id ? 'none' : 'transform 0.3s ease',
                      '&:hover': {
                        zIndex: 1,
                      },
                      willChange: 'transform',
                      width: '100%',
                      height: '100%',
                      touchAction: 'none',
                    }}
                    onWheel={(e) => handleWheel(image.id, e)}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      style={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '300%',
                        maxHeight: '300%',
                        objectFit: 'contain',
                        display: 'block',
                        pointerEvents: 'none',
                        filter: isDragging === image.id ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))' : 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 2 }, touchAction: 'none' }}>
      <Box sx={{ textAlign: 'left', touchAction: 'none' }}>
        <Typography sx={{ py: { xs: 1, sm: 2 } }} variant="h4" >
          <ViewModuleIcon /> Create Collage
          <Typography sx={{ py: { xs: 0.25, sm: 0.5 }, fontSize: { xs: 11, sm: 13 } }}  >
            Select photos from your gallery, choose a template, and create a beautiful collage. Save as PNG or PDF, or print directly.
            Drag images to position them, use the mouse wheel to zoom, and Alt + mouse wheel to rotate. On mobile, drag with one finger, use two fingers to rotate and zoom.
          </Typography>
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 2 }}
          sx={{
            mb: { xs: 2, sm: 4 },
            alignItems: { xs: 'stretch', sm: 'flex-start' }
          }}
        >
          <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
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

          <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
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

          <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
            <InputLabel>Border Radius</InputLabel>
            <Select
              value={borderRadius}
              label="Border Radius"
              onChange={handleBorderRadiusChange}
            >
              <MenuItem value={0}>None</MenuItem>
              <MenuItem value={8}>Small</MenuItem>
              <MenuItem value={16}>Medium</MenuItem>
              <MenuItem value={24}>Large</MenuItem>
              <MenuItem value={32}>Extra Large</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box sx={{ mb: 4 }}>
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
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  WebkitOverflowScrolling: 'touch',
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
          <Dialog
            open={isEditorOpen}
            onClose={handleCloseEditor}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            sx={{
              '& .MuiDialog-paper': {
                margin: 0,
                height: isMobile ? '100%' : '90vh',
                maxHeight: isMobile ? '100%' : '90vh',
                overflow: 'hidden',
                width: isMobile ? '100%' : '90vw',
                maxWidth: isMobile ? '100%' : '90vw',
                display: 'flex',
                flexDirection: 'column',
              },
            }}
          >
            <DialogContent 
              sx={{ 
                p: 0, 
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                '&.MuiDialogContent-root': {
                  padding: 0,
                }
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: '#f5f5f5',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 1, sm: 2 },
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {renderCollage()}
                </Box>
                <Box 
                  sx={{ 
                    p: { xs: 1, sm: 2 }, 
                    bgcolor: 'background.paper',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={{ xs: 1, sm: 2 }} 
                    sx={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<PrintIcon />}
                      onClick={handlePrint}
                      fullWidth={isMobile}
                    >
                      Print
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={handleSaveAsPDF}
                      fullWidth={isMobile}
                    >
                      Save as PDF
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ImageIcon />}
                      onClick={handleSaveAsPNG}
                      fullWidth={isMobile}
                    >
                      Save as PNG
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCloseEditor}
                      fullWidth={isMobile}
                    >
                      Close
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        )}
      </Box>
    </Container>
  );
};

export default CollagePage; 