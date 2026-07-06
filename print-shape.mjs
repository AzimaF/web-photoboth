import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

function isPlaceholderPixel(r, g, b) {
  const isSkyBlue = (r >= 80 && r <= 255 && g >= 160 && g <= 255 && b >= 190 && b <= 255 && b >= r - 10 && b >= g - 20);
  const isCloud = (r >= 190 && g >= 190 && b >= 190 && Math.abs(r - g) <= 25 && Math.abs(g - b) <= 25);
  const isGreenHills = (g >= 100 && g <= 255 && r >= 30 && r <= 255 && b >= 0 && b <= 245 && g >= r - 15 && g >= b + 5);
  return isSkyBlue || isCloud || isGreenHills;
}

async function printShape() {
  const img = await loadImage("public/tumpul's-photoboth/polaroid.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  // Print every 40th pixel to see the shape
  for (let y = 198; y < 1500; y += 40) {
    let line = '';
    for (let x = 269; x < 1710; x += 20) {
      const idx = (y * img.width + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      if (a > 0 && isPlaceholderPixel(r, g, b)) {
        line += '#';
      } else {
        line += '.';
      }
    }
    console.log(line);
  }
}

printShape().catch(console.error);
