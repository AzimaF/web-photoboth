/**
 * Template renderer utility for compositing photos into photobooth templates
 * Uses Canvas API for rendering
 */

// Template configurations
export const TEMPLATES = [
  {
    id: 'tumpul-classic',
    name: 'Classic',
    description: 'Strip Klasik',
    icon: '📸',
    bgColor: '#F5F0E8',
    layout: 'custom',
    image: `${import.meta.env.BASE_URL}tumpul's-photoboth/clasic.png`
  },
  {
    id: 'tumpul-film',
    name: 'Film',
    description: 'Gaya Film',
    icon: '🎞️',
    bgColor: '#F5F0E8',
    layout: 'custom',
    image: `${import.meta.env.BASE_URL}tumpul's-photoboth/film.png`
  },
  {
    id: 'tumpul-minimalist',
    name: 'Minimalist',
    description: 'Desain Minimalis',
    icon: '⬜',
    bgColor: '#8B0000',
    layout: 'custom',
    image: `${import.meta.env.BASE_URL}tumpul's-photoboth/minimalist.png`
  },
  {
    id: 'tumpul-neon',
    name: 'Neon',
    description: 'Efek Neon',
    icon: '✨',
    bgColor: '#0D1B3E',
    layout: 'custom',
    image: `${import.meta.env.BASE_URL}tumpul's-photoboth/neon.png`
  },
  {
    id: 'tumpul-polaroid',
    name: 'Polaroid',
    description: 'Gaya Polaroid',
    icon: '🖼️',
    bgColor: '#C1603A',
    layout: 'custom',
    image: `${import.meta.env.BASE_URL}tumpul's-photoboth/polaroid.png`
  },
  {
    id: 'tumpul-retro',
    name: 'Retro',
    description: 'Tema Retro',
    icon: '📼',
    bgColor: '#F2A06E',
    layout: 'custom',
    image: `${import.meta.env.BASE_URL}tumpul's-photoboth/retro.png`
  },
  {
    id: 'tumpul-book',
    name: 'Book',
    description: 'Gaya Buku',
    icon: '📖',
    bgColor: '#FFFFFF',
    layout: 'custom',
    photoCount: 3,
    image: `${import.meta.env.BASE_URL}tumpul's-photoboth/book.png`
  },
];

/**
 * Load an image from a data URL
 * @param {string} src - Image source (data URL or URL)
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Draw rounded rectangle on canvas
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draw image with object-fit: cover logic to avoid stretching
 */
function drawImageCover(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sWidth = img.width;
  let sHeight = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    // Image is wider -> crop sides
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    // Image is taller -> crop top/bottom
    sHeight = img.width / targetRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

/**
 * Draw a star shape
 */
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Render Classic Strip template
 */
async function renderClassicStrip(canvas, photos, template) {
  const ctx = canvas.getContext('2d');
  const padding = 30;
  const photoGap = 15;
  const photoWidth = 400;
  const photoHeight = 300;
  const bottomSpace = 80;

  canvas.width = photoWidth + padding * 2;
  canvas.height = (photoHeight * 4) + (photoGap * 3) + padding * 2 + bottomSpace;

  // Background
  ctx.fillStyle = template.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = template.accentColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  // Photos
  for (let i = 0; i < Math.min(photos.length, 4); i++) {
    const img = await loadImage(photos[i]);
    const y = padding + i * (photoHeight + photoGap);
    drawImageCover(ctx, img, padding, y, photoWidth, photoHeight);

    // Subtle border around each photo
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding, y, photoWidth, photoHeight);
  }

  // Bottom text
  ctx.fillStyle = template.accentColor;
  ctx.font = 'bold 18px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PHOTOBOOTH', canvas.width / 2, canvas.height - bottomSpace + 30);

  const now = new Date();
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = '#808080';
  ctx.fillText(now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), canvas.width / 2, canvas.height - bottomSpace + 55);
}

/**
 * Render Polaroid Grid template
 */
async function renderPolaroidGrid(canvas, photos, template) {
  const ctx = canvas.getContext('2d');
  const padding = 40;
  const gap = 20;
  const photoSize = 280;
  const polaroidPadding = 15;
  const polaroidBottom = 50;

  const totalPhotoW = photoSize + polaroidPadding * 2;
  const totalPhotoH = photoSize + polaroidPadding + polaroidBottom;

  canvas.width = totalPhotoW * 2 + gap + padding * 2;
  canvas.height = totalPhotoH * 2 + gap + padding * 2 + 60;

  // Background
  ctx.fillStyle = template.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative pattern
  ctx.fillStyle = 'rgba(51, 68, 255, 0.03)';
  for (let i = 0; i < canvas.width; i += 20) {
    for (let j = 0; j < canvas.height; j += 20) {
      ctx.fillRect(i, j, 1, 1);
    }
  }

  const rotations = [-3, 2, 1, -2];

  for (let i = 0; i < Math.min(photos.length, 4); i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = padding + col * (totalPhotoW + gap);
    const y = padding + row * (totalPhotoH + gap);
    const rotation = (rotations[i] * Math.PI) / 180;

    ctx.save();
    ctx.translate(x + totalPhotoW / 2, y + totalPhotoH / 2);
    ctx.rotate(rotation);

    // Polaroid shadow
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    // Polaroid frame
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-totalPhotoW / 2, -totalPhotoH / 2, totalPhotoW, totalPhotoH);
    ctx.shadowColor = 'transparent';

    // Photo
    const img = await loadImage(photos[i]);
    drawImageCover(
      ctx,
      img,
      -totalPhotoW / 2 + polaroidPadding,
      -totalPhotoH / 2 + polaroidPadding,
      photoSize,
      photoSize
    );

    ctx.restore();
  }

  // Bottom branding
  ctx.fillStyle = template.accentColor;
  ctx.font = 'bold 20px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📸 PHOTOBOOTH', canvas.width / 2, canvas.height - 30);
}

/**
 * Render Retro Film template
 */
async function renderRetroFilm(canvas, photos, template) {
  const ctx = canvas.getContext('2d');
  const photoWidth = 380;
  const photoHeight = 280;
  const sprocketSize = 20;
  const gap = 10;
  const filmPadding = 50;

  canvas.width = photoWidth + filmPadding * 2;
  canvas.height = (photoHeight + gap) * 4 + filmPadding * 2 + 60;

  // Film background
  ctx.fillStyle = template.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Film border strips
  ctx.fillStyle = '#2D2D44';
  ctx.fillRect(0, 0, filmPadding - 10, canvas.height);
  ctx.fillRect(canvas.width - filmPadding + 10, 0, filmPadding - 10, canvas.height);

  // Sprocket holes
  ctx.fillStyle = template.bgColor;
  for (let y = 20; y < canvas.height; y += 40) {
    // Left sprocket
    roundRect(ctx, 10, y, sprocketSize, sprocketSize * 0.6, 3);
    ctx.fill();
    // Right sprocket
    roundRect(ctx, canvas.width - 30, y, sprocketSize, sprocketSize * 0.6, 3);
    ctx.fill();
  }

  // Photos
  for (let i = 0; i < Math.min(photos.length, 4); i++) {
    const img = await loadImage(photos[i]);
    const y = filmPadding + i * (photoHeight + gap);

    // Photo area glow
    ctx.shadowColor = template.accentColor;
    ctx.shadowBlur = 8;
    drawImageCover(ctx, img, filmPadding, y, photoWidth, photoHeight);
    ctx.shadowColor = 'transparent';

    // Frame number
    ctx.fillStyle = template.accentColor;
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${i + 1}A`, filmPadding + 5, y + photoHeight - 5);
  }

  // Film text
  ctx.fillStyle = template.accentColor;
  ctx.font = 'bold 16px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ PHOTOBOOTH FILM ★', canvas.width / 2, canvas.height - 30);
}

/**
 * Render Neon Glow template
 */
async function renderNeonGlow(canvas, photos, template) {
  const ctx = canvas.getContext('2d');
  const padding = 40;
  const photoWidth = 380;
  const photoHeight = 280;
  const gap = 25;
  const neonWidth = 4;

  canvas.width = photoWidth + padding * 2;
  canvas.height = (photoHeight + gap) * 4 + padding * 2 + 80;

  // Dark background
  ctx.fillStyle = template.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(204, 255, 0, 0.03)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < canvas.width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Photos with neon border
  for (let i = 0; i < Math.min(photos.length, 4); i++) {
    const img = await loadImage(photos[i]);
    const y = padding + i * (photoHeight + gap);

    // Outer neon glow
    ctx.shadowColor = template.accentColor;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = template.accentColor;
    ctx.lineWidth = neonWidth;
    roundRect(ctx, padding - 5, y - 5, photoWidth + 10, photoHeight + 10, 8);
    ctx.stroke();

    // Inner glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#CCFF00';
    roundRect(ctx, padding - 2, y - 2, photoWidth + 4, photoHeight + 4, 6);
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    // Photo
    ctx.save();
    roundRect(ctx, padding, y, photoWidth, photoHeight, 4);
    ctx.clip();
    drawImageCover(ctx, img, padding, y, photoWidth, photoHeight);
    ctx.restore();
  }

  // Neon text
  ctx.shadowColor = template.accentColor;
  ctx.shadowBlur = 15;
  ctx.fillStyle = template.accentColor;
  ctx.font = 'bold 24px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦ PHOTOBOOTH ✦', canvas.width / 2, canvas.height - 40);
  ctx.shadowColor = 'transparent';

  const now = new Date();
  ctx.fillStyle = 'rgba(204, 255, 0, 0.5)';
  ctx.font = '12px Inter, sans-serif';
  ctx.fillText(now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), canvas.width / 2, canvas.height - 18);
}

/**
 * Render Minimalist template
 */
async function renderMinimalist(canvas, photos, template) {
  const ctx = canvas.getContext('2d');
  const margin = 50;
  const photoWidth = 360;
  const photoHeight = 270;
  const gap = 20;

  canvas.width = photoWidth + margin * 2;
  canvas.height = (photoHeight + gap) * 4 + margin * 2 + 70;

  // Clean white background
  ctx.fillStyle = template.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top line accent
  ctx.fillStyle = '#E0E0DC';
  ctx.fillRect(margin, margin - 15, photoWidth, 2);

  // Photos
  for (let i = 0; i < Math.min(photos.length, 4); i++) {
    const img = await loadImage(photos[i]);
    const y = margin + i * (photoHeight + gap);

    // Subtle shadow
    ctx.shadowColor = 'rgba(0,0,0,0.06)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;

    // Photo with rounded corners
    ctx.save();
    roundRect(ctx, margin, y, photoWidth, photoHeight, 12);
    ctx.clip();
    drawImageCover(ctx, img, margin, y, photoWidth, photoHeight);
    ctx.restore();

    ctx.shadowColor = 'transparent';
  }

  // Bottom line
  ctx.fillStyle = '#E0E0DC';
  const bottomY = margin + 4 * (photoHeight + gap) + 10;
  ctx.fillRect(margin, bottomY, photoWidth, 2);

  // Minimal text
  ctx.fillStyle = '#808080';
  ctx.font = '300 14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('photobooth', canvas.width / 2, canvas.height - 40);

  const now = new Date();
  ctx.font = '300 11px Inter, sans-serif';
  ctx.fillText(now.toLocaleDateString('id-ID'), canvas.width / 2, canvas.height - 22);
}

/**
 * Render Party Frame template
 */
async function renderPartyFrame(canvas, photos, template) {
  const ctx = canvas.getContext('2d');
  const padding = 40;
  const photoWidth = 380;
  const photoHeight = 280;
  const gap = 20;

  canvas.width = photoWidth + padding * 2;
  canvas.height = (photoHeight + gap) * 4 + padding * 2 + 100;

  // Lime background
  ctx.fillStyle = template.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Confetti decoration
  const confettiColors = ['#3344FF', '#FF3366', '#FF9933', '#33CC99', '#9933FF', '#1A1A2E'];
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 8 + 3;
    const rotation = Math.random() * Math.PI;
    const colorIndex = Math.floor(Math.random() * confettiColors.length);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = confettiColors[colorIndex];

    if (Math.random() > 0.5) {
      ctx.fillRect(-size / 2, -size / 4, size, size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Stars
  drawStar(ctx, 50, 50, 8, 25, 12, template.accentColor);
  drawStar(ctx, canvas.width - 50, 80, 6, 20, 10, '#FF3366');
  drawStar(ctx, 80, canvas.height - 120, 5, 18, 8, template.accentColor);
  drawStar(ctx, canvas.width - 60, canvas.height - 150, 7, 22, 11, '#FF9933');

  // Photos with fun borders
  for (let i = 0; i < Math.min(photos.length, 4); i++) {
    const img = await loadImage(photos[i]);
    const y = padding + i * (photoHeight + gap);

    // White border
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 10;
    roundRect(ctx, padding - 8, y - 8, photoWidth + 16, photoHeight + 16, 12);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Photo
    ctx.save();
    roundRect(ctx, padding, y, photoWidth, photoHeight, 8);
    ctx.clip();
    drawImageCover(ctx, img, padding, y, photoWidth, photoHeight);
    ctx.restore();

    // Blue accent corners
    ctx.fillStyle = template.accentColor;
    ctx.fillRect(padding - 8, y - 8, 20, 4);
    ctx.fillRect(padding - 8, y - 8, 4, 20);
    ctx.fillRect(padding + photoWidth - 12, y - 8, 20, 4);
    ctx.fillRect(padding + photoWidth + 4, y - 8, 4, 20);
  }

  // Party text
  ctx.fillStyle = template.accentColor;
  ctx.font = 'bold 26px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎉 PARTY BOOTH 🎉', canvas.width / 2, canvas.height - 55);

  const now = new Date();
  ctx.fillStyle = '#1A1A2E';
ctx.font = 'bold 13px Inter, sans-serif';
  ctx.fillText(now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), canvas.width / 2, canvas.height - 30);
}

// Per-template slot coordinates — FULL placeholder bounds (sky + clouds + green hills)
// Calibrated to align perfectly with the inner borders of the frames, ignoring margins
export const TEMPLATE_SLOTS = {
  'clasic.png': [
    { x: 736, y: 77,   w: 858, h: 1295 },
    { x: 736, y: 1467, w: 858, h: 1295 },
    { x: 736, y: 2857, w: 858, h: 1295 },
    { x: 736, y: 4247, w: 858, h: 1295 },
  ],
  'film.png': [
    { x: 661, y: 0,    w: 1021, h: 1397 },
    { x: 661, y: 1417, w: 1021, h: 1375 },
    { x: 661, y: 2812, w: 1021, h: 1406 },
    { x: 661, y: 4218, w: 1021, h: 1387 },
  ],
  'minimalist.png': [
    { x: 618, y: 98,   w: 984, h: 1246 },
    { x: 618, y: 1458, w: 984, h: 1246 },
    { x: 618, y: 2818, w: 984, h: 1246 },
    { x: 618, y: 4178, w: 984, h: 1246 },
  ],
  'neon.png': [
    { x: 736, y: 77,   w: 858, h: 1295 },
    { x: 736, y: 1467, w: 858, h: 1295 },
    { x: 736, y: 2857, w: 858, h: 1295 },
    { x: 736, y: 4247, w: 858, h: 1295 },
  ],
  'polaroid.png': [
    { x: 525, y: 257,  w: 996, h: 890 },
    { x: 525, y: 1562, w: 996, h: 890 },
    { x: 525, y: 2867, w: 996, h: 890 },
    { x: 525, y: 4172, w: 996, h: 890 },
  ],
  'retro.png': [
    { x: 736, y: 77,   w: 858, h: 1295 },
    { x: 736, y: 1467, w: 858, h: 1295 },
    { x: 736, y: 2857, w: 858, h: 1295 },
    { x: 736, y: 4247, w: 858, h: 1295 },
  ],
  'book.png': [
    { x: 466, y: 143,  w: 1371, h: 1372 },
    { x: 466, y: 1623, w: 1371, h: 1373 },
    { x: 466, y: 3104, w: 1371, h: 1372 },
  ],
};


/**
 * Check if a pixel belongs to the placeholder image (sky blue, clouds, or green hills).
 * All templates share the same placeholder artwork, so one detector works for all.
 */
export function isPlaceholderPixel(r, g, b, fileName) {
  // Sky blue gradient
  const isSkyBlue = (
    r >= 95 && r <= 242 &&
    g >= 175 && g <= 252 &&
    b >= 200 && b <= 255 &&
    b > r + 5 &&
    b > g - 15
  );

  // White / grey clouds (matches cloud pixels in polaroid and film templates without picking up cream backgrounds)
  const isCloud = (
    r >= 200 && r <= 255 &&
    g >= 200 && g <= 255 &&
    b >= 200 && b <= 255 &&
    b >= r - 4 &&
    b >= g - 4 &&
    Math.abs(r - g) <= 15 &&
    Math.abs(g - b) <= 15
  );

  // Green hills (wider limits, including saturated dark green and light yellowish transitions)
  const isGreenHills = (
    g >= 110 && g <= 255 &&
    r >= 50 && r <= 240 &&
    b >= 0 && b <= 235 &&
    g > r - 5 &&          // green is close to or dominant over red
    g > b + 10            // green is clearly dominant over blue (crucial to reject black/cream)
  );

  if (fileName === 'book.png') {
    return isSkyBlue || isCloud;
  }
  return isSkyBlue || isCloud || isGreenHills;
}



/**
 * Render Custom Template.
 *
 * Hybrid strategy:
 *   1. Draw photos filling their full slot rectangles (background).
 *   2. Draw the template on top, but FIRST punch rectangular holes for each slot so photos show through.
 *   3. Then restore non-placeholder pixels (frame borders, decorations) within each hole
 *      by selectively copying back pixels that DON'T match the placeholder palette.
 *
 * This ensures photos fully cover every placeholder pixel while preserving the frame artwork.
 */
async function renderCustomTemplate(canvas, photos, template) {
  const ctx = canvas.getContext('2d');

  const fileName = template.image.split('/').pop();
  const templateImg = await loadImage(template.image);
  canvas.width  = templateImg.width;
  canvas.height = templateImg.height;

  const slots = TEMPLATE_SLOTS[fileName];

  if (!slots || slots.length === 0) {
    ctx.drawImage(templateImg, 0, 0);
    return;
  }

  // ── Step 1: Draw photos as the background layer ───────────────────────────
  for (let i = 0; i < Math.min(photos.length, slots.length); i++) {
    const img  = await loadImage(photos[i]);
    const slot = slots[i];
    ctx.save();
    ctx.beginPath();
    ctx.rect(slot.x, slot.y, slot.w, slot.h);
    ctx.clip();
    drawImageCover(ctx, img, slot.x, slot.y, slot.w, slot.h);
    ctx.restore();
  }


  // ── Step 2: Build the template overlay ───────────────────────────────────
  // Punch rectangular holes in slot areas so photos show through,
  // then restore only non-placeholder pixels (frame borders, text, decorations)
  // back into each hole so they appear correctly on top of the photos.
  const offscreen = document.createElement('canvas');
  offscreen.width  = templateImg.width;
  offscreen.height = templateImg.height;
  const offCtx = offscreen.getContext('2d');
  offCtx.drawImage(templateImg, 0, 0);

  // Read the original template pixel data ONCE (used to restore frame borders)
  const origCanvas = document.createElement('canvas');
  origCanvas.width  = templateImg.width;
  origCanvas.height = templateImg.height;
  const origCtx = origCanvas.getContext('2d');
  origCtx.drawImage(templateImg, 0, 0);

  // Punch rectangular holes so photos show through fully
  offCtx.globalCompositeOperation = 'destination-out';
  for (const slot of slots) {
    offCtx.fillStyle = 'rgba(0,0,0,1)';
    offCtx.fillRect(slot.x, slot.y, slot.w, slot.h);
  }
  offCtx.globalCompositeOperation = 'source-over';

  // Restore non-placeholder pixels (frame borders, decorations) back on top
  for (const slot of slots) {
    const sx = Math.max(0, slot.x);
    const sy = Math.max(0, slot.y);
    const sw = Math.min(offscreen.width  - sx, slot.w);
    const sh = Math.min(offscreen.height - sy, slot.h);

    const origData = origCtx.getImageData(sx, sy, sw, sh);
    const orig = origData.data;

    // Build a new ImageData with only non-placeholder pixels visible
    const restore = new ImageData(sw, sh);
    const dst = restore.data;

    for (let i = 0; i < orig.length; i += 4) {
      const r = orig[i], g = orig[i+1], b = orig[i+2], a = orig[i+3];
      if (a > 0 && !isPlaceholderPixel(r, g, b, fileName)) {
        dst[i]   = r;
        dst[i+1] = g;
        dst[i+2] = b;
        dst[i+3] = a; // restore frame border / decoration pixel
      }
      // placeholder pixels → stay transparent (photo shows through)
    }

    offCtx.putImageData(restore, sx, sy);
  }

  // ── Step 3: Composite the template overlay on top of the photos ──────────
  ctx.drawImage(offscreen, 0, 0);
}

/**
 * Draw image with object-fit: contain logic — no cropping, adds letterbox if needed
 */
function drawImageContain(ctx, img, x, y, w, h) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let drawW, drawH, drawX, drawY;

  if (imgRatio > targetRatio) {
    // Image is wider than slot → fit by width
    drawW = w;
    drawH = w / imgRatio;
    drawX = x;
    drawY = y + (h - drawH) / 2;
  } else {
    // Image is taller than slot → fit by height
    drawH = h;
    drawW = h * imgRatio;
    drawX = x + (w - drawW) / 2;
    drawY = y;
  }

  // Fill the slot background with black first to avoid transparency gaps
  ctx.fillStyle = '#000';
  ctx.fillRect(x, y, w, h);

  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

/**
 * Main render function - routes to appropriate template renderer
 * @param {HTMLCanvasElement} canvas
 * @param {string[]} photos - Array of data URLs
 * @param {string} templateId - Template ID to use
 * @returns {Promise<void>}
 */
export async function renderTemplate(canvas, photos, templateId) {
  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error('Template not found: ' + templateId);

  // Use the custom template renderer for all tumpul templates
  if (template.layout === 'custom') {
    await renderCustomTemplate(canvas, photos, template);
  } else {
    // Fallback for any old templates if still used
    const renderers = {
      'classic-strip': renderClassicStrip,
      'polaroid-grid': renderPolaroidGrid,
      'retro-film': renderRetroFilm,
      'neon-glow': renderNeonGlow,
      'minimalist': renderMinimalist,
      'party-frame': renderPartyFrame,
    };

    const renderer = renderers[templateId];
    if (renderer) {
      await renderer(canvas, photos, template);
    }
  }
}

/**
 * Export canvas to PNG blob
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
}

/**
 * Download canvas as PNG file
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 */
export async function downloadCanvas(canvas, filename = 'photobooth.png') {
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
