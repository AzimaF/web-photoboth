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

async function findSkyBlueBounds() {
  const img = await loadImage("public/tumpul's-photoboth/book.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  let minX = img.width, maxX = 0;
  let minY = img.height, maxY = 0;
  
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      
      if (isSkyBlue(r, g, b)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  console.log(`Sky blue bounds: x=${minX}, y=${minY}, w=${maxX - minX}, h=${maxY - minY}`);
}

findSkyBlueBounds().catch(console.error);
