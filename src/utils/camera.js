/**
 * Camera utility functions for accessing webcam and capturing frames
 */

/**
 * Request camera access and return the media stream
 * @param {Object} options - Camera options
 * @param {string} options.facingMode - 'user' for front camera, 'environment' for back
 * @returns {Promise<MediaStream>}
 */
export async function startCamera(options = {}) {
  const { facingMode = 'user' } = options;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        aspectRatio: { ideal: 16 / 9 },
      },
      audio: false,
    });
    return stream;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      throw new Error('Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.');
    } else if (error.name === 'NotFoundError') {
      throw new Error('Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.');
    } else if (error.name === 'NotReadableError') {
      throw new Error('Kamera sedang digunakan oleh aplikasi lain.');
    }
    throw new Error('Gagal mengakses kamera: ' + error.message);
  }
}

/**
 * Stop all tracks in a media stream
 * @param {MediaStream} stream
 */
export function stopCamera(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

/**
 * Capture a frame from a video element
 * @param {HTMLVideoElement} videoElement
 * @param {number} width - Output width
 * @param {number} height - Output height
 * @returns {string} - Data URL of the captured frame
 */
export function captureFrame(videoElement, outputWidth = 640, outputHeight = 480) {
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');

  // Mirror the image (for front camera selfie effect)
  ctx.translate(outputWidth, 0);
  ctx.scale(-1, 1);

  // Use object-fit: cover logic to avoid distortion
  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;
  
  if (videoWidth && videoHeight) {
    const videoRatio = videoWidth / videoHeight;
    const outputRatio = outputWidth / outputHeight;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = videoWidth;
    let sourceHeight = videoHeight;

    if (videoRatio > outputRatio) {
      // Video is wider -> crop sides
      sourceWidth = videoHeight * outputRatio;
      sourceX = (videoWidth - sourceWidth) / 2;
    } else {
      // Video is taller -> crop top/bottom
      sourceHeight = videoWidth / outputRatio;
      sourceY = (videoHeight - sourceHeight) / 2;
    }

    ctx.drawImage(
      videoElement,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, outputWidth, outputHeight
    );
  } else {
    // Fallback if metadata not loaded
    ctx.drawImage(videoElement, 0, 0, outputWidth, outputHeight);
  }

  return canvas.toDataURL('image/png', 0.9);
}

/**
 * Check if camera is supported in the browser
 * @returns {boolean}
 */
export function isCameraSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
