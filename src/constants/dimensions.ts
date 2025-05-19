// Page dimensions in pixels at 300 DPI
export const PAGE_SIZES = {
  A3: {
    width: 4961,  // 420mm * 300DPI / 25.4
    height: 3508, // 297mm * 300DPI / 25.4
    name: 'A3'
  },
  A4: {
    width: 3508,  // 297mm * 300DPI / 25.4
    height: 2480, // 210mm * 300DPI / 25.4
    name: 'A4'
  },
  A5: {
    width: 2480,  // 210mm * 300DPI / 25.4
    height: 1748, // 148mm * 300DPI / 25.4
    name: 'A5'
  }
};

export const GRID_ROWS_OPTIONS = [2, 3, 4, 5, 6];
export const GRID_COLS_OPTIONS = [2, 3, 4, 5, 6];

// Calculate cell dimensions based on page size and grid configuration
export const calculateCellDimensions = (pageSize: keyof typeof PAGE_SIZES, rows: number, cols: number) => {
  const { width, height } = PAGE_SIZES[pageSize];
  return {
    cellWidth: Math.floor(width / cols),
    cellHeight: Math.floor(height / rows)
  };
}; 