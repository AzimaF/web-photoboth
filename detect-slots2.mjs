/**
 * Fast slot detection using row-column projection.
 * For each row, checks if the majority of pixels are sky-blue.
 * Groups consecutive rows to find slot vertical ranges.
 * Then for each slot, finds horizontal extents.
 */

import fs from 'fs';
import path from 'path';
import { Jimp } from 'jimp';

const templateDir = path.join(process.cwd(), 'public', "tumpul's-photoboth");

// Sky blue color of placeholder areas
function isSkyBlue(r, g, b) {
  return (
    r >= 100 && r <= 220 &&
    g >= 170 && g <= 245 &&
    b >= 200 && b <= 255 &&
    b >= r - 20 &&
    g >= r - 10
  );
}

async function findSlotsForFile(file) {
  const imgPath = path.join(templateDir, file);
  const image = await Jimp.read(imgPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  // Step 1: For each row, count sky-blue pixels (sample every 4 pixels for speed)
  const rowBlueCount = new Int32Array(height);
  const step = 4;
  
  for (let y = 0; y < height; y++) {
    let count = 0;
    for (let x = 0; x < width; x += step) {
      const hex = image.getPixelColor(x, y);
      const r = (hex >>> 24) & 255;
      const g = (hex >>> 16) & 255;
      const b = (hex >>> 8) & 255;
      if (isSkyBlue(r, g, b)) count++;
    }
    rowBlueCount[y] = count;
  }
  
  // Threshold: row has significant sky-blue if count > width/(step*5)
  const threshold = Math.max(5, width / (step * 8));
  
  // Step 2: Find vertical ranges where rows have significant sky-blue pixels
  const slotRanges = [];
  let inSlot = false;
  let slotStart = 0;
  
  for (let y = 0; y < height; y++) {
    const hasBlue = rowBlueCount[y] > threshold;
    if (hasBlue && !inSlot) {
      inSlot = true;
      slotStart = y;
    } else if (!hasBlue && inSlot) {
      inSlot = false;
      const slotH = y - slotStart;
      if (slotH > 50) { // Minimum height for a slot
        slotRanges.push({ y: slotStart, h: slotH });
      }
    }
  }
  if (inSlot) {
    const slotH = height - slotStart;
    if (slotH > 50) slotRanges.push({ y: slotStart, h: slotH });
  }
  
  // Step 3: For each vertical range, find horizontal extents by checking middle row
  const slots = [];
  for (const range of slotRanges) {
    const midY = range.y + Math.floor(range.h / 2);
    let minX = width, maxX = 0;
    
    for (let x = 0; x < width; x++) {
      const hex = image.getPixelColor(x, midY);
      const r = (hex >>> 24) & 255;
      const g = (hex >>> 16) & 255;
      const b = (hex >>> 8) & 255;
      if (isSkyBlue(r, g, b)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    
    if (maxX > minX && (maxX - minX) > 100) {
      slots.push({
        x: minX,
        y: range.y,
        w: maxX - minX,
        h: range.h
      });
    }
  }
  
  return { slots, width, height };
}

// Merge slots that are very close vertically (within 20px gap)
function mergeCloseSlots(slots) {
  if (slots.length === 0) return slots;
  const merged = [{ ...slots[0] }];
  for (let i = 1; i < slots.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = slots[i];
    const gap = cur.y - (prev.y + prev.h);
    if (gap < 20) {
      // Merge
      const newMaxY = Math.max(prev.y + prev.h, cur.y + cur.h);
      prev.x = Math.min(prev.x, cur.x);
      prev.w = Math.max(prev.x + prev.w, cur.x + cur.w) - prev.x;
      prev.h = newMaxY - prev.y;
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

async function main() {
  // Process files one at a time, specify which ones
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
      const { slots: rawSlots, width, height } = await findSlotsForFile(file);
      const slots = mergeCloseSlots(rawSlots);
      console.log(`  Image: ${width} x ${height}`);
      console.log(`  Found ${slots.length} slots:`);
      for (const s of slots) {
        console.log(`    { x: ${s.x}, y: ${s.y}, w: ${s.w}, h: ${s.h} }`);
      }
      results[file] = slots;
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      console.error(e.stack);
    }
  }
  
  console.log('\n--- JSON ---');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
