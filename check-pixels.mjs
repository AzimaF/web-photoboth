/**
 * Check specific pixel values at known locations in template images.
 * - Template background (outside frames): usually white/cream
 * - Frame borders: black/dark
 * - Inside placeholder: sky blue, clouds, green hills
 */

import path from 'path';
import { Jimp } from 'jimp';

const templateDir = path.join(process.cwd(), 'public', "tumpul's-photoboth");

async function checkPixels(file, points) {
  const imgPath = path.join(templateDir, file);
  const image = await Jimp.read(imgPath);
  
  console.log(`\n=== ${file} ===`);
  for (const [x, y, label] of points) {
    const hex = image.getPixelColor(x, y);
    const r = (hex >>> 24) & 255;
    const g = (hex >>> 16) & 255;
    const b = (hex >>> 8) & 255;
    console.log(`  ${label}: (${x},${y}) → rgb(${r},${g},${b})`);
  }
}

async function main() {
  // clasic.png: 1875x5625, slot 1 is at x:736 y:77 w:857 h:496
  // Frame inner area: x=760, y=100 (top of sky)
  // Frame bottom: x=760, y=560 (after sky, where green hills end)
  // Background outside: x=100, y=200 (white/cream area)
  // Frame border: x=736, y=77 (the black border line)
  // Green hills area: x=760, y=400 to y=573 (bottom of slot)
  
  await checkPixels('clasic.png', [
    [760, 100, 'inside frame (sky top)'],
    [760, 300, 'inside frame (sky middle)'],
    [760, 450, 'inside frame (hills area 1)'],
    [760, 500, 'inside frame (hills area 2)'],
    [760, 540, 'inside frame (hills area 3)'],
    [760, 570, 'near bottom of detected slot (y=77+496=573)'],
    [760, 580, 'just below detected slot'],
    [760, 600, 'below detected slot'],
    [760, 650, 'further below'],
    [736, 77, 'frame border top-left corner'],
    [100, 200, 'template background outside frame'],
    [400, 200, 'template background outside frame 2'],
    [760, 77, 'top of frame inside'],
    // Verify the border thickness
    [735, 200, 'just left of frame border'],
    [736, 200, 'at frame border left edge'],
    [737, 200, 'just inside frame'],
    [1592, 200, 'at frame right edge'],
    [1593, 200, 'just outside frame right'],
  ]);
  
  // Also check where the frame actually ends vertically
  console.log('\n\nScanning clasic.png column x=760 from y=50 to y=640:');
  const imgPath = path.join(templateDir, 'clasic.png');
  const image = await Jimp.read(imgPath);
  
  for (let y = 50; y <= 640; y += 10) {
    const hex = image.getPixelColor(760, y);
    const r = (hex >>> 24) & 255;
    const g = (hex >>> 16) & 255;
    const b = (hex >>> 8) & 255;
    const isPlaceholder = (
      (r >= 95 && r <= 210 && g >= 175 && g <= 248 && b >= 205 && b <= 255 && b > r + 10 && g >= r) || // sky
      (r >= 215 && r <= 255 && g >= 225 && g <= 255 && b >= 225 && b <= 255 && Math.abs(r-g) <= 35 && Math.abs(g-b) <= 35) || // cloud
      (g >= 115 && g <= 225 && r >= 65 && r <= 200 && b >= 25 && b <= 140 && g > r + 18 && g > b + 18) // green
    );
    console.log(`  y=${y}: rgb(${r},${g},${b}) ${isPlaceholder ? '← PLACEHOLDER' : ''}`);
  }
}

main().catch(console.error);
