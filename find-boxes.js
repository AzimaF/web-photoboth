import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const templateDir = path.join(process.cwd(), 'public', "tumpul's-photoboth");

async function printAscii() {
  const imgPath = path.join(templateDir, 'neon.png');
  const image = await Jimp.read(imgPath);
  
  // Resize to 40x120 for console
  image.resize(40, 120);
  
  const chars = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
  
  for (let y = 0; y < image.bitmap.height; y++) {
    let row = '';
    for (let x = 0; x < image.bitmap.width; x++) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >>> 24) & 255;
      const g = (hex >>> 16) & 255;
      const b = (hex >>> 8) & 255;
      const brightness = (r + g + b) / 3;
      const charIdx = Math.floor((brightness / 255) * (chars.length - 1));
      row += chars[charIdx];
    }
    console.log(y.toString().padStart(3, '0') + ' ' + row);
  }
}

printAscii();
