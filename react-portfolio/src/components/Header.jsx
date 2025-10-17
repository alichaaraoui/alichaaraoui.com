import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Typewriter from './Typewriter';

const Header = ({ darkMode, toggleDarkMode }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const isMobile = window.innerWidth <= 768;
  const navigate = useNavigate();

  const handleProjectClick = (projectName, type) => {
    const slug = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    navigate(`/${type}/${slug}`);
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (activeDropdown) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [activeDropdown]);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      maxHeight: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    visible: { 
      opacity: 1, 
      maxHeight: 800,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const overlayVariants = {
    hidden: { 
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            className={`${activeDropdown}-dropdown-overlay`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={() => setActiveDropdown(null)}
          />
        )}
      </AnimatePresence>

      <motion.header
        ref={headerRef}
        className={`header ${activeDropdown ? 'dropdown-active' : ''} ${mobileMenuOpen ? 'mobile-menu-active' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="nav">
          {isMobile ? (
            <div className="mobile-nav-container">
              <div className="mobile-top-bar">
                <span className="mobile-name">ALI CHAARAOUI</span>
                <button 
                  className="mobile-plus-btn" 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <div className={`plus ${mobileMenuOpen ? 'active' : ''}`}>
                    <div className="plus-h"></div>
                    <div className="plus-v"></div>
                  </div>
                </button>
              </div>
              
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div 
                    className="mobile-menu"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      className="mobile-menu-item"
                      onClick={() => toggleDropdown('works')}
                    >
                      PROJECTS
                    </button>
                    <button
                      className="mobile-menu-item"
                      onClick={() => toggleDropdown('about')}
                    >
                      ABOUT
                    </button>
                    <button
                      className="mobile-menu-item"
                      onClick={() => toggleDropdown('contact')}
                    >
                      CONTACT
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <div className="nav-links" id="nav-links">
                <motion.button
                  className={`nav-link nav-toggle-works ${activeDropdown === 'works' ? 'active' : ''}`}
                  onClick={() => toggleDropdown('works')}
                  transition={{ duration: 0.2 }}
                >
                  PROJECTS
                </motion.button>
                <motion.button
                  className="nav-link"
                  onClick={() => { navigate('/experience'); setActiveDropdown(null); }}
                  transition={{ duration: 0.2 }}
                >
                  EXPERIENCE
                </motion.button>
                <motion.button
                  className={`nav-link ${activeDropdown === 'contact' ? 'active' : ''}`}
                  onClick={() => toggleDropdown('contact')}
                  transition={{ duration: 0.2 }}
                >
                  CONTACT
                </motion.button>
              </div>
              <div className="nav-brand">
                <button className="nav-logo" onClick={() => { navigate('/'); setActiveDropdown(null); }}>
                  AC
                </button>
              </div>
            </>
          )}
        </nav>
        
        <button 
          className="dark-mode-toggle" 
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
        >
          <span className="mode-icon mode-moon">☾</span>
          <span className="mode-icon mode-sun">☀</span>
        </button>


        <AnimatePresence>
          {activeDropdown === 'contact' && (
            <motion.div
              className="contact-dropdown active"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={dropdownVariants}
            >
              <div className="contact-dropdown-content">
                <div className="contact-info">
                  <div className="contact-item">
                    <h3>EMAIL</h3>
                    <a href="mailto:a.chaaraoui@icloud.com" className="contact-link">
                      a.chaaraoui@icloud.com
                    </a>
                  </div>
                  <div className="contact-item">
                    <h3>PHONE</h3>
                    <a href="tel:+19806433764" className="contact-link">
                      +1 (980) 643-3764
                    </a>
                  </div>
                  <div className="contact-item">
                    <h3>SOCIAL</h3>
                    <div className="social-links">
                      <a href="https://www.linkedin.com/in/alichaaraoui/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/>
                        </svg>
                      </a>
                      <a href="https://github.com/alichaaraoui" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="GitHub">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" fill="currentColor"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="contact-form">
                  <h3>SEND MESSAGE</h3>
                  <form onSubmit={(e) => { e.preventDefault(); alert('Form submitted!'); }}>
                    <input 
                      type="text" 
                      placeholder="Name" 
                      className="form-input"
                      required
                    />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      className="form-input"
                      required
                    />
                    <textarea 
                      placeholder="Message" 
                      className="form-textarea"
                      rows="4"
                      required
                    ></textarea>
                    <button type="submit" className="form-submit">
                      SEND
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeDropdown === 'works' && (
            <motion.div
              className="works-dropdown active"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={dropdownVariants}
            >
              <div className="works-dropdown-content">
                <div className="projects-list-vertical">
                  <h3 className="category-title">SOFTWARE</h3>
                  <ul className="project-items" data-interactive="true">
                    <li data-clickable="true" onClick={() => handleProjectClick('mobile-investment-guide-app', 'software')}>
                      <span className="project-name">MOBILE INVESTMENT GUIDE APP</span>
                      <span className="project-tech">React Native, Firebase, Redux</span>
                    </li>
                    <li data-clickable="true" onClick={() => handleProjectClick('wordl-app', 'software')}>
                      <span className="project-name">WORDL APP</span>
                      <span className="project-tech">Swift, UIKit, Core Data</span>
                    </li>
                    <li data-clickable="true" onClick={() => handleProjectClick('online-ordering-system', 'software')}>
                      <span className="project-name">ONLINE ORDERING SYSTEM</span>
                      <span className="project-tech">Node.js, Express, MongoDB, React</span>
                    </li>
                    <li data-clickable="true" onClick={() => handleProjectClick('achrakat-3d-game', 'software')}>
                      <span className="project-name">ACHRAKAT 3D GAME</span>
                      <span className="project-tech">Unity, C#, Blender</span>
                    </li>
                    <li data-clickable="true" onClick={() => handleProjectClick('heloys', 'software')}>
                      <span className="project-name">HELOYS</span>
                      <span className="project-tech">Fashion Brand Website</span>
                    </li>
                    <li data-clickable="true" onClick={() => handleProjectClick('omvra-studios', 'software')}>
                      <span className="project-name">OMVRA STUDIOS</span>
                      <span className="project-tech">Creative Director Website</span>
                    </li>
                    <li data-clickable="true" onClick={() => handleProjectClick('portfolio', 'software')}>
                      <span className="project-name">PORTFOLIO</span>
                      <span className="project-tech">React, Vite, Framer Motion</span>
                    </li>
                  </ul>
                  
                  <h3 className="category-title">ARCHITECTURE</h3>
                  <ul className="project-items" data-interactive="true">
                    <li data-clickable="true" onClick={() => handleProjectClick('celine', 'architecture')}>
                      <span className="project-name">CELINE</span>
                      <span className="project-tech">Rhino, Grasshopper, V-Ray</span>
                    </li>
                    <li data-clickable="true" onClick={() => handleProjectClick('carved-ft-the-kimbell', 'architecture')}>
                      <span className="project-name">CARVED FT. THE KIMBELL</span>
                      <span className="project-tech">AutoCAD, Revit, Enscape</span>
                    </li>
                    <li data-clickable="true" onClick={() => handleProjectClick('shuttle-stops', 'architecture')}>
                      <span className="project-name">SHUTTLE STOPS</span>
                      <span className="project-tech">SketchUp, Lumion, Photoshop</span>
                    </li>
                    <li data-clickable="true" onClick={() => handleProjectClick('citadel', 'architecture')}>
                      <span className="project-name">CITADEL</span>
                      <span className="project-tech">Rhino, V-Ray, InDesign</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Header;

