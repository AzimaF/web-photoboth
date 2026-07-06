import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

function isPlaceholderPixel(r, g, b) {
  const isSkyBlue = (r >= 95 && r <= 242 && g >= 175 && g <= 252 && b >= 200 && b <= 255 && b > r + 5 && b > g - 15);
  const isCloud = (r >= 200 && r <= 255 && g >= 200 && g <= 255 && b >= 200 && b <= 255 && b >= r - 4 && b >= g - 4 && Math.abs(r - g) <= 15 && Math.abs(g - b) <= 15);
  const isGreenHills = (g >= 110 && g <= 255 && r >= 50 && r <= 240 && b >= 0 && b <= 235 && g > r - 5 && g > b + 10);
  return isSkyBlue || isCloud || isGreenHills;
}

// Function to check if a pixel is likely a white/blue/green anti-aliased noise
function isNoise(r, g, b) {
  // We want to find pixels that are failing isPlaceholderPixel but are NOT the colorful stickers
  // Stickers: yellow (high r, high g, low b), gray (similar r,g,b but low values), pink (high r, low g)
  // Let's just find anything that fails isPlaceholderPixel and print the most common ones
  return !isPlaceholderPixel(r, g, b);
}

async function checkNoise() {
  const img = await loadImage("public/tumpul's-photoboth/book.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const slots = [
    { x: 466, y: 143,  w: 1371, h: 1372 }
  ];
  
  const colorMap = new Map();
  
  for (const slot of slots) {
    const data = ctx.getImageData(slot.x, slot.y, slot.w, slot.h).data;
    for (let y = 10; y < slot.h - 10; y++) {
      for (let x = 10; x < slot.w - 10; x++) {
        // Exclude the top right (smiley face)
        if (x > slot.w - 300 && y < 300) continue;
        // Exclude top left (tape)
        if (x < 300 && y < 300) continue;
        
        const i = (y * slot.w + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        if (a > 0 && isNoise(r, g, b)) {
          const key = `rgb(${r},${g},${b})`;
          colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }
      }
    }
  }
  
  const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`Top 20 noise colors:`);
  for (let i = 0; i < 20 && i < sorted.length; i++) {
    console.log(`${sorted[i][0]}: ${sorted[i][1]} pixels`);
  }
}

checkNoise().catch(console.error);
