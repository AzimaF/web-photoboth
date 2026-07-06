import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

// A strict check for the sky blue color inside the polaroid photo area
function isSkyBlue(r, g, b) {
  return r >= 100 && r <= 245 && g >= 180 && g <= 255 && b >= 200 && b <= 255 && b > r + 10 && b > g - 10;
}

async function findAllExactSlots() {
  const img = await loadImage("public/tumpul's-photoboth/polaroid.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  const yRanges = [
    { start: 0, end: 1450 },
    { start: 1450, end: 2750 },
    { start: 2750, end: 4050 },
    { start: 4050, end: 5400 }
  ];
  
  const slots = [];
  
  for (let i = 0; i < yRanges.length; i++) {
    const range = yRanges[i];
    let minX = img.width, maxX = 0;
    let minY = img.height, maxY = 0;
    
    for (let y = range.start; y < range.end; y++) {
      for (let x = 0; x < img.width; x++) {
        const idx = (y * img.width + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        // Check for placeholder colors (sky blue, or cloud, or green hills)
        // Since we know they form a rectangle, we can just check sky blue to find top/sides,
        // and green hills to find bottom.
        // Actually, just checking ANY non-white, non-orange pixel inside the white frame is enough.
        // But let's just use the relaxed placeholder check!
        const isSkyBlue = (r >= 80 && r <= 255 && g >= 160 && g <= 255 && b >= 190 && b <= 255 && b >= r - 10 && b >= g - 20);
        const isCloud = (r >= 190 && g >= 190 && b >= 190 && Math.abs(r - g) <= 25 && Math.abs(g - b) <= 25);
        const isGreenHills = (g >= 100 && g <= 255 && r >= 30 && r <= 255 && b >= 0 && b <= 245 && g >= r - 15 && g >= b + 5);
        
        // Wait, isCloud matches the white frame! We must exclude the white frame!
        // White frame is r>250, g>250, b>250.
        if (a > 0 && (isSkyBlue || (isCloud && r < 240) || isGreenHills)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    
    slots.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
  }
  
  console.log('Exact slots:');
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    console.log(`    { x: ${s.x}, y: ${s.y}, w: ${s.w}, h: ${s.h} },`);
  }
}

findAllExactSlots().catch(console.error);
