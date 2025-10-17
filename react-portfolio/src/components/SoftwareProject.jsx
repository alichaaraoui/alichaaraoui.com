import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import GridLines from './GridLines';
import Typewriter from './Typewriter';

const SoftwareProject = ({ darkMode }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [titleComplete, setTitleComplete] = useState(false);
  const [techComplete, setTechComplete] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTitleComplete(false);
    setTechComplete(false);
  }, [projectId]);

  const projectOrder = [
    'mobile-investment-guide-app',
    'wordl-app',
    'online-ordering-system',
    'achrakat-3d-game',
    'heloys',
    'omvra-studios',
    'portfolio'
  ];

  const currentIndex = projectOrder.indexOf(projectId);
  const prevProject = currentIndex > 0 ? projectOrder[currentIndex - 1] : null;
  const nextProject = currentIndex < projectOrder.length - 1 ? projectOrder[currentIndex + 1] : null;

  // Project data
  const projects = {
    'mobile-investment-guide-app': {
      title: 'MOBILE INVESTMENT GUIDE APP',
      tech: 'React Native, Firebase, Redux',
      year: '2024',
      role: 'Full Stack Developer',
      description: 'A comprehensive mobile application designed to guide users through investment strategies and portfolio management.',
      challenges: 'Building a real-time data sync system while maintaining offline functionality.',
      solution: 'Implemented Redux for state management and Firebase for real-time updates with offline support.',
    },
    'wordl-app': {
      title: 'WORDL APP',
      tech: 'Swift, UIKit, Core Data',
      year: '2023',
      role: 'iOS Developer',
      description: 'A word puzzle game built for iOS with daily challenges and user statistics tracking.',
      challenges: 'Creating smooth animations and managing local data persistence.',
      solution: 'Utilized Core Data for local storage and UIKit animations for fluid user experience.',
    },
    'online-ordering-system': {
      title: 'ONLINE ORDERING SYSTEM',
      tech: 'Node.js, Express, MongoDB, React',
      year: '2024',
      role: 'Full Stack Developer',
      description: 'A complete online ordering platform with real-time order tracking and payment integration.',
      challenges: 'Handling concurrent orders and maintaining data consistency.',
      solution: 'Implemented MongoDB transactions and WebSocket for real-time updates.',
    },
    'achrakat-3d-game': {
      title: 'ACHRAKAT 3D GAME',
      tech: 'Unity, C#, Blender',
      year: '2023',
      role: 'Game Developer',
      description: 'An immersive 3D gaming experience with custom character models and interactive environments.',
      challenges: 'Optimizing 3D assets for performance while maintaining visual quality.',
      solution: 'Created LOD systems and implemented efficient rendering techniques.',
    },
    'heloys': {
      title: 'HELOYS',
      tech: 'Fashion Brand Website',
      year: '2024',
      role: 'Web Developer & Designer',
      description: 'A stunning e-commerce website for a luxury fashion brand featuring elegant animations and seamless shopping experience.',
      challenges: 'Creating a unique shopping experience that reflects the brand\'s luxury identity.',
      solution: 'Designed custom animations and interactions that elevate the browsing experience.',
    },
    'omvra-studios': {
      title: 'OMVRA STUDIOS',
      tech: 'Creative Director Website',
      year: '2024',
      role: 'Web Developer & Designer',
      description: 'A portfolio website for a creative director showcasing work through immersive storytelling and dynamic layouts.',
      challenges: 'Presenting diverse creative work in a cohesive and engaging manner.',
      solution: 'Built a flexible grid system with custom transitions and scroll-based animations.',
    },
    'portfolio': {
      title: 'PORTFOLIO',
      tech: 'React, Vite, Framer Motion',
      year: '2025',
      role: 'Designer & Developer',
      description: 'A personal portfolio website showcasing architectural and software projects with a focus on minimalist design and smooth interactions.',
      challenges: 'Creating a unique grid system that works across desktop and mobile.',
      solution: 'Implemented custom React components with Framer Motion for fluid animations.',
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
      className="software-project-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GridLines darkMode={darkMode} />
      
      <div className="project-navigation">
        {prevProject && (
          <button className="nav-project-button prev" onClick={() => navigate(`/software/${prevProject}`)}>
            ←
          </button>
        )}
        {nextProject && (
          <button className="nav-project-button next" onClick={() => navigate(`/software/${nextProject}`)}>
            →
          </button>
        )}
      </div>

      <div className="software-project-container">
        <motion.div 
          className="software-project-header"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="software-project-title">
            <Typewriter 
              text={project.title} 
              delay={300}
              speed={30}
              onComplete={() => setTitleComplete(true)}
            />
          </h1>
          <p className="software-project-tech">
            <Typewriter 
              text={project.tech} 
              delay={titleComplete ? 200 : 9999999}
              speed={15}
              onComplete={() => setTechComplete(true)}
            />
          </p>
        </motion.div>

        <motion.div 
          className="software-project-meta"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {techComplete && (
            <>
              <div className="meta-item">
                <span className="meta-label">YEAR</span>
                <span className="meta-value">{project.year}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">ROLE</span>
                <span className="meta-value">{project.role}</span>
              </div>
            </>
          )}
        </motion.div>

        <motion.div 
          className="software-project-content"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {techComplete && (
            <>
              <div className="content-section">
                <h2>OVERVIEW</h2>
                <p>
                  <Typewriter 
                    text={project.description} 
                    delay={100}
                    speed={10}
                    showCursor={false}
                  />
                </p>
              </div>

              <div className="content-section">
                <h2>CHALLENGE</h2>
                <p>
                  <Typewriter 
                    text={project.challenges} 
                    delay={300}
                    speed={10}
                    showCursor={false}
                  />
                </p>
              </div>

              <div className="content-section">
                <h2>SOLUTION</h2>
                <p>
                  <Typewriter 
                    text={project.solution} 
                    delay={500}
                    speed={10}
                    showCursor={false}
                  />
                </p>
              </div>
            </>
          )}
        </motion.div>

        <motion.div 
          className="software-project-images"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="image-placeholder">
            <span>Image Gallery Coming Soon</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SoftwareProject;

