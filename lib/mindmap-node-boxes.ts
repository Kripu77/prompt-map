/**
 * This file provides a function to enhance markmap nodes with box backgrounds
 */

/**
 * Adds rectangular boxes behind markmap nodes' text
 * @param svg The SVG element containing the markmap
 * @param theme Current theme ('light' or 'dark')
 */
export const addNodeBoxes = (svg: SVGSVGElement, theme: string | undefined) => {
  if (!svg) return;

  // Remove any existing backgrounds to avoid duplication
  const existingBackgrounds = svg.querySelectorAll('.markmap-node-bg');
  existingBackgrounds.forEach(bg => bg.remove());

  // Add gradient definitions if they don't exist
  if (!svg.querySelector('defs')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Create gradient for light theme
    const lightGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    lightGradient.setAttribute('id', 'node-gradient-light');
    lightGradient.setAttribute('x1', '0%');
    lightGradient.setAttribute('y1', '0%');
    lightGradient.setAttribute('x2', '0%');
    lightGradient.setAttribute('y2', '100%');
    
    const lightStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    lightStop1.setAttribute('offset', '0%');
    lightStop1.setAttribute('stop-color', 'hsl(var(--card))');
    
    const lightStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    lightStop2.setAttribute('offset', '100%');
    lightStop2.setAttribute('stop-color', 'hsl(var(--muted))');
    
    lightGradient.appendChild(lightStop1);
    lightGradient.appendChild(lightStop2);
    
    // Create gradient for dark theme
    const darkGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    darkGradient.setAttribute('id', 'node-gradient-dark');
    darkGradient.setAttribute('x1', '0%');
    darkGradient.setAttribute('y1', '0%');
    darkGradient.setAttribute('x2', '0%');
    darkGradient.setAttribute('y2', '100%');
    
    const darkStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    darkStop1.setAttribute('offset', '0%');
    darkStop1.setAttribute('stop-color', 'hsl(var(--card))');
    
    const darkStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    darkStop2.setAttribute('offset', '100%');
    darkStop2.setAttribute('stop-color', 'hsl(var(--accent))');
    
    darkGradient.appendChild(darkStop1);
    darkGradient.appendChild(darkStop2);
    
    // Create filter for shadow effect
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'node-shadow');
    filter.setAttribute('x', '-20%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%');
    filter.setAttribute('height', '140%');
    
    const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
    feDropShadow.setAttribute('dx', '0');
    feDropShadow.setAttribute('dy', '1');
    feDropShadow.setAttribute('stdDeviation', '2');
    feDropShadow.setAttribute('flood-opacity', '0.3');
    feDropShadow.setAttribute('flood-color', 'rgba(0,0,0,0.5)');
    
    filter.appendChild(feDropShadow);
    
    defs.appendChild(lightGradient);
    defs.appendChild(darkGradient);
    defs.appendChild(filter);
    svg.appendChild(defs);
  }

  // Get all the text nodes
  const textNodes = svg.querySelectorAll('g.markmap-node > text');

  // Colors based on theme
  const isDarkTheme = theme === 'dark';
  const gradientId = isDarkTheme ? 'url(#node-gradient-dark)' : 'url(#node-gradient-light)';
  const borderColor = isDarkTheme ? 'hsl(var(--border))' : 'hsl(var(--border))';

  // Loop through each text node and add a background rectangle
  textNodes.forEach(textNode => {
    try {
      const parentNode = textNode.parentElement;
      if (!parentNode) return;

      // Get node depth - find classes like markmap-node-depth-1
      const depthClass = Array.from(parentNode.classList)
        .find(cls => cls.startsWith('markmap-node-depth-'));
      const depth = depthClass ? parseInt(depthClass.split('-').pop() || '0', 10) : 0;

      // Get text dimensions with a small padding that increases with depth
      const textBox = (textNode as SVGTextElement).getBBox();
      const paddingH = depth === 1 ? 12 : (depth === 2 ? 10 : 8); // Horizontal padding
      const paddingV = depth === 1 ? 8 : (depth === 2 ? 6 : 4);   // Vertical padding
      
      // Create background rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', (textBox.x - paddingH).toString());
      rect.setAttribute('y', (textBox.y - paddingV).toString());
      rect.setAttribute('width', (textBox.width + paddingH * 2).toString());
      rect.setAttribute('height', (textBox.height + paddingV * 2).toString());
      
      // Rounded corners - larger for main nodes, smaller for deeper nodes
      const cornerRadius = depth === 1 ? '8' : (depth === 2 ? '6' : '4');
      rect.setAttribute('rx', cornerRadius);
      rect.setAttribute('ry', cornerRadius);
      
      // Use gradient fill
      rect.setAttribute('fill', gradientId);
      
      // Add border
      const borderWidth = depth === 1 ? '1.5' : '1';
      rect.setAttribute('stroke', borderColor);
      rect.setAttribute('stroke-width', borderWidth);
      rect.setAttribute('class', 'markmap-node-bg');
      
      // Add shadow effect
      rect.setAttribute('filter', 'url(#node-shadow)');

      // Insert rectangle before text so text appears on top
      parentNode.insertBefore(rect, textNode);
      
      // Adjust text position slightly for better centering
      textNode.setAttribute('dy', '0.3em');
      
      // Make text slightly bolder for better readability on the background
      if (depth === 1) {
        textNode.setAttribute('font-weight', '600');
      } else if (depth === 2) {
        textNode.setAttribute('font-weight', '500');
      }
    } catch (error) {
      console.error('Error adding background to node:', error);
    }
  });
}; 