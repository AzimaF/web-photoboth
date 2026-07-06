import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

function isPlaceholderPixel(r, g, b) {
  const isSkyBlue = (r >= 80 && r <= 255 && g >= 160 && g <= 255 && b >= 190 && b <= 255 && b >= r - 10 && b >= g - 20);
  const isCloud = (r >= 190 && g >= 190 && b >= 190 && Math.abs(r - g) <= 25 && Math.abs(g - b) <= 25);
  const isGreenHills = (g >= 100 && g <= 255 && r >= 30 && r <= 255 && b >= 0 && b <= 245 && g >= r - 15 && g >= b + 5);
  return isSkyBlue || isCloud || isGreenHills;
}

async function findSlots() {
  const img = await loadImage("public/tumpul's-photoboth/polaroid.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  // Array to hold slot bounds
  const slots = [];
  let currentSlot = null;
  
  for (let y = 0; y < img.height; y++) {
    let minX = img.width, maxX = 0;
    let found = false;
    
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      
      if (a > 0 && isPlaceholderPixel(r, g, b)) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    
    if (found) {
      if (!currentSlot) {
        currentSlot = { yMin: y, yMax: y, xMin: minX, xMax: maxX };
      } else {
        currentSlot.yMax = y;
        if (minX < currentSlot.xMin) currentSlot.xMin = minX;
        if (maxX > currentSlot.xMax) currentSlot.xMax = maxX;
      }
    } else {
      if (currentSlot) {
        slots.push(currentSlot);
        currentSlot = null;
      }
    }
  }
  if (currentSlot) slots.push(currentSlot);
  
  console.log('Found slots in polaroid.png:');
  for (const s of slots) {
    console.log(`{ x: ${s.xMin}, y: ${s.yMin}, w: ${s.xMax - s.xMin + 1}, h: ${s.yMax - s.yMin + 1} },`);
  }
}

findSlots().catch(console.error);
