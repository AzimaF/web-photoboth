import { useState, useRef, useEffect, useCallback } from 'react';
import { renderTemplate, downloadCanvas, TEMPLATES, canvasToBlob, TEMPLATE_SLOTS, isPlaceholderPixel, loadImage } from '../utils/templateRenderer';
import './ResultPreview.css';

export default function ResultPreview({ photos, videoBlobs = [], templateId, onChangeTemplate, onRetake, onGoHome }) {
  const [isRendering, setIsRendering] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isRecordingBts, setIsRecordingBts] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  
  const canvasRef = useRef(null);
  const btsCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  
  const videoElementsRef = useRef([]);
  const animationFrameRef = useRef(null);
  
  const template = TEMPLATES.find(t => t.id === templateId);
  const fileName = template?.image.split('/').pop();
  const slots = TEMPLATE_SLOTS[fileName] || [];

  // 1. Render the static PNG photobooth strip
  useEffect(() => {
    if (canvasRef.current && photos.length > 0) {
      setIsRendering(true);
      renderTemplate(canvasRef.current, photos, templateId)
        .then(() => {
          setIsRendering(false);
        })
        .catch(err => {
          console.error('Render error:', err);
          setIsRendering(false);
        });
    }
  }, [photos, templateId]);

  // 2. Initialize video elements & render loop for the live BTS animated photobooth strip
  useEffect(() => {
    if (videoBlobs.length === 0 || !template) return;

    let isActive = true;
    const videos = [];
    const urls = [];

    // Create a video element for each blob segment
    videoBlobs.forEach((blob) => {
      const url = URL.createObjectURL(blob);
      urls.push(url);
      
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      video.play().catch(err => console.log('Video autoplay blocked/failed:', err));
      videos.push(video);
    });
    
    videoElementsRef.current = videos;

    // Load the template overlay and punch holes once for maximum performance
    const setupOverlay = async () => {
      const templateImg = await loadImage(template.image);
      
      const btsCanvas = btsCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (!btsCanvas || !overlayCanvas || !isActive) return;

      // Match dimensions
      btsCanvas.width = templateImg.width;
      btsCanvas.height = templateImg.height;
      overlayCanvas.width = templateImg.width;
      overlayCanvas.height = templateImg.height;

      const overlayCtx = overlayCanvas.getContext('2d');
      overlayCtx.drawImage(templateImg, 0, 0);

      // Punch rectangular holes where photos belong
      overlayCtx.globalCompositeOperation = 'destination-out';
      for (const slot of slots) {
        overlayCtx.fillStyle = 'rgba(0,0,0,1)';
        overlayCtx.fillRect(slot.x, slot.y, slot.w, slot.h);
      }
      overlayCtx.globalCompositeOperation = 'source-over';

      // Restore frame borders / details inside holes
      const origCanvas = document.createElement('canvas');
      origCanvas.width = templateImg.width;
      origCanvas.height = templateImg.height;
      const origCtx = origCanvas.getContext('2d');
      origCtx.drawImage(templateImg, 0, 0);

      for (const slot of slots) {
        const sx = Math.max(0, slot.x);
        const sy = Math.max(0, slot.y);
        const sw = Math.min(overlayCanvas.width - sx, slot.w);
        const sh = Math.min(overlayCanvas.height - sy, slot.h);

        const origData = origCtx.getImageData(sx, sy, sw, sh);
        const orig = origData.data;

        const restore = new ImageData(sw, sh);
        const dst = restore.data;

        for (let i = 0; i < orig.length; i += 4) {
          const r = orig[i], g = orig[i+1], b = orig[i+2], a = orig[i+3];
          if (a > 0 && !isPlaceholderPixel(r, g, b, fileName)) {
            dst[i]   = r;
            dst[i+1] = g;
            dst[i+2] = b;
            dst[i+3] = a;
          }
        }
        overlayCtx.putImageData(restore, sx, sy);
      }

      // Start the animated render loop
      const btsCtx = btsCanvas.getContext('2d');
      
      const renderLoop = () => {
        if (!isActive) return;

        // Clear canvas
        btsCtx.clearRect(0, 0, btsCanvas.width, btsCanvas.height);

        // Draw each video inside its coordinate slot
        for (let i = 0; i < Math.min(videos.length, slots.length); i++) {
          const video = videos[i];
          const slot = slots[i];
          
          if (video.readyState >= 2) { // HAVE_CURRENT_DATA
            btsCtx.save();
            btsCtx.beginPath();
            btsCtx.rect(slot.x, slot.y, slot.w, slot.h);
            btsCtx.clip();
            
            // Draw video with cover fit logic
            const vWidth = video.videoWidth;
            const vHeight = video.videoHeight;
            const vRatio = vWidth / vHeight;
            const targetRatio = slot.w / slot.h;
            
            let sWidth = vWidth;
            let sHeight = vHeight;
            let sx = 0;
            let sy = 0;

            if (vRatio > targetRatio) {
              sWidth = vHeight * targetRatio;
              sx = (vWidth - sWidth) / 2;
            } else {
              sHeight = vWidth / targetRatio;
              sy = (vHeight - sHeight) / 2;
            }

            btsCtx.drawImage(video, sx, sy, sWidth, sHeight, slot.x, slot.y, slot.w, slot.h);
            btsCtx.restore();
          }
        }

        // Draw template overlay on top
        btsCtx.drawImage(overlayCanvas, 0, 0);

        // Request next frame
        animationFrameRef.current = requestAnimationFrame(renderLoop);
      };

      renderLoop();
    };

    setupOverlay();

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      videos.forEach(v => {
        v.pause();
        v.src = '';
        v.load();
      });
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [videoBlobs, templateId, template, slots, isRendering]);

  async function handleDownload() {
    if (canvasRef.current) {
      const timestamp = new Date().toISOString().slice(0, 10);
      await downloadCanvas(canvasRef.current, `photobooth-${template.id}-${timestamp}.png`);
    }
  }

  // 3. Capture the live btsCanvas stream and download as video
  const handleDownloadVideo = useCallback(async () => {
    const btsCanvas = btsCanvasRef.current;
    const videos = videoElementsRef.current;
    if (!btsCanvas || videos.length === 0 || isRecordingBts) return;

    setIsRecordingBts(true);
    setRecordingProgress(0);

    // Pick best supported mime type — Chrome only supports WebM via MediaRecorder
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';

    try {
      // Reset all videos to beginning and play simultaneously
      videos.forEach(v => {
        v.currentTime = 0;
        v.loop = true;
        v.play().catch(() => {});
      });

      // Capture the live btsCanvas that's already rendering the template+video composite
      const stream = btsCanvas.captureStream(30);

      if (!stream || stream.getVideoTracks().length === 0) {
        throw new Error('captureStream tidak menghasilkan track video. Coba refresh dan ulangi.');
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data); };

      const stopped = new Promise((resolve, reject) => {
        recorder.onstop  = resolve;
        recorder.onerror = e => reject(e.error || new Error('MediaRecorder error'));
      });

      recorder.start(200); // chunk every 200ms

      // Record for 3 seconds — enough for one loop of all video segments
      const recordDuration = 3000;
      const tickMs = 150;
      let elapsed = 0;
      const ticker = setInterval(() => {
        elapsed += tickMs;
        setRecordingProgress(Math.min(98, Math.round((elapsed / recordDuration) * 100)));
      }, tickMs);

      await new Promise(resolve => setTimeout(resolve, recordDuration));
      clearInterval(ticker);

      recorder.stop();
      await stopped;

      setRecordingProgress(100);

      const blob = new Blob(chunks, { type: mimeType });
      if (blob.size < 1000) throw new Error('Video terekam kosong atau terlalu kecil. Coba ulangi.');

      // Save as .webm (correct format — Chrome MediaRecorder only produces WebM)
      const timestamp = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bts-photobooth-${template.id}-${timestamp}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);

    } catch (err) {
      console.error('BTS download error:', err);
      alert(`Gagal download video BTS:\n${err.message}\n\nPastikan menggunakan Chrome/Edge terbaru dan klik Download setelah preview video muncul.`);
    } finally {
      setIsRecordingBts(false);
      setRecordingProgress(0);
      // Restore live preview playback
      videoElementsRef.current.forEach(v => {
        v.currentTime = 0;
        v.play().catch(() => {});
      });
    }
  }, [isRecordingBts, template]);



  async function handleShare() {
    if (!canvasRef.current) return;

    try {
      const blob = await canvasToBlob(canvasRef.current);
      const file = new File([blob], 'photobooth.png', { type: 'image/png' });

      const fallbackShare = async () => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        } catch {
          handleDownload();
          alert('Foto telah didownload. Silakan bagikan secara manual ke media sosial Anda.');
        }
      };

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Photobooth Online',
            text: 'Lihat foto photobooth saya!',
            files: [file],
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Native share failed:', err);
            await fallbackShare();
          }
        }
      } else {
        await fallbackShare();
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  }

  return (
    <div className="result-page">
      {/* Header */}
      <header className="result-header">
        <button
          className="btn-back"
          onClick={onChangeTemplate}
          id="back-to-templates"
        >
          ← Ganti Template
        </button>
        <h2>🖼️ Hasil Foto</h2>
        <button
          className="btn-back"
          onClick={onGoHome}
          id="go-home-btn"
        >
          🏠 Utama
        </button>
      </header>

      {/* Body */}
      <div className="result-body">
        {/* Info */}
        <div className="result-info">
          <h3>Foto Kamu Siap! 🎉</h3>
          <p>Download atau bagikan ke teman-temanmu</p>
          <div style={{ marginTop: '12px' }}>
            <span className="template-badge">
              {template?.icon} {template?.name}
            </span>
          </div>
        </div>

        {/* Display side-by-side on desktop if videos are available */}
        <div className={`result-content-container ${videoBlobs.length > 0 ? 'has-video' : ''}`}>
          {/* Canvas (Static Photo strip) */}
          <div className="canvas-container">
            <h4>📸 Strip Foto (PNG)</h4>
            <canvas
              ref={canvasRef}
              style={{ display: isRendering ? 'none' : 'block' }}
            />
            {isRendering && (
              <div className="canvas-loading">
                <div className="spinner" />
                <span>Memproses foto...</span>
              </div>
            )}
          </div>

          {/* BTS Video Strip Preview */}
          {videoBlobs.length > 0 && !isRendering && (
            <div className="video-bts-container">
              <h4>🎬 Behind The Scenes (BTS Video)</h4>
              <p className="bts-hint">Video strip bergerak menyesuaikan frame pilihanmu (diunduh sesuai format terkompatibel browser Anda)</p>
              
              <div className="video-wrapper bts-canvas-wrapper" style={{ aspectRatio: 'auto', background: 'transparent', boxShadow: 'none' }}>
                <canvas
                  ref={btsCanvasRef}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '65vh',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-xl)',
                    background: 'var(--color-navy)'
                  }}
                />
                {/* Hidden overlay canvas used for compiling template masking */}
                <canvas ref={overlayCanvasRef} style={{ display: 'none' }} />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isRendering && (
          <div className="result-actions">
            <button className="btn-primary btn-download-png" onClick={handleDownload} id="download-btn" disabled={isRecordingBts}>
              📥 Download PNG
            </button>
            {videoBlobs.length > 0 && (
              <button 
                className="btn-primary btn-download-video" 
                onClick={handleDownloadVideo} 
                id="download-video-btn"
                disabled={isRecordingBts}
                style={{ position: 'relative' }}
              >
                {isRecordingBts ? (
                  <span>⏳ Memproses: {recordingProgress}%</span>
                ) : (
                  <span>🎥 Download BTS Video</span>
                )}
              </button>
            )}
            <button className="btn-secondary" onClick={handleShare} id="share-btn" disabled={isRecordingBts}>
              📤 Bagikan
            </button>
            <button className="btn-outline" onClick={onChangeTemplate} id="change-template-btn" disabled={isRecordingBts}>
              🎨 Ganti Template
            </button>
            <button className="btn-outline" onClick={onRetake} id="retake-photos-btn" disabled={isRecordingBts}>
              📷 Foto Lagi
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <div className="share-toast">
          ✅ Foto berhasil disalin ke clipboard!
        </div>
      )}
    </div>
  );
}


