import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { useNavigate } from 'react-router-dom';

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  path: string;
  description: string;
}

const features: FeatureCard[] = [
  {
    icon: <GridOnIcon sx={{ fontSize: 40 }} />,
    title: 'Photo Grid',
    path: '/photo-grid',
    description: 'Create photo grids with custom layouts'
  },
  {
    icon: <ViewModuleIcon sx={{ fontSize: 40 }} />,
    title: 'Flyer Grid',
    path: '/flyer-grid',
    description: 'Design flyers with grid layouts'
  },
  {
    icon: <PhotoLibraryIcon sx={{ fontSize: 40 }} />,
    title: 'Create Collage',
    path: '/collage',
    description: 'Create beautiful collages from your photos'
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Smart Photo Grid
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
          Choose a feature to get started
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 4 }}>
          {features.map((feature) => (
            <Grid item xs={4} key={feature.title}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    backgroundColor: 'action.hover'
                  }
                }}
                onClick={() => navigate(feature.path)}
              >
                <Box sx={{ color: 'primary.main', mb: 1 }}>
                  {feature.icon}
                </Box>
                <Typography variant="subtitle2" component="h2" gutterBottom align="center">
                  {feature.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 