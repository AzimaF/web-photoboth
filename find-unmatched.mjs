import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

function isGreenHills(r, g, b) {
  return (
    g >= 110 && g <= 255 &&
    r >= 50 && r <= 240 &&
    b >= 0 && b <= 235 &&
    g > r - 5 &&
    g > b + 10
  );
}

async function findUnmatchedColors() {
  const img = await loadImage("public/tumpul's-photoboth/book.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(466, 1073, 1371, 442); // Just the green hills of slot 1
  const data = imgData.data;
  
  const unmatched = new Set();
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
    if (a === 0) continue;
    
    if (!isGreenHills(r, g, b)) {
      unmatched.add(`rgb(${r},${g},${b})`);
    }
  }
  
  console.log(`Unmatched colors count: ${unmatched.size}`);
  const iter = unmatched.values();
  for (let i = 0; i < 20 && i < unmatched.size; i++) {
    console.log(iter.next().value);
  }
}

findUnmatchedColors().catch(console.error);
