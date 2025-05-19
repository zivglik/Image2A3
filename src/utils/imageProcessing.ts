import { ImageData } from '../types/image';
import { calculateCellDimensions } from '../constants/dimensions';

export const processImage = (image: HTMLImageElement): ImageData => {
  const { width, height } = image;
  return {
    url: image.src,
    width,
    height,
    element: image
  };
};

export const calculateImageDimensions = (
  imageWidth: number, 
  imageHeight: number,
  cellWidth: number,
  cellHeight: number
) => {
  const aspectRatio = imageWidth / imageHeight;
  const isLandscape = imageWidth > imageHeight;
  const isNearlySquare = aspectRatio > 0.9 && aspectRatio < 1.1;

  if (isNearlySquare) {
    // תמונות מרובעות - נשמור על יחס הגובה-רוחב ונמתח לפי הגבול הקטן יותר
    const scale = Math.min(cellWidth / imageWidth, cellHeight / imageHeight);
    return {
      width: imageWidth * scale,
      height: imageHeight * scale,
      shouldRotate: false
    };
  }

  if (isLandscape) {
    const rotatedAspectRatio = imageHeight / imageWidth;
    
    let rotatedHeight = cellHeight;
    let rotatedWidth = rotatedHeight * rotatedAspectRatio;

    if (rotatedWidth > cellWidth) {
      rotatedWidth = cellWidth;
      rotatedHeight = rotatedWidth / rotatedAspectRatio;
    }

    return {
      width: rotatedWidth,
      height: rotatedHeight,
      shouldRotate: true
    };
  }

  const maxHeight = cellHeight;
  let width = maxHeight * aspectRatio;

  if (width > cellWidth) {
    const scale = cellWidth / width;
    width = cellWidth;
    return {
      width: cellWidth,
      height: maxHeight * scale,
      shouldRotate: false
    };
  }

  if (width < cellWidth) {
    width = cellWidth;
  }

  return {
    width,
    height: maxHeight,
    shouldRotate: false
  };
};

export const drawRotatedImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const processingCanvas = document.createElement('canvas');
  const processingCtx = processingCanvas.getContext('2d')!;
  
  processingCanvas.width = width;
  processingCanvas.height = height;
  
  processingCtx.translate(width/2, height/2);
  processingCtx.rotate(Math.PI / 2);
  processingCtx.translate(-height/2, -width/2);
  
  processingCtx.drawImage(image, 0, 0, height, width);
  
  ctx.drawImage(processingCanvas, x, y);
}; 