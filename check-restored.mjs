import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

function isPlaceholderPixel(r, g, b) {
  const isSkyBlue = (r >= 95 && r <= 242 && g >= 175 && g <= 252 && b >= 200 && b <= 255 && b > r + 5 && b > g - 15);
  const isCloud = (r >= 200 && r <= 255 && g >= 200 && g <= 255 && b >= 200 && b <= 255 && b >= r - 4 && b >= g - 4 && Math.abs(r - g) <= 15 && Math.abs(g - b) <= 15);
  const isGreenHills = (g >= 110 && g <= 255 && r >= 50 && r <= 240 && b >= 0 && b <= 235 && g > r - 5 && g > b + 10);
  return isSkyBlue || isCloud || isGreenHills;
}

async function checkRestoredPixels() {
  const img = await loadImage("public/tumpul's-photoboth/book.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const slots = [
    { x: 466, y: 143,  w: 1371, h: 1372 },
    { x: 466, y: 1623, w: 1371, h: 1373 },
    { x: 466, y: 3104, w: 1371, h: 1372 },
  ];
  
  let restoredPixelsCount = 0;
  let nonEdgeRestored = 0;
  
  for (const slot of slots) {
    const data = ctx.getImageData(slot.x, slot.y, slot.w, slot.h).data;
    for (let y = 0; y < slot.h; y++) {
      for (let x = 0; x < slot.w; x++) {
        const i = (y * slot.w + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        if (a > 0 && !isPlaceholderPixel(r, g, b)) {
          restoredPixelsCount++;
          // Check if it's far from the "edges" of the slot
          if (x > 10 && x < slot.w - 10 && y > 10 && y < slot.h - 10) {
            nonEdgeRestored++;
          }
        }
      }
    }
  }
  
  console.log(`Total restored pixels in slots: ${restoredPixelsCount}`);
  console.log(`Restored pixels not on edges: ${nonEdgeRestored}`);
}

checkRestoredPixels().catch(console.error);
