import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

function isRelaxedPlaceholder(r, g, b) {
  const isSkyBlue = (r >= 80 && r <= 255 && g >= 160 && g <= 255 && b >= 190 && b <= 255 && b >= r - 10 && b >= g - 20);
  const isCloud = (r >= 190 && g >= 190 && b >= 190 && Math.abs(r - g) <= 25 && Math.abs(g - b) <= 25);
  const isGreenHills = (g >= 100 && g <= 255 && r >= 30 && r <= 255 && b >= 0 && b <= 245 && g >= r - 15 && g >= b + 5);
  return isSkyBlue || isCloud || isGreenHills;
}

async function checkMinimalist() {
  const img = await loadImage(`public/tumpul's-photoboth/minimalist.png`);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const slots = [
    { x: 618, y: 98, w: 983, h: 480 },
    { x: 651, y: 1440, w: 998, h: 519 },
    { x: 618, y: 2848, w: 958, h: 508 },
    { x: 626, y: 4239, w: 999, h: 518 }
  ];
  
  const colorMap = new Map();
  let count = 0;
  
  for (const slot of slots) {
    const data = ctx.getImageData(slot.x, slot.y, slot.w, slot.h).data;
    for (let y = 10; y < slot.h - 10; y++) {
      for (let x = 10; x < slot.w - 10; x++) {
        const i = (y * slot.w + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        if (a > 0 && !isRelaxedPlaceholder(r, g, b)) {
          const key = `rgb(${r},${g},${b})`;
          colorMap.set(key, (colorMap.get(key) || 0) + 1);
          count++;
        }
      }
    }
  }
  
  console.log(`Total non-edge restored in minimalist.png: ${count}`);
  const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);
  for (let i = 0; i < 20 && i < sorted.length; i++) {
    console.log(`${sorted[i][0]}: ${sorted[i][1]} pixels`);
  }
}

checkMinimalist().catch(console.error);
