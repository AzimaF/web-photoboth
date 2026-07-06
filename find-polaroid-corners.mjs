import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

// A strict check for the sky blue color inside the polaroid photo area
function isSkyBlue(r, g, b) {
  return r >= 100 && r <= 245 && g >= 180 && g <= 255 && b >= 200 && b <= 255 && b > r + 10 && b > g - 10;
}

async function findCorners() {
  const img = await loadImage("public/tumpul's-photoboth/polaroid.png");
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;
  
  // We'll just look at the first slot area: y from 0 to 1500
  // Find all sky blue pixels
  const pixels = [];
  for (let y = 0; y < 1500; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      if (a > 0 && isSkyBlue(r, g, b)) {
        pixels.push({ x, y });
      }
    }
  }
  
  if (pixels.length === 0) {
    console.log("No sky blue pixels found!");
    return;
  }
  
  // Find top, bottom, left, right most pixels
  let top = pixels[0], bottom = pixels[0], left = pixels[0], right = pixels[0];
  for (const p of pixels) {
    if (p.y < top.y) top = p;
    if (p.y > bottom.y) bottom = p;
    if (p.x < left.x) left = p;
    if (p.x > right.x) right = p;
  }
  
  console.log(`Topmost pixel: x=${top.x}, y=${top.y}`);
  console.log(`Bottommost pixel: x=${bottom.x}, y=${bottom.y}`);
  console.log(`Leftmost pixel: x=${left.x}, y=${left.y}`);
  console.log(`Rightmost pixel: x=${right.x}, y=${right.y}`);
  
  // Calculate width, height, and angle
  // Assuming the photo area is a tilted rectangle:
  // The distance between topmost and rightmost is the top edge
  const dxTop = right.x - top.x;
  const dyTop = right.y - top.y;
  const width = Math.sqrt(dxTop*dxTop + dyTop*dyTop);
  const angleRad = Math.atan2(dyTop, dxTop);
  const angleDeg = angleRad * 180 / Math.PI;
  
  // Distance between rightmost and bottommost is the right edge (height)
  const dxRight = bottom.x - right.x;
  const dyRight = bottom.y - right.y;
  const height = Math.sqrt(dxRight*dxRight + dyRight*dyRight);
  
  console.log(`Calculated Width: ${width.toFixed(2)}`);
  console.log(`Calculated Height: ${height.toFixed(2)}`);
  console.log(`Calculated Angle: ${angleDeg.toFixed(2)} degrees`);
  
  // Calculate the center
  const cx = (left.x + right.x) / 2;
  const cy = (top.y + bottom.y) / 2;
  console.log(`Center: x=${cx.toFixed(2)}, y=${cy.toFixed(2)}`);
}

findCorners().catch(console.error);
