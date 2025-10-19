import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MobileNav = ({ darkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setActiveSection(null);
    }
  };

  const handleSectionClick = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleProjectClick = (projectName, type) => {
    const slug = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    navigate(`/${type}/${slug}`);
    setIsOpen(false);
    setActiveSection(null);
  };

  return (
    <>
      <motion.div 
        className="mobile-nav"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mobile-nav-bar">
          <span className="mobile-nav-name">ALI CHAARAOUI</span>
          <button className="mobile-nav-toggle" onClick={handleMenuToggle}>
            <div className={`menu-icon ${isOpen ? 'open' : ''}`}>
              <span className="line line-1"></span>
              <span className="line line-2"></span>
            </div>
          </button>
        </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-nav-content"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
                <div className="mobile-nav-items">
                  <button 
                    className="mobile-nav-item"
                    onClick={() => handleSectionClick('projects')}
                  >
                    <span>PROJECTS</span>
                    <div className={`menu-icon-small ${activeSection === 'projects' ? 'open' : ''}`}>
                      <span className="line-small line-small-1"></span>
                      <span className="line-small line-small-2"></span>
                    </div>
                  </button>
                  
                  <AnimatePresence>
                {activeSection === 'projects' && (
                  <motion.div
                    className="mobile-section-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="projects-mobile-list">
                      <h4>SOFTWARE</h4>
                      <div className="project-mobile-item" onClick={() => handleProjectClick('mobile-investment-guide-app', 'software')}>
                        <span className="project-mobile-name">MOBILE INVESTMENT GUIDE APP</span>
                        <span className="project-mobile-tech">React Native, Firebase, Redux</span>
                      </div>
                      <div className="project-mobile-item" onClick={() => handleProjectClick('wordl-app', 'software')}>
                        <span className="project-mobile-name">WORDL APP</span>
                        <span className="project-mobile-tech">Swift, UIKit, Core Data</span>
                      </div>
                      <div className="project-mobile-item" onClick={() => handleProjectClick('online-ordering-system', 'software')}>
                        <span className="project-mobile-name">ONLINE ORDERING SYSTEM</span>
                        <span className="project-mobile-tech">Node.js, Express, MongoDB, React</span>
                      </div>
                      <div className="project-mobile-item" onClick={() => handleProjectClick('achrakat-3d-game', 'software')}>
                        <span className="project-mobile-name">ACHRAKAT 3D GAME</span>
                        <span className="project-mobile-tech">Unity, C#, Blender</span>
                      </div>
                      <div className="project-mobile-item" onClick={() => handleProjectClick('heloys', 'software')}>
                        <span className="project-mobile-name">CASA HELOYS</span>
                        <span className="project-mobile-tech">React, CSS3, GitHub Pages</span>
                      </div>
                      <div className="project-mobile-item" onClick={() => handleProjectClick('omvra-studios', 'software')}>
                        <span className="project-mobile-name">OMVRA STUDIOS</span>
                        <span className="project-mobile-tech">Creative Director Website</span>
                      </div>
                      <div className="project-mobile-item" onClick={() => handleProjectClick('portfolio', 'software')}>
                        <span className="project-mobile-name">PORTFOLIO</span>
                        <span className="project-mobile-tech">React, Vite, Framer Motion</span>
                      </div>
                      
                      <h4>ARCHITECTURE</h4>
                      <div className="project-mobile-item" onClick={() => handleProjectClick('celine', 'architecture')}>
                        <span className="project-mobile-name">CELINE</span>
                        <span className="project-mobile-tech">Rhino, Grasshopper, V-Ray</span>
                      </div>
                      <div className="project-mobile-item" onClick={() => handleProjectClick('carved-ft-the-kimbell', 'architecture')}>
                        <span className="project-mobile-name">CARVED FT. THE KIMBELL</span>
                        <span className="project-mobile-tech">AutoCAD, Revit, Enscape</span>
                      </div>
                      <div className="project-mobile-item" onClick={() => handleProjectClick('shuttle-stops', 'architecture')}>
                        <span className="project-mobile-name">SHUTTLE STOPS</span>
                        <span className="project-mobile-tech">SketchUp, Lumion, Photoshop</span>
                      </div>
                      <div className="project-mobile-item" onClick={() => handleProjectClick('citadel', 'architecture')}>
                        <span className="project-mobile-name">CITADEL</span>
                        <span className="project-mobile-tech">Rhino, V-Ray, InDesign</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                className="mobile-nav-item"
                onClick={() => { navigate('/experience'); setIsOpen(false); setActiveSection(null); }}
              >
                <span>EXPERIENCE</span>
              </button>

              <button 
                className="mobile-nav-item"
                onClick={() => handleSectionClick('contact')}
              >
                <span>CONTACT</span>
                <div className={`menu-icon-small ${activeSection === 'contact' ? 'open' : ''}`}>
                  <span className="line-small line-small-1"></span>
                  <span className="line-small line-small-2"></span>
                </div>
              </button>
              
              <AnimatePresence>
                {activeSection === 'contact' && (
                  <motion.div
                    className="mobile-section-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="contact-mobile-content">
                      <div className="contact-mobile-item">
                        <h4>EMAIL</h4>
                        <a href="mailto:a.chaaraoui@icloud.com">a.chaaraoui@icloud.com</a>
                      </div>
                      <div className="contact-mobile-item">
                        <h4>PHONE</h4>
                        <a href="tel:+19806433764">+1 (980) 643-3764</a>
                      </div>
                      <div className="contact-mobile-item">
                        <h4>SOCIAL</h4>
                        <div className="social-mobile-links">
                          <a href="https://www.linkedin.com/in/alichaaraoui/" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/>
                            </svg>
                          </a>
                          <a href="https://github.com/alichaaraoui" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                      
                      <div className="contact-mobile-form">
                        <h4>SEND MESSAGE</h4>
                        <form onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
                          <input 
                            type="text" 
                            placeholder="Name" 
                            className="mobile-form-input"
                            required
                          />
                          <input 
                            type="email" 
                            placeholder="Email" 
                            className="mobile-form-input"
                            required
                          />
                          <textarea 
                            placeholder="Message" 
                            className="mobile-form-textarea"
                            rows="4"
                            required
                          ></textarea>
                          <button type="submit" className="mobile-form-submit">
                            SEND
                          </button>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
      
      <button 
        className="dark-mode-toggle mobile-dark-toggle" 
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        <span className="mode-icon mode-moon">☾</span>
        <span className="mode-icon mode-sun">☀</span>
      </button>
    </>
  );
};

export default MobileNav;

