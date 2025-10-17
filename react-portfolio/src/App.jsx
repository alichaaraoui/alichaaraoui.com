import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import Hero from './components/Hero';
import LoadingScreen from './components/LoadingScreen';
import CustomCursor from './components/CustomCursor';
import SoftwareProject from './components/SoftwareProject';
import ArchitectureProject from './components/ArchitectureProject';
import ExperiencePage from './components/ExperiencePage';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLoadingComplete = () => {
    setLoading(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Determine basename based on the current URL
  const getBasename = () => {
    if (import.meta.env.DEV) return "";
    
    // If we're on the GitHub Pages URL, use the basename
    if (window.location.hostname === 'alichaaraoui.github.io') {
      return "/alichaaraoui.com";
    }
    // If we're on the custom domain, no basename needed
    return "";
  };

  // Fix asset paths for custom domain
  useEffect(() => {
    if (import.meta.env.PROD && window.location.hostname !== 'alichaaraoui.github.io') {
      // We're on custom domain, fix asset paths
      const links = document.querySelectorAll('link[href*="/alichaaraoui.com/"]');
      const scripts = document.querySelectorAll('script[src*="/alichaaraoui.com/"]');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          link.setAttribute('href', href.replace('/alichaaraoui.com/', '/'));
        }
      });
      
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src) {
          script.setAttribute('src', src.replace('/alichaaraoui.com/', '/'));
        }
      });
    }
  }, []);

  return (
    <Router basename={getBasename()}>
      <CustomCursor darkMode={darkMode} />
      
      <AnimatePresence mode="wait">
        {loading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {!loading && (
        <>
          {isMobile ? (
            <MobileNav darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          ) : (
            <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          )}
          
          <Routes>
            <Route path="/" element={
              <main className="main">
                <Hero darkMode={darkMode} />
              </main>
            } />
            <Route path="/experience" element={<ExperiencePage darkMode={darkMode} />} />
            <Route path="/software/:projectId" element={<SoftwareProject darkMode={darkMode} />} />
            <Route path="/architecture/:projectId" element={<ArchitectureProject darkMode={darkMode} />} />
          </Routes>
        </>
      )}
    </Router>
  );
}

export default App;
