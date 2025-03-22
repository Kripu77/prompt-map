/**
 * Utility functions for handling theme-related functionality
 */

/**
 * Applies theme-specific styles to SVG text elements
 * Note: Direct DOM manipulation is still needed for SVG elements as Tailwind classes cannot
 * be directly applied to dynamically created SVG elements in this context
 */
export const applyTextStyles = (svg: SVGSVGElement, currentTheme: string | undefined) => {
  // Set a stronger text color based on theme
  const textColor = currentTheme === 'dark' ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))';
  
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
      font-family: var(--font-sans);
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
 * Sets up fullscreen mode styles that respect the current theme
 */
export const setupFullscreenStyles = () => {
  // Clean up existing styles if present
  const existingStyle = document.getElementById('mindmap-fullscreen-style');
  if (existingStyle) {
    document.head.removeChild(existingStyle);
  }
  
  // Create fullscreen styles with explicit light and dark mode handling
  const styleEl = document.createElement('style');
  styleEl.id = 'mindmap-fullscreen-style';
  styleEl.innerHTML = `
    /* Base styles for fullscreen mode */
    .fullscreen-mindmap {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 50 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 20px !important;
      /* Default to dark background as fallback */
      background-color: #121212 !important;
    }
    
    /* Using explicit theme classes applied to the element directly */
    .fullscreen-mindmap.light-theme {
      background-color: white !important;
    }
    
    .fullscreen-mindmap.dark-theme {
      background-color: #121212 !important;
    }
    
    /* Also keep the root-based selectors for compatibility */
    :root:not(.dark) .fullscreen-mindmap {
      background-color: white !important;
    }
    
    .dark .fullscreen-mindmap {
      background-color: #121212 !important;
    }
    
    .fullscreen-mindmap svg.markmap {
      height: 100% !important;
      width: 100% !important;
      max-height: 100vh !important;
      max-width: 100vw !important;
    }
  `;
  document.head.appendChild(styleEl);
  
  // Update the current document body with the theme indicator class
  // This ensures the fullscreen styles can target the current theme
  const updateThemeIndicator = () => {
    const isDarkTheme = document.documentElement.classList.contains('dark');
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Call immediately and set up an observer for theme changes
  updateThemeIndicator();
  
  return () => {
    const styleEl = document.getElementById('mindmap-fullscreen-style');
    if (styleEl) {
      document.head.removeChild(styleEl);
    }
  };
}; 