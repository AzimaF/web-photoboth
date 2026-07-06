import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const templateDir = path.join(process.cwd(), 'public', "tumpul's-photoboth");

async function analyzeAll() {
  const files = fs.readdirSync(templateDir).filter(f => f.endsWith('.png'));
  const allLayouts = {};
  
  const isGreen = (r, g, b) => {
    // Broad green detection
    return g > r + 20 && g > b + 20 && g > 80; 
  };
  
  for (const file of files) {
    const imgPath = path.join(templateDir, file);
    const image = await Jimp.read(imgPath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // We expect 3 slots, roughly distributed vertically.
    // Let's divide the image into 3 vertical regions and find the min/max X/Y of green pixels in each.
    const regions = [
      { minY: height, maxY: 0, minX: width, maxX: 0, count: 0 },
      { minY: height, maxY: 0, minX: width, maxX: 0, count: 0 },
      { minY: height, maxY: 0, minX: width, maxX: 0, count: 0 }
    ];
    
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const hex = image.getPixelColor(x, y);
        const r = (hex >>> 24) & 255;
        const g = (hex >>> 16) & 255;
        const b = (hex >>> 8) & 255;
        
        if (isGreen(r, g, b)) {
          // Determine which region this belongs to based on Y
          let regionIdx = 0;
          if (y > height * 0.33 && y < height * 0.66) regionIdx = 1;
          else if (y >= height * 0.66) regionIdx = 2;
          
          const region = regions[regionIdx];
          region.minY = Math.min(region.minY, y);
          region.maxY = Math.max(region.maxY, y);
          region.minX = Math.min(region.minX, x);
          region.maxX = Math.max(region.maxX, x);
          region.count++;
        }
      }
    }
    
    const boxes = [];
    for (const r of regions) {
      if (r.count > 100) { // If it has a substantial amount of green
        boxes.push({
          x: r.minX,
          y: r.minY,
          w: r.maxX - r.minX,
          h: r.maxY - r.minY
        });
      }
    }
    
    allLayouts[file] = boxes;
    console.log(`Processed ${file}: found ${boxes.length} boxes`);
  }
  
  console.log('--- JSON OUTPUT ---');
  console.log(JSON.stringify(allLayouts, null, 2));
}

analyzeAll().catch(console.error);
