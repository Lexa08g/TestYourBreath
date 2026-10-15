import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Results from './pages/Results';
import About from './pages/About';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [currentResult, setCurrentResult] = useState(null);
  const [currentAudioFile, setCurrentAudioFile] = useState(null);

  const handleAnalysisComplete = (predictionResult, audioFile) => {
    setCurrentResult(predictionResult);
    setCurrentAudioFile(audioFile);
    setActivePage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetAnalysis = () => {
    setCurrentResult(null);
    setCurrentAudioFile(null);
    setActivePage('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <Navbar activePage={activePage} setActivePage={handleNavigate} />

      {/* Main Content View with Error Boundary protection */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorBoundary onReset={() => setActivePage('home')}>
          {activePage === 'home' && (
            <Home setActivePage={handleNavigate} />
          )}

          {activePage === 'analyze' && (
            <Analyze onAnalysisComplete={handleAnalysisComplete} />
          )}

          {activePage === 'results' && (
            <Results
              result={currentResult}
              audioFile={currentAudioFile}
              onReset={handleResetAnalysis}
            />
          )}

          {activePage === 'about' && (
            <About setActivePage={handleNavigate} />
          )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <Footer setActivePage={handleNavigate} />
    </div>
  );
}
