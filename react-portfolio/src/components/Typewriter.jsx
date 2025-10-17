import { useState, useEffect } from 'react';

const Typewriter = ({ 
  text, 
  delay = 0, 
  speed = 30, 
  className = '', 
  onComplete, 
  showCursor = true,
  instantMode = false // For very long text, show instantly
}) => {
  const [displayedText, setDisplayedText] = useState(instantMode ? text : '');
  const [currentIndex, setCurrentIndex] = useState(instantMode ? text.length : 0);
  const [hasStarted, setHasStarted] = useState(instantMode);
  const [isComplete, setIsComplete] = useState(instantMode);

  useEffect(() => {
    if (instantMode) {
      if (onComplete) {
        setTimeout(() => onComplete(), 0);
      }
      return;
    }

    const startTimeout = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay, instantMode, onComplete]);

  useEffect(() => {
    if (instantMode || !hasStarted || currentIndex >= text.length) {
      if (currentIndex >= text.length && !isComplete) {
        setIsComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, hasStarted, text, speed, onComplete, isComplete, instantMode]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && hasStarted && !isComplete && <span className="typewriter-cursor"></span>}
    </span>
  );
};

export default Typewriter;

