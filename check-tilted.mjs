import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

async function checkTilted() {
  const img = await loadImage("public/tumpul's-photoboth/polaroid.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  // Let's print the top row of the placeholder
  for (let y = 190; y < 220; y++) {
    let firstX = -1, lastX = -1;
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      if (a > 0 && r < 100 && b > 200) { // roughly sky blue
        if (firstX === -1) firstX = x;
        lastX = x;
      }
    }
    if (firstX !== -1) {
      console.log(`y=${y}: Sky blue from x=${firstX} to x=${lastX}`);
    }
  }
}

checkTilted().catch(console.error);
