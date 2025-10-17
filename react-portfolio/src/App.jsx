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

  return (
    <Router>
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
