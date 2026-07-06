import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const templateDir = path.join(process.cwd(), 'public', "tumpul's-photoboth");

async function checkTransparency() {
  const imgPath = path.join(templateDir, 'book.png');
  const image = await Jimp.read(imgPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let transparentPixels = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const hex = image.getPixelColor(x, y);
      const a = hex & 255; // Jimp hex is RGBA
      if (a < 128) { // completely or mostly transparent
        transparentPixels++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  console.log(`Transparent pixels: ${transparentPixels}`);
  if (transparentPixels > 0) {
    console.log(`Bounding box of transparency: x=${minX}, y=${minY}, w=${maxX - minX}, h=${maxY - minY}`);
  }
}

checkTransparency().catch(console.error);
