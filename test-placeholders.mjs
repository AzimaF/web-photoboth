import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

function isSkyBlue(r, g, b) {
  return (
    r >= 95 && r <= 242 &&
    g >= 175 && g <= 252 &&
    b >= 200 && b <= 255 &&
    b > r + 5 &&
    b > g - 15
  );
}

function isCloud(r, g, b) {
  return (
    r >= 200 && r <= 255 &&
    g >= 200 && g <= 255 &&
    b >= 200 && b <= 255 &&
    b >= r - 4 &&
    b >= g - 4 &&
    Math.abs(r - g) <= 15 &&
    Math.abs(g - b) <= 15
  );
}

async function testPlaceholders() {
  const img = await loadImage("public/tumpul's-photoboth/book.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  let skyBlueCount = 0;
  let cloudCount = 0;
  
  // Create an output where red is sky blue, green is cloud, black is neither
  const outData = ctx.createImageData(img.width, img.height);
  const out = outData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    
    out[i+3] = 255;
    
    if (isSkyBlue(r, g, b)) {
      skyBlueCount++;
      out[i] = 255; // Red
    } else if (isCloud(r, g, b)) {
      cloudCount++;
      out[i+1] = 255; // Green
    } else {
      out[i] = r; out[i+1] = g; out[i+2] = b; // Keep original
    }
  }
  
  console.log(`Sky blue pixels: ${skyBlueCount}`);
  console.log(`Cloud/White pixels: ${cloudCount}`);
  
  ctx.putImageData(outData, 0, 0);
  
  const outStream = fs.createWriteStream('placeholder-map.png');
  canvas.createPNGStream().pipe(outStream);
  
  outStream.on('finish', () => console.log('Saved placeholder-map.png'));
}

testPlaceholders().catch(console.error);
