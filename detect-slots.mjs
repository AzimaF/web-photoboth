/**
 * Script to detect photo slot coordinates in template images.
 * Looks for the sky-blue placeholder areas (light blue background with clouds).
 * The placeholder color is approximately rgb(135-200, 200-235, 220-255) - light blue sky.
 */

import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const templateDir = path.join(process.cwd(), 'public', "tumpul's-photoboth");

/**
 * Check if pixel is the light-blue sky placeholder color
 */
function isSkyBlue(r, g, b) {
  // Sky blue: R around 135-210, G around 200-240, B around 220-255
  // Must be bluish (b > r and b > g or close)
  return (
    r >= 120 && r <= 220 &&
    g >= 185 && g <= 245 &&
    b >= 215 && b <= 255 &&
    b >= r - 10 && // blue dominant or close
    g >= r         // greenish-blue sky
  );
}

/**
 * Find bounding boxes of all sky-blue regions in an image
 * using a row/column scanning approach
 */
async function findSlots(imgPath) {
  const image = await Jimp.read(imgPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Create a mask of sky-blue pixels
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >>> 24) & 255;
      const g = (hex >>> 16) & 255;
      const b = (hex >>> 8) & 255;
      if (isSkyBlue(r, g, b)) {
        mask[y * width + x] = 1;
      }
    }
  }

  // Simple connected-component labeling
  const labels = new Int32Array(width * height);
  let nextLabel = 1;
  const regionBounds = {}; // label -> {minX, minY, maxX, maxY, count}

  function getLabel(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
    return labels[y * width + x];
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) continue;

      const above = getLabel(x, y - 1);
      const left  = getLabel(x - 1, y);

      let label;
      if (above === 0 && left === 0) {
        label = nextLabel++;
        regionBounds[label] = { minX: x, minY: y, maxX: x, maxY: y, count: 0 };
      } else if (above !== 0 && left === 0) {
        label = above;
      } else if (above === 0 && left !== 0) {
        label = left;
      } else {
        label = Math.min(above, left);
        // Merge: remap bigger label to smaller
        const bigger = Math.max(above, left);
        if (bigger !== label) {
          for (let i = 0; i < width * height; i++) {
            if (labels[i] === bigger) labels[i] = label;
          }
          // Merge bounds
          if (regionBounds[bigger] && regionBounds[label]) {
            const b = regionBounds[bigger];
            const a = regionBounds[label];
            a.minX = Math.min(a.minX, b.minX);
            a.minY = Math.min(a.minY, b.minY);
            a.maxX = Math.max(a.maxX, b.maxX);
            a.maxY = Math.max(a.maxY, b.maxY);
            a.count += b.count;
            delete regionBounds[bigger];
          }
        }
      }

      labels[y * width + x] = label;
      if (regionBounds[label]) {
        const rb = regionBounds[label];
        if (x < rb.minX) rb.minX = x;
        if (y < rb.minY) rb.minY = y;
        if (x > rb.maxX) rb.maxX = x;
        if (y > rb.maxY) rb.maxY = y;
        rb.count++;
      }
    }
  }

  // Filter to large regions (photo slots are large)
  const minArea = (width * height) / 30; // at least 1/30 of image
  const slots = [];
  for (const [label, bounds] of Object.entries(regionBounds)) {
    const w = bounds.maxX - bounds.minX;
    const h = bounds.maxY - bounds.minY;
    const area = w * h;
    if (area > minArea && w > 100 && h > 100) {
      slots.push({
        x: bounds.minX,
        y: bounds.minY,
        w: w,
        h: h,
      });
    }
  }

  // Sort top to bottom
  slots.sort((a, b) => a.y - b.y);
  return { slots, width, height };
}

async function main() {
  const files = fs.readdirSync(templateDir).filter(f => f.endsWith('.png'));
  const results = {};

  for (const file of files) {
    const imgPath = path.join(templateDir, file);
    console.log(`\nAnalyzing ${file}...`);
    try {
      const { slots, width, height } = await findSlots(imgPath);
      console.log(`  Image size: ${width} x ${height}`);
      console.log(`  Found ${slots.length} potential slots:`);
      for (const s of slots) {
        console.log(`    x:${s.x} y:${s.y} w:${s.w} h:${s.h}`);
      }
      results[file] = slots;
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
  }

  console.log('\n\n--- TEMPLATE_SLOTS JSON ---');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
