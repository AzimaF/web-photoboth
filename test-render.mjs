import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

// Copy of the logic
const TEMPLATE_SLOTS = {
  'book.png': [
    { x: 466, y: 143,  w: 1371, h: 1372 },
    { x: 466, y: 1623, w: 1371, h: 1373 },
    { x: 466, y: 3104, w: 1371, h: 1372 },
  ],
};

function isPlaceholderPixel(r, g, b, fileName) {
  const isSkyBlue = (
    r >= 95 && r <= 242 &&
    g >= 175 && g <= 252 &&
    b >= 200 && b <= 255 &&
    b > r + 5 &&
    b > g - 15
  );
  const isCloud = (
    r >= 200 && r <= 255 &&
    g >= 200 && g <= 255 &&
    b >= 200 && b <= 255 &&
    b >= r - 4 &&
    b >= g - 4 &&
    Math.abs(r - g) <= 15 &&
    Math.abs(g - b) <= 15
  );
  const isGreenHills = (
    g >= 110 && g <= 255 &&
    r >= 50 && r <= 240 &&
    b >= 0 && b <= 235 &&
    g > r - 5 &&
    g > b + 10
  );

  if (fileName === 'book.png') {
    return isSkyBlue || isCloud;
  }
  return isSkyBlue || isCloud || isGreenHills;
}

function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sWidth = img.width;
  let sHeight = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / targetRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

async function testRender() {
  const templateImg = await loadImage("public/tumpul's-photoboth/book.png");
  
  // Create a dummy photo (4:3) with a solid red color to see it clearly
  const photoCanvas = createCanvas(640, 480);
  const pCtx = photoCanvas.getContext('2d');
  pCtx.fillStyle = '#ff0000'; // Red photo
  pCtx.fillRect(0, 0, 640, 480);
  pCtx.fillStyle = '#ffffff';
  pCtx.font = '50px Arial';
  pCtx.fillText('PHOTO', 200, 240);
  
  const canvas = createCanvas(templateImg.width, templateImg.height);
  const ctx = canvas.getContext('2d');
  
  const slots = TEMPLATE_SLOTS['book.png'];
  
  // Step 1: Draw photos
  for (const slot of slots) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(slot.x, slot.y, slot.w, slot.h);
    ctx.clip();
    drawImageCover(ctx, photoCanvas, slot.x, slot.y, slot.w, slot.h);
    ctx.restore();
  }
  
  // Step 2: Template
  const offscreen = createCanvas(templateImg.width, templateImg.height);
  const offCtx = offscreen.getContext('2d');
  offCtx.drawImage(templateImg, 0, 0);
  
  offCtx.globalCompositeOperation = 'destination-out';
  for (const slot of slots) {
    offCtx.fillStyle = 'rgba(0,0,0,1)';
    offCtx.fillRect(slot.x, slot.y, slot.w, slot.h);
  }
  offCtx.globalCompositeOperation = 'source-over';
  
  const origCanvas = createCanvas(templateImg.width, templateImg.height);
  const origCtx = origCanvas.getContext('2d');
  origCtx.drawImage(templateImg, 0, 0);
  
  for (const slot of slots) {
    const sx = Math.max(0, slot.x);
    const sy = Math.max(0, slot.y);
    const sw = Math.min(offscreen.width - sx, slot.w);
    const sh = Math.min(offscreen.height - sy, slot.h);
    
    const origData = origCtx.getImageData(sx, sy, sw, sh);
    const orig = origData.data;
    
    const restore = offCtx.createImageData(sw, sh);
    const dst = restore.data;
    
    for (let i = 0; i < orig.length; i += 4) {
      const r = orig[i], g = orig[i+1], b = orig[i+2], a = orig[i+3];
      if (a > 0 && !isPlaceholderPixel(r, g, b, 'book.png')) {
        dst[i]   = r;
        dst[i+1] = g;
        dst[i+2] = b;
        dst[i+3] = a;
      }
    }
    offCtx.putImageData(restore, sx, sy);
  }
  
  ctx.drawImage(offscreen, 0, 0);
  
  const out = fs.createWriteStream('test-render.png');
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  
  out.on('finish', () => console.log('Rendered test-render.png successfully!'));
}

testRender().catch(console.error);
