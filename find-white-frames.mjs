import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

async function findWhiteFrames() {
  const img = await loadImage("public/tumpul's-photoboth/polaroid.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  // Find white pixels (r>250, g>250, b>250)
  // Let's find the left and right edges of the white frame for the first slot (y=200 to 1400)
  let minX = img.width, maxX = 0;
  for (let y = 200; y < 1400; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      if (a > 0 && r > 250 && g > 250 && b > 250) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }
  
  console.log(`White frame 1: x from ${minX} to ${maxX} (width: ${maxX - minX + 1})`);
}

findWhiteFrames().catch(console.error);
