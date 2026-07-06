import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

function isPlaceholderPixel(r, g, b) {
  const isSkyBlue = (r >= 80 && r <= 255 && g >= 160 && g <= 255 && b >= 190 && b <= 255 && b >= r - 10 && b >= g - 20);
  const isCloud = (r >= 190 && g >= 190 && b >= 190 && Math.abs(r - g) <= 25 && Math.abs(g - b) <= 25);
  const isGreenHills = (g >= 100 && g <= 255 && r >= 30 && r <= 255 && b >= 0 && b <= 245 && g >= r - 15 && g >= b + 5);
  return isSkyBlue || isCloud || isGreenHills;
}

async function testPolaroid() {
  const dummy = createCanvas(1280, 720);
  const dctx = dummy.getContext('2d');
  dctx.fillStyle = '#00FF00'; // GREEN!
  dctx.fillRect(0, 0, 1280, 720);
  
  const template = await loadImage("public/tumpul's-photoboth/polaroid.png");
  
  const canvas = createCanvas(template.width, template.height);
  const ctx = canvas.getContext('2d');
  
  // Step 1: Photos
  const slots = [
    { x: 485, y: 198,  w: 1035, h: 1206 },
    { x: 485, y: 1503, w: 1035, h: 1206 },
    { x: 485, y: 2808, w: 1035, h: 1206 },
    { x: 485, y: 4113, w: 1035, h: 1206 },
  ];
  
  for (const slot of slots) {
    const tempCanvas = createCanvas(dummy.width, dummy.height);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(dummy, 0, 0);
    
    // Draw cover
    const slotRatio = slot.w / slot.h;
    const imgRatio = tempCanvas.width / tempCanvas.height;
    let sx, sy, sw, sh;
    if (imgRatio > slotRatio) {
      sh = tempCanvas.height;
      sw = sh * slotRatio;
      sx = (tempCanvas.width - sw) / 2;
      sy = 0;
    } else {
      sw = tempCanvas.width;
      sh = sw / slotRatio;
      sx = 0;
      sy = (tempCanvas.height - sh) / 2;
    }
    
    ctx.drawImage(tempCanvas, sx, sy, sw, sh, slot.x, slot.y, slot.w, slot.h);
  }
  
  // Step 2: Draw template on top
  const offCanvas = createCanvas(template.width, template.height);
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
  offCtx.drawImage(template, 0, 0);
  
  // Punch holes
  for (const slot of slots) {
    offCtx.clearRect(slot.x, slot.y, slot.w, slot.h);
  }
  
  // Step 3: Restore decorations
  const origCanvas = createCanvas(template.width, template.height);
  const origCtx = origCanvas.getContext('2d', { willReadFrequently: true });
  origCtx.drawImage(template, 0, 0);
  
  for (const slot of slots) {
    const origData = origCtx.getImageData(slot.x, slot.y, slot.w, slot.h);
    const dstData = offCtx.getImageData(slot.x, slot.y, slot.w, slot.h);
    const orig = origData.data;
    const dst = dstData.data;
    
    for (let i = 0; i < orig.length; i += 4) {
      const r = orig[i], g = orig[i+1], b = orig[i+2], a = orig[i+3];
      if (a > 0 && !isPlaceholderPixel(r, g, b)) {
        dst[i]   = r;
        dst[i+1] = g;
        dst[i+2] = b;
        dst[i+3] = a;
      }
    }
    offCtx.putImageData(dstData, slot.x, slot.y);
  }
  
  ctx.drawImage(offCanvas, 0, 0);
  
  fs.writeFileSync('C:/Users/whand/.gemini/antigravity-ide/brain/e7a20742-ee1f-4e94-aeaa-a580c5526b37/scratch/polaroid-test-out.png', canvas.toBuffer('image/png'));
  console.log("Saved test to scratch/");
}

testPolaroid().catch(console.error);
