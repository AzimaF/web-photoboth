import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

function isSkyBlue(r, g, b) {
  return r >= 100 && r <= 245 && g >= 180 && g <= 255 && b >= 200 && b <= 255 && b > r + 10 && b > g - 10;
}

async function findAllSlots() {
  const img = await loadImage("public/tumpul's-photoboth/polaroid.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  const yRanges = [
    { start: 0, end: 1500 },
    { start: 1500, end: 2800 },
    { start: 2800, end: 4100 },
    { start: 4100, end: 5400 }
  ];
  
  for (let i = 0; i < yRanges.length; i++) {
    const range = yRanges[i];
    let minX = img.width, maxX = 0;
    let minY = img.height, maxY = 0;
    
    for (let y = range.start; y < range.end; y++) {
      for (let x = 0; x < img.width; x++) {
        const idx = (y * img.width + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        if (a > 0 && isSkyBlue(r, g, b)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    console.log(`Slot ${i + 1}:`);
    console.log(`  x: ${minX}, y: ${minY}, w: ${maxX - minX + 1}, h: ${maxY - minY + 1}`);
  }
}

findAllSlots().catch(console.error);
