import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

async function findPolaroidHoles() {
  const img = await loadImage("public/tumpul's-photoboth/polaroid.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  // In polaroid.png, the background is brown/orange.
  // The polaroid frame is white.
  // The INSIDE of the polaroid frame... what color is it?
  // Let's print the colors of the pixels at the center of the first slot.
  // The first slot in my code was x: 525, y: 257, w: 996, h: 890.
  // Center is x: 1023, y: 702
  
  let centerIdx = (702 * img.width + 1023) * 4;
  console.log(`Center of slot 1 color: rgb(${data[centerIdx]}, ${data[centerIdx+1]}, ${data[centerIdx+2]}, ${data[centerIdx+3]})`);
  
  // Let's print the colors vertically down the center to see where the white frame starts and ends
  let yStart = -1, yEnd = -1;
  const cx = 1023;
  for (let y = 100; y < 1500; y++) {
    const idx = (y * img.width + cx) * 4;
    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
    
    // Check if it's the transparent hole!
    if (a === 0) {
      if (yStart === -1) yStart = y;
      yEnd = y;
    }
  }
  
  if (yStart !== -1) {
    console.log(`Transparent hole found at X=${cx}, Y from ${yStart} to ${yEnd}. Height = ${yEnd - yStart + 1}`);
  } else {
    console.log("No transparent hole found along center Y axis!");
  }
}

findPolaroidHoles().catch(console.error);
