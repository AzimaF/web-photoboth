import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const templateDir = path.join(process.cwd(), 'public', "tumpul's-photoboth");

function isGreenish(r, g, b) {
  // Simple green detection: G > R and G > B by a decent margin
  return g > r + 20 && g > b + 20;
}

async function findGreenBoxes() {
  const imgPath = path.join(templateDir, 'book.png');
  const image = await Jimp.read(imgPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  // Find all green pixels
  let minX = width, maxX = 0, minY = height, maxY = 0;
  const greenRows = new Array(height).fill(false);
  
  for (let y = 0; y < height; y++) {
    let hasGreen = false;
    for (let x = 0; x < width; x++) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >>> 24) & 255;
      const g = (hex >>> 16) & 255;
      const b = (hex >>> 8) & 255;
      
      if (isGreenish(r, g, b)) {
        hasGreen = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    greenRows[y] = hasGreen;
  }
  
  // Find continuous green regions
  const slots = [];
  let inSlot = false;
  let slotStart = 0;
  
  for (let y = 0; y < height; y++) {
    if (greenRows[y] && !inSlot) {
      inSlot = true;
      slotStart = y;
    } else if (!greenRows[y] && inSlot) {
      inSlot = false;
      const slotH = y - slotStart;
      if (slotH > 50) {
        slots.push({ y: slotStart, h: slotH });
      }
    }
  }
  if (inSlot) {
    const slotH = height - slotStart;
    if (slotH > 50) slots.push({ y: slotStart, h: slotH });
  }
  
  // Refine X bounds for each slot
  for (const slot of slots) {
    let sMinX = width, sMaxX = 0;
    const midY = slot.y + Math.floor(slot.h / 2);
    for (let x = 0; x < width; x++) {
      const hex = image.getPixelColor(x, midY);
      const r = (hex >>> 24) & 255;
      const g = (hex >>> 16) & 255;
      const b = (hex >>> 8) & 255;
      if (isGreenish(r, g, b)) {
        if (x < sMinX) sMinX = x;
        if (x > sMaxX) sMaxX = x;
      }
    }
    slot.x = sMinX;
    slot.w = sMaxX - sMinX;
  }
  
  console.log(JSON.stringify(slots, null, 2));
}

findGreenBoxes().catch(console.error);
