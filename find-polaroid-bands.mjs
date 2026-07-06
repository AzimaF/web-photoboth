import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

function isPlaceholderPixel(r, g, b) {
  const isSkyBlue = (r >= 80 && r <= 255 && g >= 160 && g <= 255 && b >= 190 && b <= 255 && b >= r - 10 && b >= g - 20);
  const isCloud = (r >= 190 && g >= 190 && b >= 190 && Math.abs(r - g) <= 25 && Math.abs(g - b) <= 25);
  const isGreenHills = (g >= 100 && g <= 255 && r >= 30 && r <= 255 && b >= 0 && b <= 245 && g >= r - 15 && g >= b + 5);
  return isSkyBlue || isCloud || isGreenHills;
}

async function findPolaroidBands() {
  const img = await loadImage("public/tumpul's-photoboth/polaroid.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  const bands = [];
  const cx = Math.floor(img.width / 2);
  
  let inBand = false;
  let bandStart = -1;
  
  for (let y = 0; y < img.height; y++) {
    const idx = (y * img.width + cx) * 4;
    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
    
    if (a > 0 && isPlaceholderPixel(r, g, b)) {
      if (!inBand) {
        inBand = true;
        bandStart = y;
      }
    } else {
      if (inBand) {
        inBand = false;
        bands.push({ y: bandStart, h: y - bandStart });
      }
    }
  }
  if (inBand) bands.push({ y: bandStart, h: img.height - bandStart });
  
  console.log('Vertical bands of placeholder at center X:');
  console.log(bands);
  
  // Now for each band, let's find its max width
  for (const band of bands) {
    let minX = img.width, maxX = 0;
    for (let y = band.y; y < band.y + band.h; y++) {
      for (let x = 0; x < img.width; x++) {
        const idx = (y * img.width + x) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        if (a > 0 && isPlaceholderPixel(r, g, b)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }
    console.log(`Band at Y=${band.y}: X from ${minX} to ${maxX} (width: ${maxX - minX + 1})`);
  }
}

findPolaroidBands().catch(console.error);
