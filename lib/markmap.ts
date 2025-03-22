import { loadCSS, loadJS } from 'markmap-common';
import { Transformer } from 'markmap-lib';
import * as markmap from 'markmap-view';

// Create a transformer with default settings
export const transformer = new Transformer();

// Add custom styles with more aggressive selectors to ensure text visibility
const customStyles = `
  /* Base styles for all text elements in markmap */
  svg.markmap text,
  .markmap text,
  .markmap-node text,
  g.markmap-node > text,
  .markmap-node-text {
    fill: white !important;
    color: white !important;
    stroke: none !important;
  }
  
  /* Light theme overrides */
  html[data-theme="light"] svg.markmap text,
  html[data-theme="light"] .markmap text,
  html[data-theme="light"] .markmap-node text,
  html[data-theme="light"] g.markmap-node > text,
  html[data-theme="light"] .markmap-node-text,
  [data-theme="light"] svg.markmap text,
  [data-theme="light"] .markmap text,
  [data-theme="light"] .markmap-node text,
  [data-theme="light"] g.markmap-node > text,
  [data-theme="light"] .markmap-node-text {
    fill: black !important;
    color: black !important;
    stroke: none !important;
  }
  
  /* Ensure parent SVG has correct color settings */
  svg.markmap {
    color: white;
  }
  
  html[data-theme="light"] svg.markmap,
  [data-theme="light"] svg.markmap {
    color: black;
  }
`;

// Apply custom styles immediately when this module is imported
if (typeof window !== 'undefined') {
  // Check if style already exists to prevent duplicates
  const existingStyle = document.getElementById('markmap-text-fix');
  if (!existingStyle) {
    const styleElement = document.createElement('style');
    styleElement.id = 'markmap-text-fix';
    styleElement.innerHTML = customStyles;
    
    // Insert at the top of head for higher priority
    if (document.head.firstChild) {
      document.head.insertBefore(styleElement, document.head.firstChild);
    } else {
      document.head.appendChild(styleElement);
    }
  }
}

const { scripts, styles } = transformer.getAssets();

if (typeof window !== 'undefined' && styles && scripts) {
  loadCSS(styles);
  loadJS(scripts, { getMarkmap: () => markmap });
}



