import { useState, useRef, useEffect, useCallback } from 'react';
import { startCamera, stopCamera, captureFrame, isCameraSupported } from '../utils/camera';
import './CameraCapture.css';

const COUNTDOWN_SECONDS = 3;

export default function CameraCapture({ onComplete, onBack, totalPhotos = 4 }) {
  const [photos, setPhotos] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [error, setError] = useState(null);
  const [allDone, setAllDone] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const countdownRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [recordedVideoBlobs, setRecordedVideoBlobs] = useState([]);

  // Initialize camera
  useEffect(() => {
    if (!isCameraSupported()) {
      setError('Browser Anda tidak mendukung akses kamera. Gunakan browser modern seperti Chrome atau Firefox.');
      return;
    }

    initCamera();

    return () => {
      if (streamRef.current) {
        stopCamera(streamRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  async function initCamera() {
    try {
      const stream = await startCamera();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  // Helper to start the MediaRecorder for a specific photo index
  const startRecordingSegment = useCallback(() => {
    if (!streamRef.current) return;
    
    recordedChunksRef.current = [];
    
    // Choose the best supported video mime type
    const mimeTypes = [
      'video/mp4;codecs=h264,aac',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    
    let selectedType = '';
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        selectedType = type;
        break;
      }
    }

    try {
      const options = selectedType ? { mimeType: selectedType } : undefined;
      const recorder = new MediaRecorder(streamRef.current, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: selectedType || 'video/webm'
        });
        setRecordedVideoBlobs(prev => [...prev, blob]);
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start(100); // chunk every 100ms
    } catch (e) {
      console.error('Gagal menginisialisasi MediaRecorder:', e);
    }
  }, []);

  // Capture photo with countdown
  const startCountdown = useCallback(() => {
    if (countdown !== null || photos.length >= totalPhotos) return;

    // Start recording for this countdown segment
    startRecordingSegment();

    let count = COUNTDOWN_SECONDS;
    setCountdown(count);

    countdownRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        setCountdown(null);
        takePhoto();
      }
    }, 1000);
  }, [countdown, photos.length, totalPhotos, startRecordingSegment]);

  function takePhoto() {
    if (!videoRef.current) return;

    // Flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 400);

    // Capture
    const dataUrl = captureFrame(videoRef.current, 640, 480);

    // Stop recording immediately when photo is captured
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    setPhotos(prev => {
      const newPhotos = [...prev, dataUrl];
      if (newPhotos.length >= totalPhotos) {
        setAllDone(true);
        // Stop camera after all photos taken
        setTimeout(() => {
          if (streamRef.current) {
            stopCamera(streamRef.current);
            setIsStreaming(false);
          }
        }, 500);
      }
      return newPhotos;
    });
  }

  function handleRetake() {
    setPhotos([]);
    setRecordedVideoBlobs([]);
    recordedChunksRef.current = [];
    setAllDone(false);
    if (!isStreaming) {
      initCamera();
    }
  }

  function handleRetakeLast() {
    setPhotos(prev => prev.slice(0, -1));
    setRecordedVideoBlobs(prev => prev.slice(0, -1));
    recordedChunksRef.current = [];
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }

  function handleProceed() {
    if (photos.length === totalPhotos) {
      onComplete(photos, recordedVideoBlobs);
    }
  }


  // Error state
  if (error) {
    return (
      <div className="camera-page">
        <header className="camera-header">
          <button className="btn-back" onClick={onBack} id="back-to-landing">
            ← Kembali
          </button>
          <h2><span className="cam-icon">📷</span> Photobooth</h2>
          <div />
        </header>
        <div className="camera-body">
          <div className="camera-error">
            <span className="error-icon">😔</span>
            <h3>Gagal Mengakses Kamera</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={initCamera} id="retry-camera">
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-page">
      {/* Header */}
      <header className="camera-header">
        <button className="btn-back" onClick={onBack} id="back-from-camera">
          ← Kembali
        </button>
        <h2><span className="cam-icon">📷</span> Photobooth</h2>
        <div className="photo-counter">
          {Array.from({ length: totalPhotos }).map((_, i) => (
            <div
              key={i}
              className={`counter-dot ${i < photos.length ? 'captured' : ''} ${i === photos.length ? 'current' : ''}`}
            />
          ))}
        </div>
      </header>

      {/* Camera Body */}
      <div className="camera-body">
        {/* Status */}
        <div className="camera-status">
          {allDone
            ? '✅ Semua foto berhasil diambil!'
            : `Foto ${photos.length + 1} dari ${totalPhotos}`
          }
        </div>

        {/* Camera Viewport */}
        {!allDone && (
          <div className="camera-viewport">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
            />

            {/* Frame corners */}
            <div className="camera-frame-overlay">
              <div className="frame-corner top-left" />
              <div className="frame-corner top-right" />
              <div className="frame-corner bottom-left" />
              <div className="frame-corner bottom-right" />
            </div>

            {/* Countdown overlay */}
            {countdown !== null && (
              <div className="countdown-overlay">
                <span className="countdown-number" key={countdown}>
                  {countdown}
                </span>
              </div>
            )}

            {/* Flash effect */}
            {showFlash && <div className="flash-overlay" />}
          </div>
        )}

        {/* All Done */}
        {allDone && (
          <div className="all-done">
            <span className="done-icon">🎉</span>
            <h3>Foto Selesai!</h3>
            <p>Sekarang pilih template untuk foto kamu</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={handleProceed} id="proceed-to-template">
                Pilih Template →
              </button>
              <button className="btn-outline" onClick={handleRetake} id="retake-all" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                🔄 Ulangi Semua
              </button>
            </div>
          </div>
        )}

        {/* Photo Strip Preview */}
        <div className="photo-strip-preview">
          {Array.from({ length: totalPhotos }).map((_, i) => (
            <div key={i} className={`strip-thumb ${photos[i] ? 'has-photo' : ''}`}>
              {photos[i] ? (
                <img src={photos[i]} alt={`Foto ${i + 1}`} />
              ) : (
                <div className="strip-thumb-placeholder">{i + 1}</div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        {!allDone && (
          <div className="camera-controls">
            {photos.length > 0 && (
              <button className="btn-retake" onClick={handleRetakeLast} id="retake-last-photo">
                ↩ Ulangi
              </button>
            )}
            <button
              className="btn-capture"
              onClick={startCountdown}
              disabled={countdown !== null || !isStreaming}
              id="capture-btn"
              aria-label="Ambil Foto"
            />
            {photos.length > 0 && photos.length < totalPhotos && (
              <div style={{ width: '70px' }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
