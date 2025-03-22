/**
 * Utility functions for handling theme-related functionality
 */

/**
 * Applies theme-specific styles to SVG text elements
 */
export const applyTextStyles = (svg: SVGSVGElement, currentTheme: string | undefined) => {
  // Set a stronger text color based on theme
  const textColor = currentTheme === 'dark' ? '#ffffff' : '#000000';
  
  // Apply global styles for the markmap
  const markmapStyle = document.getElementById('markmap-dynamic-style');
  if (markmapStyle) {
    document.head.removeChild(markmapStyle);
  }
  
  // Create a new style element with strong selectors to override any conflicting styles
  const styleElement = document.createElement('style');
  styleElement.id = 'markmap-dynamic-style';
  styleElement.innerHTML = `
    svg.markmap text, 
    .markmap text, 
    .markmap-node text, 
    g.markmap-node > text,
    .markmap-node-text {
      fill: ${textColor} !important;
      color: ${textColor} !important;
      stroke: none !important;
    }
  `;
  document.head.appendChild(styleElement);
  
  // Also apply styles directly to all text elements
  const textElements = svg.querySelectorAll('text');
  textElements.forEach(textEl => {
    textEl.style.fill = textColor;
    textEl.setAttribute('fill', textColor);
    textEl.style.color = textColor;
    textEl.style.stroke = 'none';
    textEl.style.fontFamily = 'var(--font-sans)';
  });
  
  // Ensure the SVG parent element also has the correct theme attribute
  if (svg.parentElement) {
    svg.parentElement.setAttribute('data-theme', currentTheme || 'dark');
  }
  
  // Force a redraw of the SVG
  svg.style.display = 'none';
  void svg.getBoundingClientRect(); // Trigger reflow
  svg.style.display = '';
};

/**
 * Sets up fullscreen mode styles
 */
export const setupFullscreenStyles = () => {
  const fullscreenStyle = document.getElementById('mindmap-fullscreen-style');
  if (!fullscreenStyle) {
    const styleEl = document.createElement('style');
    styleEl.id = 'mindmap-fullscreen-style';
    styleEl.innerHTML = `
      .fullscreen-mindmap {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 100% !important;
        width: 100% !important;
        padding: 20px !important;
      }
      .fullscreen-mindmap svg.markmap {
        height: 100% !important;
        width: 100% !important;
        max-height: 100vh !important;
        max-width: 100vw !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
  
  return () => {
    const styleEl = document.getElementById('mindmap-fullscreen-style');
    if (styleEl) {
      document.head.removeChild(styleEl);
    }
  };
}; 