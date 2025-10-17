import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import GridLines from './GridLines';
import Typewriter from './Typewriter';

const ArchitectureProject = ({ darkMode }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [titleComplete, setTitleComplete] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTitleComplete(false);
  }, [projectId]);

  const projectOrder = [
    'celine',
    'carved-ft-the-kimbell',
    'shuttle-stops',
    'citadel'
  ];

  const currentIndex = projectOrder.indexOf(projectId);
  const prevProject = currentIndex > 0 ? projectOrder[currentIndex - 1] : null;
  const nextProject = currentIndex < projectOrder.length - 1 ? projectOrder[currentIndex + 1] : null;

  // Project data
  const projects = {
    'celine': {
      title: 'CELINE',
      tech: 'Rhino, Grasshopper, V-Ray',
      year: '2023',
      location: 'Charlotte, NC',
      type: 'Theater Design',
      area: 'Carolina Theater Renovation',
      award: 'AIA Advanced Design Award',
      awardLogo: '/react-portfolio/CELINE/AIA_Award.png', // Will invert for light mode
      description: 'The Celine Carolina Theater emerges from the act of crumpling. Lifts and folds create thresholds and clear entryways, guiding circulation as if movement itself were choreographed. Nested layers of crumplings carve out space for performance, ranging from intimate experiences to grand stages. The building becomes both stage and scenography, where every fold directs, every lift frames, and every nest houses.',
      concept: 'An interpretation of what the future of theater is versus that of the 1960s Original Carolina Theater for blackbox movies and celebrity acts. The design translates the logic of crumpled surfaces into spatial and structural systems through dry connections—overlaps, interlocking joints, and clips. The folded surfaces begin to span, lean, and overlap, creating moments of enclosure and openness, transforming irregular, crumpled geometries into self-supporting volumes.',
      heroImage: '/react-portfolio/CELINE/CelineCover.png',
      images: {
        paperTectonics: '/react-portfolio/CELINE/paper-tectonics.png',
        paperModels: '/react-portfolio/CELINE/paper-models.png',
        surfaceTectonics: '/react-portfolio/CELINE/surface-tectonics.jpg',
        architecturalForm: '/react-portfolio/CELINE/architectural-form.jpg',
        structureDetails: '/react-portfolio/CELINE/structure-details.jpg',
      },
      galleryImages: [], // Will be populated dynamically
    },
    'carved-ft-the-kimbell': {
      title: 'CARVED FT. THE KIMBELL',
      tech: 'AutoCAD, Revit, Enscape',
      year: '2023',
      location: 'Fort Worth, TX',
      type: 'Museum Expansion',
      area: '15,000 sq ft',
      description: 'An architectural study exploring the relationship between light and form, inspired by the Kimbell Art Museum.',
      concept: 'Carved volumes create dynamic spaces that change throughout the day with natural light.',
    },
    'shuttle-stops': {
      title: 'SHUTTLE STOPS',
      tech: 'SketchUp, Lumion, Photoshop',
      year: '2022',
      location: 'Charlotte, NC',
      type: 'Public Infrastructure',
      area: '200 sq ft each',
      description: 'A series of modern bus shelter designs that prioritize user comfort and sustainability.',
      concept: 'Modular design system that can adapt to different urban contexts while maintaining visual identity.',
    },
    'citadel': {
      title: 'CITADEL',
      tech: 'Rhino, V-Ray, InDesign',
      year: '2023',
      location: 'Conceptual',
      type: 'Mixed-Use Development',
      area: '50,000 sq ft',
      description: 'A fortress-inspired mixed-use development combining residential, commercial, and public spaces.',
      concept: 'Strong geometries and layered spaces create a sense of protection while maintaining openness.',
    },
  };

  const project = projects[projectId];

  if (!project) {
    return (
      <div className="project-not-found">
        <h1>Project Not Found</h1>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <motion.div 
      className="architecture-project-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GridLines darkMode={darkMode} />
      
      <div className="project-navigation">
        {prevProject && (
          <button className="nav-project-button prev" onClick={() => navigate(`/architecture/${prevProject}`)}>
            ←
          </button>
        )}
        {nextProject && (
          <button className="nav-project-button next" onClick={() => navigate(`/architecture/${nextProject}`)}>
            →
          </button>
        )}
      </div>

      <div className="architecture-project-container">
        {/* Full screen hero image area */}
        <motion.div 
          className="architecture-hero"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {project.heroImage ? (
            <img 
              src={project.heroImage} 
              alt={project.title}
              className="hero-image"
            />
          ) : (
            <div className="hero-image-placeholder">
              <span>Hero Image</span>
            </div>
          )}
          <div className="hero-overlay">
            <h1 className="architecture-title">
              <Typewriter 
                text={project.title} 
                delay={500}
                speed={40}
                onComplete={() => setTitleComplete(true)}
              />
            </h1>
          </div>
        </motion.div>

        {/* Project details with concept statement */}
        <motion.div 
          className={project.title === 'CELINE' ? "architecture-details-with-concept" : "architecture-details"}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {titleComplete && (
            <>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">YEAR</span>
                  <span className="detail-value">{project.year}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">LOCATION</span>
                  <span className="detail-value">{project.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">TYPE</span>
                  <span className="detail-value">{project.type}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">AREA</span>
                  <span className="detail-value">{project.area}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">TOOLS</span>
                  <span className="detail-value">{project.tech}</span>
                </div>
              </div>
              
              {project.title === 'CELINE' && (
                <div className="concept-statement-sidebar">
                  <h2>CONCEPT STATEMENT</h2>
                  <p className="concept-statement-text">
                    <Typewriter 
                      text="Carolina Theater invites you to experience a performance like no other. A crumpled stage, a chaotic feeling, everywhere all at the same time. The whole building is the star, the show, the circus." 
                      delay={300}
                      speed={10}
                      showCursor={false}
                    />
                  </p>
                  {project.award && (
                    <div className="award-section">
                      <div className="award-content">
                        {project.awardLogo && (
                          <img 
                            src={project.awardLogo} 
                            alt="AIA Award Logo" 
                            className="aia-logo"
                          />
                        )}
                        <div className="award-text">
                          <div className="award-line1">AIA 2025</div>
                          <div className="award-line2">Advanced Design Award</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Paper Tectonics & Models Section */}
        {titleComplete && project.title === 'CELINE' && (
          <motion.div 
            className="case-study-layout"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="case-study-text-section">
              <h2>PAPER TECTONICS</h2>
              <p className="case-study-text">
                <Typewriter 
                  text="The process began with studying rules of crumpling and testing their reproducibility both physically and digitally. Working between paper models and Rhino simulations, each variation emphasized the importance of simplification—if a surface could not be built in both mediums, its logic had to be refined." 
                  delay={400}
                  speed={10}
                  showCursor={false}
                />
              </p>
              <h2>PAPER MODELS</h2>
              <p className="case-study-text">
                <Typewriter 
                  text="This balance of material intuition and digital precision created a framework where spontaneity became systematic." 
                  delay={600}
                  speed={10}
                  showCursor={false}
                />
              </p>
            </div>
            <div className="case-study-image">
              {project.images?.paperTectonics ? (
                <img src={project.images.paperTectonics} alt="Paper Tectonics" className="case-study-img" />
              ) : (
                <div className="image-placeholder">
                  <span>Paper Tectonics</span>
                </div>
              )}
              {project.images?.paperModels ? (
                <img src={project.images.paperModels} alt="Paper Models Study" className="case-study-img" />
              ) : (
                <div className="image-placeholder">
                  <span>Paper Models Study</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Concept Section */}
        {titleComplete && project.title === 'CELINE' && (
          <motion.div 
            className="case-study-layout reverse"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="case-study-image">
              {project.images?.surfaceTectonics ? (
                <img src={project.images.surfaceTectonics} alt="Surface Tectonics" className="case-study-img" />
              ) : (
                <div className="image-placeholder">
                  <span>Surface Tectonics</span>
                </div>
              )}
            </div>
            <div className="case-study-text-section">
              <h2>SURFACE TECTONICS</h2>
              <p className="case-study-text">
                <Typewriter 
                  text="Translating the logic of crumpled surfaces into spatial and structural systems by experimenting with bridging, multiplying, and extending surfaces." 
                  delay={800}
                  speed={10}
                  showCursor={false}
                />
              </p>
              <p className="case-study-text">
                <Typewriter 
                  text="The models relied on dry connections—overlaps, interlocking joints, and clips. The folded surfaces begin to span, lean, and overlap, creating moments of enclosure and openness." 
                  delay={1000}
                  speed={10}
                  showCursor={false}
                />
              </p>
              <p className="case-study-text">
                <Typewriter 
                  text="Not abstract forms but now walls, slabs, and structural systems, hinting at how surface manipulations can evolve into inhabitable space." 
                  delay={1200}
                  speed={10}
                  showCursor={false}
                />
              </p>
            </div>
          </motion.div>
        )}

        {/* Design Methodology Section with Image */}
        {titleComplete && project.title === 'CELINE' && (
          <motion.div 
            className="case-study-layout"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="case-study-text-section">
              <h2>ARCHITECTURAL FORM</h2>
              <p className="case-study-text">
                <Typewriter 
                  text="The Celine Carolina Theater emerges from the act of crumpling. Lifts and folds create thresholds and clear entryways, guiding circulation as if movement itself were choreographed." 
                  delay={1400}
                  speed={10}
                  showCursor={false}
                />
              </p>
              <p className="case-study-text">
                <Typewriter 
                  text="Nested layers of crumplings carve out space for performance, ranging from intimate experiences to grand stages. The building becomes both stage and scenography, where every fold directs, every lift frames, and every nest houses." 
                  delay={1600}
                  speed={10}
                  showCursor={false}
                />
              </p>
            </div>
            <div className="case-study-image">
              {project.images?.architecturalForm ? (
                <img src={project.images.architecturalForm} alt="Architectural Form" className="case-study-img" />
              ) : (
                <div className="image-placeholder">
                  <span>Design Process</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Structural System Section */}
        {titleComplete && project.title === 'CELINE' && (
          <motion.div 
            className="case-study-layout reverse"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="case-study-image">
              {project.images?.structureDetails ? (
                <img src={project.images.structureDetails} alt="Structure Details" className="case-study-img" />
              ) : (
                <div className="image-placeholder">
                  <span>Structure Details</span>
                </div>
              )}
            </div>
            <div className="case-study-text-section">
              <h2>STRUCTURAL SYSTEM</h2>
              <p className="case-study-text">
                <Typewriter 
                  text="The design translates crumpled surfaces into spatial and structural systems through dry connections—overlaps, interlocking joints, and clips. The folded surfaces begin to span, lean, and overlap, creating moments of enclosure and openness." 
                  delay={1300}
                  speed={10}
                  showCursor={false}
                />
              </p>
              <p className="case-study-text">
                <Typewriter 
                  text="Transforming irregular, crumpled geometries into self-supporting volumes that hint at how surface manipulations can evolve into inhabitable space." 
                  delay={1500}
                  speed={10}
                  showCursor={false}
                />
              </p>
            </div>
          </motion.div>
        )}

        {/* Program Section - Full Width */}
        {titleComplete && project.title === 'CELINE' && (
          <motion.div 
            className="case-study-full-width"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <h2>PROGRAM</h2>
            <div className="program-grid">
              <div className="program-column">
                <p className="program-item">
                  <Typewriter 
                    text="Rooftop Bar" 
                    delay={1700}
                    speed={15}
                    showCursor={false}
                  />
                </p>
                <p className="program-item">
                  <Typewriter 
                    text="Immersive Dining" 
                    delay={1900}
                    speed={15}
                    showCursor={false}
                  />
                </p>
                <p className="program-item">
                  <Typewriter 
                    text="Gallery Event Hall" 
                    delay={2100}
                    speed={15}
                    showCursor={false}
                  />
                </p>
              </div>
              <div className="program-column">
                <p className="program-item">
                  <Typewriter 
                    text="Admin Offices" 
                    delay={2300}
                    speed={15}
                    showCursor={false}
                  />
                </p>
                <p className="program-item">
                  <Typewriter 
                    text="Lobby - Immersive Stage" 
                    delay={2500}
                    speed={15}
                    showCursor={false}
                  />
                </p>
                <p className="program-item">
                  <Typewriter 
                    text="Lobby - Ticketing" 
                    delay={2700}
                    speed={15}
                    showCursor={false}
                  />
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Standard Description for other projects */}
        {titleComplete && project.title !== 'CELINE' && (
          <motion.div 
            className="architecture-description"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2>CONCEPT</h2>
            <p className="concept-text">
              <Typewriter 
                text={project.concept} 
                delay={200}
                speed={10}
                showCursor={false}
              />
            </p>
            <p className="description-text">
              <Typewriter 
                text={project.description} 
                delay={400}
                speed={10}
                showCursor={false}
              />
            </p>
          </motion.div>
        )}

        {/* Image gallery */}
        <motion.div 
          className="architecture-gallery"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="gallery-grid">
            <div className="gallery-image-placeholder">Image 1</div>
            <div className="gallery-image-placeholder">Image 2</div>
            <div className="gallery-image-placeholder">Image 3</div>
            <div className="gallery-image-placeholder">Image 4</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ArchitectureProject;

