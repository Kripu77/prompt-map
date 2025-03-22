// Default styles for markmap text
// This file is imported at the top level of components that use markmap
// to ensure styles are applied before first render

export const setupDefaultStyles = () => {
  if (typeof window === 'undefined') return;
  
  // Create styles only if they don't already exist
  if (!document.getElementById('markmap-default-text-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'markmap-default-text-style';
    styleEl.innerHTML = `
      /* Force white text for dark mode by default */
      g.markmap-node > text {
        fill: white !important;
        color: white !important;
      }
      .markmap-node-text {
        fill: white !important;
        color: white !important;
      }
      [data-theme="light"] g.markmap-node > text,
      [data-theme="light"] .markmap-node-text {
        fill: black !important;
        color: black !important;
      }
      svg.markmap text {
        fill: white !important;
      }
      [data-theme="light"] svg.markmap text {
        fill: black !important;
      }
    `;
    
    // Add to the beginning of head for highest priority
    if (document.head.firstChild) {
      document.head.insertBefore(styleEl, document.head.firstChild);
    } else {
      document.head.appendChild(styleEl);
    }
  }
};

// Run automatically when imported
setupDefaultStyles(); 