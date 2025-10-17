import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = ({ darkMode }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Check if hovering over any interactive element
      const target = e.target;
      let element = target;
      let isInteractive = false;
      
      while (element && element !== document.body) {
        // Check for interactive elements, classes, and data attributes
        if (element.tagName === 'A' || 
            element.tagName === 'BUTTON' ||
            element.hasAttribute('data-clickable') ||
            element.hasAttribute('data-interactive') ||
            element.classList?.contains('nav-link') ||
            element.classList?.contains('nav-logo') ||
            element.classList?.contains('project-name') ||
            element.classList?.contains('project-tech') ||
            element.classList?.contains('dark-mode-toggle') ||
            element.classList?.contains('contact-item')) {
          isInteractive = true;
          break;
        }
        
        // Special check for LI elements in project lists
        if (element.tagName === 'LI') {
          const parent = element.parentElement;
          if (parent && parent.classList?.contains('project-items')) {
            isInteractive = true;
            break;
          }
        }
        
        element = element.parentElement;
      }
      
      setIsHovering(isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const cursorColor = darkMode ? '#ffffff' : '#000000';

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="custom-cursor-dot"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          scale: isHovering ? 0.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
        style={{
          backgroundColor: cursorColor,
        }}
      />
      
      {/* Outer cursor circle */}
      <motion.div
        className="custom-cursor-outline"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1,
        }}
        style={{
          borderColor: cursorColor,
          backgroundColor: isHovering ? cursorColor : 'transparent',
          opacity: 1,
        }}
      />
    </>
  );
};

export default CustomCursor;

