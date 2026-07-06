import { createCanvas, loadImage } from 'canvas';

async function checkOutput() {
  const img = await loadImage('test-render.png');
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  // Check pixel at x=500, y=1400 (inside the 1372 height, below the 1028 height)
  // At y=1400, it should be either the RED photo (#ff0000) or the GREEN hill.
  // The green hill is y=1073 to 1515.
  const p1 = ctx.getImageData(500, 1000, 1, 1).data; // Should be RED
  const p2 = ctx.getImageData(500, 1150, 1, 1).data; // Should be RED or GREEN
  const p3 = ctx.getImageData(500, 1300, 1, 1).data; // Should be RED or GREEN
  
  console.log(`p1 (500, 1000): rgba(${p1[0]}, ${p1[1]}, ${p1[2]}, ${p1[3]})`);
  console.log(`p2 (500, 1150): rgba(${p2[0]}, ${p2[1]}, ${p2[2]}, ${p2[3]})`);
  console.log(`p3 (500, 1300): rgba(${p3[0]}, ${p3[1]}, ${p3[2]}, ${p3[3]})`);
}

checkOutput().catch(console.error);
