/**
 * Detect FULL placeholder slot boundaries in template images.
 * 
 * Strategy: For each row, count pixels matching the placeholder palette
 * (sky blue, clouds, OR green hills). Consecutive rows with high counts
 * define a photo slot.
 * 
 * This gives the COMPLETE slot boundary including both sky AND hills.
 */

import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const templateDir = path.join(process.cwd(), 'public', "tumpul's-photoboth");

function isPlaceholderPixel(r, g, b) {
  // Sky blue gradient
  const isSkyBlue = (
    r >= 95 && r <= 210 &&
    g >= 175 && g <= 248 &&
    b >= 205 && b <= 255 &&
    b > r + 10 &&
    g >= r
  );

  // White / very-light clouds
  const isCloud = (
    r >= 215 && r <= 255 &&
    g >= 225 && g <= 255 &&
    b >= 225 && b <= 255 &&
    Math.abs(r - g) <= 35 &&
    Math.abs(g - b) <= 35
  );

  // Green hills (various shades)
  const isGreenHills = (
    g >= 115 && g <= 225 &&
    r >= 65 && r <= 200 &&
    b >= 25 && b <= 140 &&
    g > r + 18 &&
    g > b + 18
  );

  return isSkyBlue || isCloud || isGreenHills;
}

async function detectSlots(file) {
  const imgPath = path.join(templateDir, file);
  const image = await Jimp.read(imgPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  const step = 3; // sample every 3 pixels for better accuracy
  const threshold = width / (step * 6); // minimum blue/green pixels in a row
  
  // Step 1: For each row, count placeholder pixels
  const rowCounts = new Int32Array(height);
  for (let y = 0; y < height; y++) {
    let count = 0;
    for (let x = 0; x < width; x += step) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >>> 24) & 255;
      const g = (hex >>> 16) & 255;
      const b = (hex >>> 8) & 255;
      if (isPlaceholderPixel(r, g, b)) count++;
    }
    rowCounts[y] = count;
  }
  
  // Step 2: Find vertical slot ranges
  const slotRanges = [];
  let inSlot = false;
  let slotStart = 0;
  const minGap = 20; // minimum gap between slots
  
  for (let y = 0; y < height; y++) {
    const hasPlaceholder = rowCounts[y] > threshold;
    if (hasPlaceholder && !inSlot) {
      inSlot = true;
      slotStart = y;
    } else if (!hasPlaceholder && inSlot) {
      const slotH = y - slotStart;
      if (slotH > 100) {
        slotRanges.push({ y: slotStart, h: slotH });
      }
      inSlot = false;
    }
  }
  if (inSlot) {
    const slotH = height - slotStart;
    if (slotH > 100) slotRanges.push({ y: slotStart, h: slotH });
  }
  
  // Step 3: For each slot range, find horizontal extent using mid-row scan
  const slots = [];
  for (const range of slotRanges) {
    // Try multiple rows and take the widest extent
    let minX = width, maxX = 0;
    
    const sampleRows = [
      Math.floor(range.y + range.h * 0.2),
      Math.floor(range.y + range.h * 0.5),
      Math.floor(range.y + range.h * 0.8),
    ];
    
    for (const midY of sampleRows) {
      for (let x = 0; x < width; x++) {
        const hex = image.getPixelColor(x, midY);
        const r = (hex >>> 24) & 255;
        const g = (hex >>> 16) & 255;
        const b = (hex >>> 8) & 255;
        if (isPlaceholderPixel(r, g, b)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }
    
    if (maxX > minX && (maxX - minX) > 100) {
      slots.push({
        x: minX,
        y: range.y,
        w: maxX - minX + 1,
        h: range.h
      });
    }
  }
  
  return { slots, width, height };
}

async function main() {
  const targetFile = process.argv[2];
  let files;
  
  if (targetFile) {
    files = [targetFile];
  } else {
    files = fs.readdirSync(templateDir).filter(f => f.endsWith('.png'));
  }
  
  const results = {};
  
  for (const file of files) {
    console.log(`\nAnalyzing ${file}...`);
    try {
      const { slots, width, height } = await detectSlots(file);
      console.log(`  Image: ${width} x ${height}`);
      console.log(`  Found ${slots.length} slots:`);
      for (const s of slots) {
        console.log(`    { x: ${s.x}, y: ${s.y}, w: ${s.w}, h: ${s.h} }  [y_end: ${s.y + s.h}]`);
      }
      results[file] = slots;
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
  }
  
  console.log('\n--- TEMPLATE_SLOTS ---');
  for (const [file, slots] of Object.entries(results)) {
    console.log(`  '${file}': [`);
    for (const s of slots) {
      console.log(`    { x: ${s.x}, y: ${s.y}, w: ${s.w}, h: ${s.h} },`);
    }
    console.log(`  ],`);
  }
}

main().catch(console.error);
