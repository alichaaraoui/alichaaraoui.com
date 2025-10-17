import { motion } from 'framer-motion';
import { useState } from 'react';
import GridLines from './GridLines';
import Typewriter from './Typewriter';

const Hero = ({ darkMode }) => {
  const [nameComplete, setNameComplete] = useState(false);
  const [subtitleComplete, setSubtitleComplete] = useState(false);
  const [col1Complete, setCol1Complete] = useState(false);
  const [col2Complete, setCol2Complete] = useState(false);
  
  console.log('Hero component rendering, darkMode:', darkMode);
  
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 2.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const lineColor = darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
  const isMobile = window.innerWidth <= 768;
  const margin = isMobile ? '20px' : '100px';
  const gridColumns = isMobile ? 1 : 4;

  const lineStyle = {
    position: 'absolute',
    left: margin,
    right: margin,
    height: '0',
    borderTop: `0.5px solid ${lineColor}`,
    pointerEvents: 'none',
  };

  const verticalLineStyle = {
    position: 'fixed',
    top: '0',
    bottom: '0',
    width: '0',
    borderLeft: `0.5px solid ${lineColor}`,
    pointerEvents: 'none',
  };

  return (
    <section className="hero">
      {/* Vertical lines - adjusted for equal spacing */}
      <div style={{ ...verticalLineStyle, left: margin }}></div>
      <div style={{ ...verticalLineStyle, left: isMobile ? `calc(${margin} + 10px)` : `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.25 + 10px)` }}></div>
      {!isMobile && (
        <>
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.5 + 20px)` }}></div>
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.75 + 30px)` }}></div>
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.25 + 0px)` }}></div>
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.5 + 10px)` }}></div>
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.75 + 20px)` }}></div>
        </>
      )}
      <div style={{ ...verticalLineStyle, right: isMobile ? `calc(${margin} + 10px)` : margin }}></div>
      <div style={{ ...verticalLineStyle, right: margin }}></div>

      {/* Horizontal lines - starting from top */}
      <div style={{ ...lineStyle, top: '0' }}></div>
      <div style={{ ...lineStyle, top: '40vh' }}></div>
      <div style={{ ...lineStyle, top: 'calc(80vh + 10px)' }}></div>
      <div style={{ ...lineStyle, top: 'calc(120vh + 20px)' }}></div>

      {/* Duplicate horizontal lines - 10px below each original line (skip top) */}
      <div style={{ ...lineStyle, top: 'calc(40vh + 10px)' }}></div>
      <div style={{ ...lineStyle, top: 'calc(80vh + 20px)' }}></div>
      <div style={{ ...lineStyle, top: 'calc(120vh + 30px)' }}></div>

      {/* Horizontal lines connecting nav bar and name */}
      {!isMobile && (
        <>
          <div style={{ ...lineStyle, top: '20px' }}></div>
          <div style={{ ...lineStyle, top: 'calc(20px + 50px)' }}></div>
        </>
      )}

      <div className="hero-header-container">
        <div className="name-header">
          <Typewriter 
            text="ALI CHAARAOUI" 
            delay={500}
            speed={50}
            onComplete={() => setNameComplete(true)}
          />
        </div>
        
        <div className="hero-subtitle">
          <Typewriter 
            text="SOFTWARE DEVELOPER / DESIGNER / ARCHITECTURE STUDENT" 
            delay={nameComplete ? 200 : 9999999}
            speed={20}
            onComplete={() => setSubtitleComplete(true)}
          />
        </div>
      </div>

      {/* 3x2 Grid Content */}
      <div className="hero-grid-content">
        {/* Column 1 */}
        <div className="hero-grid-item" style={{ gridColumn: 1, gridRow: 1 }}>
          <p>
            <Typewriter 
              text="Hello, I'm Ali, canadian born, architecture student, designer and software developer and studying both architecture and computer science." 
              delay={subtitleComplete ? 300 : 9999999}
              speed={15}
              onComplete={() => setCol1Complete(true)}
            />
          </p>
        </div>
        
        {/* Gap 1 - empty */}
        <div></div>
        
        {/* Column 2 */}
        <div className="hero-grid-item" style={{ gridColumn: 3, gridRow: 1 }}>
          <p>
            <Typewriter 
              text="What I do: Software development, architecture, creative direction, design systems, game environments, brand identity and everything in between." 
              delay={col1Complete ? 200 : 9999999}
              speed={15}
              onComplete={() => setCol2Complete(true)}
            />
          </p>
        </div>
        
        {/* Gap 2 - empty */}
        <div></div>
        
        {/* Column 3 */}
        <div className="hero-grid-item" style={{ gridColumn: 5, gridRow: 1 }}>
          <div className="socials-section">
            <div className="social-links-with-icons">
              {col2Complete && (
                <>
                  <a href="https://linkedin.com/in/alichaaraoui" target="_blank" rel="noopener noreferrer" className="social-link-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/>
                    </svg>
                    <span>
                      <Typewriter 
                        text="Linkedin" 
                        delay={100}
                        speed={20}
                        showCursor={false}
                      />
                    </span>
                  </a>
                  <a href="https://github.com/alichaaraoui" target="_blank" rel="noopener noreferrer" className="social-link-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
                    </svg>
                    <span>
                      <Typewriter 
                        text="GitHub" 
                        delay={300}
                        speed={20}
                        showCursor={false}
                      />
                    </span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

