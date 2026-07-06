import { useState } from 'react';
import { TEMPLATES } from '../utils/templateRenderer';
import './LandingPage.css';

// Decorative star SVG component
function StarBurst({ size = 60, color = '#CCFF00' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <path
        d="M30 0L35.5 22.5L58 17L40 30L58 43L35.5 37.5L30 60L24.5 37.5L2 43L20 30L2 17L24.5 22.5L30 0Z"
        fill={color}
      />
    </svg>
  );
}

export default function LandingPage({ onStart }) {
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Dummy photos for preview
  const dummyPhotos = Array(4).fill('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'); // 1x1 transparent/white pixel

  const renderMiniPreview = (template) => {
    const bgStyle = { backgroundColor: template.bgColor };

    if (template.layout === 'grid') {
      return (
        <div className="template-preview-bg" style={bgStyle}>
          <div className="preview-mini-grid" style={{ background: template.bgColor }}>
            {dummyPhotos.map((photo, i) => (
              <div key={i} className="mini-photo" style={{ backgroundColor: '#e2e8f0' }}>
                <img src={photo} alt={`Preview ${i + 1}`} style={{ opacity: 0 }} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="template-preview-bg" style={bgStyle}>
        <div className="preview-mini-strip" style={{ background: template.bgColor === '#FFFFFF' ? '#f0f0f0' : template.bgColor }}>
          {dummyPhotos.map((photo, i) => (
            <div key={i} className="mini-photo" style={{ backgroundColor: '#e2e8f0' }}>
              <img src={photo} alt={`Preview ${i + 1}`} style={{ opacity: 0 }} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="logo-container">
          <img src={`${import.meta.env.BASE_URL}Logo.png`} alt="Photobooth Logo" className="landing-logo" />
          <span className="logo-text">Photobooth Online</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        {/* Decorative Elements */}
        <div className="hero-decoration decoration-star-1">
          <StarBurst size={80} color="#CCFF00" />
        </div>
        <div className="hero-decoration decoration-star-2">
          <StarBurst size={50} color="#3344FF" />
        </div>
        <div className="hero-decoration decoration-star-3">
          <StarBurst size={35} color="#CCFF00" />
        </div>
        <div className="hero-decoration decoration-circle-1" />
        <div className="hero-decoration decoration-circle-2" />

        <div className="hero-content">
          <span className="hero-badge">
            <span className="pulse-dot" />
            Online & Gratis
          </span>

          <h1 className="hero-title">
            Photo<span className="highlight">booth</span>
            <br />
            Online
          </h1>

          <p className="hero-subtitle">
            Ambil foto seru bersama teman-teman langsung dari browser. 
            Pilih template keren dan simpan momen terbaikmu!
          </p>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={onStart}
              id="start-photobooth-btn"
            >
              Mulai Photobooth
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="section-title">Cara Kerjanya</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">📷</span>
            <h3>Buka Kamera</h3>
            <p>Izinkan akses kamera dan siapkan pose terbaikmu</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🤳</span>
            <h3>Ambil 4 Foto</h3>
            <p>Foto akan diambil otomatis dengan countdown timer</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎨</span>
            <h3>Pilih Template</h3>
            <p>Pilih dari 6 template photobooth yang menarik</p>
          </div>
        </div>
      </section>

      {/* Template Preview */}
      <section className="templates-preview">
        <h2 className="section-title">Template Tersedia</h2>
        <p className="section-subtitle">Pilih template favoritmu setelah foto</p>
        <div className="templates-scroll">
          {TEMPLATES.map(template => (
            <div 
              key={template.id} 
              className="template-preview-card"
              onClick={() => setPreviewTemplate(template)}
              style={{ cursor: 'pointer' }}
            >
              <div className="template-preview-icon">{template.icon}</div>
              <h4>{template.name}</h4>
              <p>{template.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Photobooth Online. All rights reserved by Tumpul's</p>
      </footer>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="preview-modal-overlay" onClick={() => setPreviewTemplate(null)}>
          <div className="preview-modal-content" onClick={e => e.stopPropagation()}>
            <button className="preview-modal-close" onClick={() => setPreviewTemplate(null)}>×</button>
            <h3>Preview: {previewTemplate.name} {previewTemplate.icon}</h3>
            <div className="preview-modal-body">
              {renderMiniPreview(previewTemplate)}
            </div>
            <button className="btn-primary" onClick={() => {
              setPreviewTemplate(null);
              onStart();
            }}>
              Gunakan Template Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
