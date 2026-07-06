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

async function testPlaceholders() {
  const img = await loadImage("public/tumpul's-photoboth/book.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  let greenCount = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    if (isGreenHills(r, g, b)) {
      greenCount++;
    }
  }
  
  console.log(`Green pixels: ${greenCount}`);
}

testPlaceholders().catch(console.error);
