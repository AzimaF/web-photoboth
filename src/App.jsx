import { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import CameraCapture from './components/CameraCapture';
import TemplateSelector from './components/TemplateSelector';
import ResultPreview from './components/ResultPreview';
import { TEMPLATES } from './utils/templateRenderer';
import './App.css';

/**
 * Application flow states:
 * 'landing'  -> LandingPage
 * 'camera'   -> CameraCapture
 * 'template' -> TemplateSelector
 * 'result'   -> ResultPreview
 */

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [photos, setPhotos] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [recordedVideoBlobs, setRecordedVideoBlobs] = useState([]);

  // Navigation handlers
  const handleStartPhotobooth = useCallback(() => {
    setCurrentPage('template');
  }, []);

  const handlePhotosComplete = useCallback((capturedPhotos, videoBlobs) => {
    setPhotos(capturedPhotos);
    setRecordedVideoBlobs(videoBlobs);
    setCurrentPage('result');
  }, []);

  const handleTemplateSelect = useCallback((templateId) => {
    setSelectedTemplate(templateId);
    setRecordedVideoBlobs([]);
    setCurrentPage('camera');
  }, []);

  const handleChangeTemplate = useCallback(() => {
    setPhotos([]);
    setRecordedVideoBlobs([]);
    setCurrentPage('template');
  }, []);

  const handleRetake = useCallback(() => {
    setPhotos([]);
    setRecordedVideoBlobs([]);
    setCurrentPage('camera');
  }, []);

  const handleBackToLanding = useCallback(() => {
    setPhotos([]);
    setSelectedTemplate(null);
    setRecordedVideoBlobs([]);
    setCurrentPage('landing');
  }, []);

  const handleBackToTemplate = useCallback(() => {
    setPhotos([]);
    setRecordedVideoBlobs([]);
    setCurrentPage('template');
  }, []);



  // Get the photo count required by selected template
  const requiredPhotoCount = selectedTemplate
    ? (TEMPLATES.find(t => t.id === selectedTemplate)?.photoCount ?? 4)
    : 4;

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onStart={handleStartPhotobooth}
          />
        );
      case 'template':
        return (
          <TemplateSelector
            photos={photos}
            onSelect={handleTemplateSelect}
            onBack={handleBackToLanding}
          />
        );
      case 'camera':
        return (
          <CameraCapture
            onComplete={handlePhotosComplete}
            onBack={handleBackToTemplate}
            totalPhotos={requiredPhotoCount}
          />
        );
      case 'result':
        return (
          <ResultPreview
            photos={photos}
            videoBlobs={recordedVideoBlobs}
            templateId={selectedTemplate}
            onChangeTemplate={handleChangeTemplate}
            onRetake={handleRetake}
            onGoHome={handleBackToLanding}
          />
        );


      default:
        return <LandingPage onStart={handleStartPhotobooth} />;
    }
  };

  return (
    <div className="app">
      {renderPage()}
    </div>
  );
}

export default App;
