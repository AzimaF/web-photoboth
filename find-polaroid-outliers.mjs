import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

function isPlaceholderPixel(r, g, b) {
  const isSkyBlue = (r >= 80 && r <= 255 && g >= 160 && g <= 255 && b >= 190 && b <= 255 && b >= r - 10 && b >= g - 20);
  const isCloud = (r >= 190 && g >= 190 && b >= 190 && Math.abs(r - g) <= 25 && Math.abs(g - b) <= 25);
  const isGreenHills = (g >= 100 && g <= 255 && r >= 30 && r <= 255 && b >= 0 && b <= 245 && g >= r - 15 && g >= b + 5);
  return isSkyBlue || isCloud || isGreenHills;
}

async function findOutliers() {
  const img = await loadImage("public/tumpul's-photoboth/polaroid.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  // The center is around x=937
  // We found x as low as 269!
  // What is at x=269, y=198?
  let idx = (198 * img.width + 269) * 4;
  console.log(`At x=269, y=198: rgb(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  
  idx = (198 * img.width + 1000) * 4;
  console.log(`At x=1000, y=198: rgb(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
}

findOutliers().catch(console.error);
