import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

// The proposed relaxed rules
function isRelaxedPlaceholder(r, g, b) {
  const isSkyBlue = (r >= 80 && r <= 255 && g >= 160 && g <= 255 && b >= 190 && b <= 255 && b >= r - 10 && b >= g - 20);
  const isCloud = (r >= 190 && g >= 190 && b >= 190 && Math.abs(r - g) <= 25 && Math.abs(g - b) <= 25);
  const isGreenHills = (g >= 100 && g <= 255 && r >= 30 && r <= 255 && b >= 0 && b <= 245 && g >= r - 15 && g >= b + 5);
  return isSkyBlue || isCloud || isGreenHills;
}

// Function to find "wrongly punched" pixels
// If a pixel is OUTSIDE the slots, it shouldn't be punched out (wait, holes are only punched inside slots anyway!)
async function testTemplate(fileName, slots) {
  const img = await loadImage(`public/tumpul's-photoboth/${fileName}`);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  let restoredCount = 0;
  
  for (const slot of slots) {
    const data = ctx.getImageData(slot.x, slot.y, slot.w, slot.h).data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      // A pixel is RESTORED if it's NOT a placeholder.
      if (a > 0 && !isRelaxedPlaceholder(r, g, b)) {
        restoredCount++;
      }
    }
  }
  
  console.log(`${fileName} restored pixels inside slots: ${restoredCount}`);
}

async function run() {
  await testTemplate('clasic.png', [
    { x: 736, y: 77, w: 857, h: 496 },
    { x: 736, y: 1467, w: 857, h: 496 },
    { x: 736, y: 2860, w: 857, h: 496 },
    { x: 736, y: 4254, w: 857, h: 496 }
  ]);
  
  await testTemplate('film.png', [
    { x: 661, y: 21, w: 1020, h: 1114 },
    { x: 661, y: 1417, w: 1020, h: 1126 },
    { x: 661, y: 2812, w: 1020, h: 1126 },
    { x: 661, y: 4210, w: 1020, h: 1125 }
  ]);
  
  await testTemplate('minimalist.png', [
    { x: 618, y: 98, w: 983, h: 480 },
    { x: 651, y: 1440, w: 998, h: 519 },
    { x: 618, y: 2848, w: 958, h: 508 },
    { x: 626, y: 4239, w: 999, h: 518 }
  ]);
  
  await testTemplate('retro.png', [
    { x: 736, y: 77, w: 857, h: 496 },
    { x: 736, y: 1467, w: 857, h: 496 },
    { x: 736, y: 2860, w: 857, h: 496 },
    { x: 736, y: 4254, w: 857, h: 496 }
  ]);
  
  await testTemplate('neon.png', [
    { x: 736, y: 77, w: 857, h: 496 },
    { x: 736, y: 1467, w: 857, h: 496 },
    { x: 736, y: 2860, w: 857, h: 496 },
    { x: 736, y: 4254, w: 857, h: 496 }
  ]);
}

run().catch(console.error);
