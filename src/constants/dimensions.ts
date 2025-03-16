// A3 dimensions in pixels at 300 DPI
export const A3_WIDTH = 4961; // 420mm * 300DPI / 25.4
export const A3_HEIGHT = 3508; // 297mm * 300DPI / 25.4

// Grid dimensions
export const GRID_COLS = 4;
export const GRID_ROWS = 2;

// Calculate exact cell dimensions
export const CELL_WIDTH = Math.floor(A3_WIDTH / GRID_COLS);
export const CELL_HEIGHT = Math.floor(A3_HEIGHT / GRID_ROWS); 