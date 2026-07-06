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
    { x: 466, y: 143,  w: 1371, h: 1372 }
  ];
  
  const colors = new Set();
  
  for (const slot of slots) {
    const data = ctx.getImageData(slot.x, slot.y, slot.w, slot.h).data;
    for (let y = 10; y < slot.h - 10; y++) {
      for (let x = 10; x < slot.w - 10; x++) {
        const i = (y * slot.w + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        if (a > 0 && !isPlaceholderPixel(r, g, b)) {
          colors.add(`rgb(${r},${g},${b})`);
        }
      }
    }
  }
  
  console.log(`Unique colors found: ${colors.size}`);
  const iter = colors.values();
  for (let i = 0; i < 20 && i < colors.size; i++) {
    console.log(iter.next().value);
  }
}

checkRestoredPixels().catch(console.error);
