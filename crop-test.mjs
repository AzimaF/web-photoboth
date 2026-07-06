import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

async function cropImage() {
  const img = await loadImage("public/tumpul's-photoboth/book.png");
  
  const canvas = createCanvas(1875, 1600); // Just top part
  const ctx = canvas.getContext('2d');
  
  // Draw the original image
  ctx.drawImage(img, 0, 0);
  
  // Draw a red line at x=466
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(466, 0);
  ctx.lineTo(466, 1600);
  ctx.stroke();
  
  const out = fs.createWriteStream('book-cropped.png');
  canvas.createPNGStream().pipe(out);
  
  out.on('finish', () => console.log('Saved book-cropped.png'));
}

cropImage().catch(console.error);
