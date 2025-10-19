const GridLines = ({ darkMode, maxLines = 9 }) => {
  const lineColor = darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
  const isMobile = window.innerWidth <= 768;
  const margin = isMobile ? '20px' : '100px';
  const lineCount = Array.from({ length: maxLines + 1 }, (_, i) => i);

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
    <>
      {/* Vertical lines - adjusted for equal spacing */}
      <div style={{ ...verticalLineStyle, left: margin }}></div>
      {isMobile && (
        <>
          {/* Duplicate left line for mobile */}
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + 10px)` }}></div>
          {/* Duplicate right line for mobile */}
          <div style={{ ...verticalLineStyle, right: `calc(${margin} + 10px)` }}></div>
        </>
      )}
      {!isMobile && (
        <>
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.25 + 0px)` }}></div>
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.5 + 10px)` }}></div>
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.75 + 20px)` }}></div>
        </>
      )}
      <div style={{ ...verticalLineStyle, right: margin }}></div>

      {/* Duplicate vertical lines - 10px to the right of inner lines only (desktop) */}
      {!isMobile && (
        <>
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.25 + 10px)` }}></div>
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.5 + 20px)` }}></div>
          <div style={{ ...verticalLineStyle, left: `calc(${margin} + (100% - ${margin} * 2 - 30px) * 0.75 + 30px)` }}></div>
        </>
      )}

      {/* Horizontal lines - continuing down the page */}
      {lineCount.map((i) => (
        <div key={`h-${i}`} style={{ ...lineStyle, top: `${i * 40}vh` }}></div>
      ))}

      {/* Duplicate horizontal lines - 10px below each original line (skip first) */}
      {lineCount.slice(1).map((i) => (
        <div key={`h-dup-${i}`} style={{ ...lineStyle, top: `calc(${i * 40}vh + 10px)` }}></div>
      ))}

      {/* Horizontal lines connecting nav bar and name */}
      {!isMobile && (
        <>
          <div style={{ ...lineStyle, top: '20px' }}></div>
          <div style={{ ...lineStyle, top: 'calc(20px + 50px)' }}></div>
        </>
      )}
    </>
  );
};

export default GridLines;

