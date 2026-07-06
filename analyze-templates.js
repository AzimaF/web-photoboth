import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const templateDir = path.join(process.cwd(), 'public', "tumpul's-photoboth");

function isGreen(r, g, b, a) {
  // Check if pixel is predominantly green or transparent
  if (a < 50) return true; // transparent
  return g > 150 && r < 100 && b < 100 && a > 100;
}

async function analyze() {
  const files = fs.readdirSync(templateDir).filter(f => f.endsWith('.png'));
  
  const results = {};

  for (const file of files) {
    console.log(`Analyzing ${file}...`);
    const imgPath = path.join(templateDir, file);
    try {
      const image = await Jimp.read(imgPath);
      
      const width = image.bitmap.width;
      const height = image.bitmap.height;
      
      // Find bounding boxes of green regions
      // A simple clustering: scan line by line, if we find a green pixel, trace its bounding box
      const visited = new Uint8Array(width * height);
      const boxes = [];
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (visited[idx]) continue;
          
          const hex = image.getPixelColor(x, y);
          const r = (hex >>> 24) & 255;
          const g = (hex >>> 16) & 255;
          const b = (hex >>> 8) & 255;
          
          if (g > r + 30 && g > b + 30) {
            // Count this as a "green" pixel and log the first one we find
            if (!visited[0]) {
               console.log(`Found a green pixel: R=${r} G=${g} b=${b}`);
               visited[0] = 1;
            }
          }
            
            // Only consider reasonably sized boxes to avoid noise
            if ((maxX - minX) > 50 && (maxY - minY) > 50) {
              boxes.push({
                x: minX,
                y: minY,
                width: maxX - minX + 1,
                height: maxY - minY + 1
              });
            }
          } else {
            visited[idx] = 1; // Mark non-green as visited
          }
        }
      }
      
      // Sort boxes top-to-bottom, left-to-right
      boxes.sort((a, b) => {
        if (Math.abs(a.y - b.y) > 20) return a.y - b.y;
        return a.x - b.x;
      });
      
      results[file] = {
        width, height,
        boxes
      };
      
      console.log(`  Found ${boxes.length} photo slots`);
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }
  
  console.log(JSON.stringify(results, null, 2));
}

analyze();
