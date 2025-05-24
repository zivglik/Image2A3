import React from 'react';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material';
import { PAGE_SIZES, GRID_ROWS_OPTIONS, GRID_COLS_OPTIONS } from '../constants/dimensions';

interface GridControlsProps {
  pageSize: keyof typeof PAGE_SIZES;
  rows: number;
  cols: number;
  stretchImages: boolean;
  onPageSizeChange: (event: SelectChangeEvent) => void;
  onRowsChange: (event: SelectChangeEvent) => void;
  onColsChange: (event: SelectChangeEvent) => void;
  onStretchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}

const GridControls: React.FC<GridControlsProps> = ({
  pageSize,
  rows,
  cols,
  stretchImages,
  onPageSizeChange,
  onRowsChange,
  onColsChange,
  onStretchChange,
  onReset,
}) => {
  return (
    <>
      <Stack
        direction={{ xs: 'row', sm: 'row' }}
        
        sx={{
          mb: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}
      >
        <FormControl sx={{ minWidth: { xs: "30%", sm: 120 } }}>
          <InputLabel>Page Size</InputLabel>
          <Select
            value={pageSize}
            label="Page Size"
            onChange={onPageSizeChange}
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
            onChange={onRowsChange}
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
            onChange={onColsChange}
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
              onChange={onStretchChange}
            />
          }
          label="Fit images"
        />
        <Button
          variant="outlined"
          component="span"
          onClick={onReset}
        >
          Reset
        </Button>
      </Stack>
    </>
  );
};

export default GridControls; 