import { ImageData } from '../types/image';
import { CELL_WIDTH, CELL_HEIGHT } from '../constants/dimensions';

export const processImage = (image: HTMLImageElement): ImageData => {
  const { width, height } = image;
  return {
    url: image.src,
    width,
    height,
    element: image
  };
};

export const calculateImageDimensions = (imageWidth: number, imageHeight: number) => {
  const aspectRatio = imageWidth / imageHeight;
  const isLandscape = imageWidth > imageHeight;
  const isNearlySquare = aspectRatio > 0.9 && aspectRatio < 1.1;

  if (isNearlySquare) {
    // תמונות מרובעות - למתוח לרוחב המקסימלי
    return {
      width: CELL_WIDTH,
      height: CELL_WIDTH / aspectRatio,
      shouldRotate: false
    };
  }

  if (isLandscape) {


    const rotatedAspectRatio = imageHeight / imageWidth;
    
    let rotatedHeight = CELL_HEIGHT;
    let rotatedWidth = rotatedHeight * rotatedAspectRatio;


    if (rotatedWidth > CELL_WIDTH) {
      rotatedWidth = CELL_WIDTH;
      rotatedHeight = rotatedWidth / rotatedAspectRatio;
    }

    return {
      width: rotatedWidth,
      height: rotatedHeight,
      shouldRotate: true
    };
  }


  const maxHeight = CELL_HEIGHT;
  

  let width = maxHeight * aspectRatio;
  

  if (width > CELL_WIDTH) {
    const scale = CELL_WIDTH / width;
    width = CELL_WIDTH;
    return {
      width: CELL_WIDTH,
      height: maxHeight * scale,
      shouldRotate: false
    };
  }
  

  if (width < CELL_WIDTH) {
    width = CELL_WIDTH;
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