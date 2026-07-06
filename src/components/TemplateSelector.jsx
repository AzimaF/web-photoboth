import { useState } from 'react';
import { TEMPLATES } from '../utils/templateRenderer';
import './TemplateSelector.css';

export default function TemplateSelector({ onSelect, onBack }) {
  const [selectedId, setSelectedId] = useState(null);

  function handleSelect(templateId) {
    setSelectedId(templateId);
  }

  function handleConfirm() {
    if (selectedId) {
      onSelect(selectedId);
    }
  }

  return (
    <div className="template-page">
      {/* Header */}
      <header className="template-header">
        <button className="btn-back" onClick={onBack} id="back-from-template" style={{ color: 'var(--color-navy)' }}>
          ← Kembali
        </button>
        <h2>🎨 Pilih Template</h2>
        <div />
      </header>

      {/* Body */}
      <div className="template-body">
        <h2 className="template-section-title">Pilih Template Favoritmu</h2>
        <p className="template-section-subtitle">
          Pilih dulu template kamu, lalu ambil foto sesuai jumlah yang dibutuhkan
        </p>

        {/* Template Grid */}
        <div className="template-grid">
          {TEMPLATES.map(template => {
            const photoCount = template.photoCount ?? 4;
            return (
              <div
                key={template.id}
                className={`template-card ${selectedId === template.id ? 'selected' : ''}`}
                onClick={() => handleSelect(template.id)}
                id={`template-${template.id}`}
              >
                <div className="template-preview-area">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="template-thumb-img"
                  />
                  <div className="template-photo-badge">
                    📷 {photoCount} Foto
                  </div>
                </div>
                <div className="template-info">
                  <h3>
                    <span>{template.icon}</span>
                    {template.name}
                  </h3>
                  <p>{template.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div className="template-action-bar">
        {selectedId ? (
          <>
            <span className="selected-label">
              Template: <strong>{TEMPLATES.find(t => t.id === selectedId)?.name}</strong>
            </span>
            <button className="btn-primary" onClick={handleConfirm} id="confirm-template">
              Ambil Foto →
            </button>
          </>
        ) : (
          <span className="selected-label">Pilih salah satu template di atas</span>
        )}
      </div>
    </div>
  );
}
