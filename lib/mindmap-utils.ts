import { Markmap } from 'markmap-view';
import { RefObject } from 'react';
import { transformer } from './markmap';
import { toast } from 'sonner';

// Theme-related utilities
export const applyThemeStyles = (
  svg: SVGSVGElement,
  theme: string | undefined
) => {
  // Set SVG color based on theme
  svg.style.color = theme === 'dark' ? 'white' : 'black';

  // Apply to all text elements
  const textElements = svg.querySelectorAll('text');
  textElements.forEach(el => {
    el.style.fill = theme === 'dark' ? 'white' : 'black';
    el.setAttribute('fill', theme === 'dark' ? 'white' : 'black');
  });

  // Add ID for better CSS targeting if not already present
  if (!svg.id) {
    svg.id = 'mindmap-svg';
  }

  // Add direct style for theme-specific colors
  const existingStyle = document.getElementById('mindmap-theme-style');
  if (existingStyle) {
    document.head.removeChild(existingStyle);
  }

  const textStyle = document.createElement('style');
  textStyle.id = 'mindmap-theme-style';
  textStyle.textContent = `
    #mindmap-svg text, #mindmap-svg g {
      fill: ${theme === 'dark' ? 'white' : 'black'} !important;
      color: ${theme === 'dark' ? 'white' : 'black'} !important;
    }
  `;
  document.head.appendChild(textStyle);
};

// Enhanced fit function that properly scales the content based on its size
export const fitContent = (
  svg: SVGSVGElement | null
) => {
  if (!svg) return;
  
  try {
    // Define a type for the expected data structure
    interface MarkmapData {
      fit: () => void;
    }
    
    const svgWithData = svg as SVGSVGElement & { __data__?: MarkmapData };
    const markmapDataObj = svgWithData.__data__;
    
    if (markmapDataObj?.fit && typeof markmapDataObj.fit === 'function') {
      markmapDataObj.fit();
    }
  } catch (error) {
    console.error('Error fitting content:', error);
  }
};

// Initialize the markmap with proper theme handling
export const initializeMarkmap = (
  data: string,
  svgRef: RefObject<SVGSVGElement | null>,
  markmapRef: RefObject<Markmap | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  theme: string | undefined,
) => {
  if (!svgRef.current) return;
  
  if (!markmapRef.current) {
    // Create the markmap instance
    const mm = Markmap.create(svgRef.current);
    
    // Store in ref
    if ('current' in markmapRef) {
      markmapRef.current = mm;
    }
  }
  
  // Apply theme styles
  applyThemeStyles(svgRef.current, theme);
  
  // Transform and set data
  const { root } = transformer.transform(data);
  markmapRef.current?.setData(root);
  
  // Ensure the mindmap is properly scaled and centered
  setTimeout(() => {
    if (markmapRef.current) {
      fitContent(svgRef.current);
      
      // Additional check after a brief delay to ensure proper rendering
      setTimeout(() => {
        if (markmapRef.current) {
          fitContent(svgRef.current);
        }
      }, 500);
    }
  }, 100);
};

// Export the mindmap as an image
export function exportMindmap(
  svg: SVGSVGElement | null,
  theme: string | undefined,
  title?: string
) {
  if (!svg || !svg.parentElement) return;
  
  try {
    // Get current scroll position
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    // Get the title from document if not provided
    if (!title) {
      const titleElement = document.querySelector('h1');
      if (titleElement) {
        title = titleElement.textContent || 'Mind Map';
      } else {
        title = 'Mind Map';
      }
    }
    
    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '0';
    tempContainer.style.left = '0';
    // Make it wider to accommodate the title and padding
    tempContainer.style.width = `${svg.clientWidth + 100}px`; // Add extra width padding
    // Add height for title and padding
    tempContainer.style.height = `${svg.clientHeight + 150}px`; // Extra space for title and padding
    tempContainer.style.backgroundColor = theme === 'dark' ? '#000' : '#fff';
    tempContainer.style.zIndex = '-1000';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.overflow = 'visible'; // Ensure we don't clip any content
    tempContainer.style.display = 'flex';
    tempContainer.style.flexDirection = 'column';
    tempContainer.style.alignItems = 'center';
    tempContainer.style.padding = '60px 40px'; // Increased padding
    
    // Add the title
    const titleDiv = document.createElement('div');
    titleDiv.textContent = title;
    titleDiv.style.fontSize = '28px'; // Increased font size
    titleDiv.style.fontWeight = 'bold';
    titleDiv.style.marginBottom = '30px'; // More space between title and content
    titleDiv.style.color = theme === 'dark' ? 'white' : 'black';
    titleDiv.style.fontFamily = 'sans-serif';
    titleDiv.style.textAlign = 'center';
    titleDiv.style.width = '100%';
    tempContainer.appendChild(titleDiv);
    
    // Create an SVG container div to maintain layout
    const svgContainer = document.createElement('div');
    svgContainer.style.flex = '1';
    svgContainer.style.width = '100%';
    svgContainer.style.display = 'flex';
    svgContainer.style.alignItems = 'center';
    svgContainer.style.justifyContent = 'center';
    
    // Clone the SVG with its data
    const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
    clonedSvg.style.width = '100%';
    clonedSvg.style.height = '100%';
    clonedSvg.style.maxWidth = 'none';
    clonedSvg.style.maxHeight = 'none';
    clonedSvg.style.overflow = 'visible';
    
    // Get a more accurate bounding box of all content
    const bbox = svg.getBBox();
    // Add padding to the viewBox
    const padding = Math.max(bbox.width, bbox.height) * 0.1; // 10% padding
    
    // Set SVG viewBox attribute with padding to ensure entire content is captured
    clonedSvg.setAttribute('viewBox', 
      `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding*2} ${bbox.height + padding*2}`);
    
    // Make sure all elements are visible
    const allElements = clonedSvg.querySelectorAll('*');
    allElements.forEach(el => {
      if (el instanceof SVGElement) {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
      }
    });
    
    // Set text color based on theme
    const textColor = theme === 'dark' ? 'white' : 'black';
    const textElements = clonedSvg.querySelectorAll('text');
    textElements.forEach(textEl => {
      textEl.style.fill = textColor;
      textEl.setAttribute('fill', textColor);
    });
    
    // Set path colors for lines
    const pathElements = clonedSvg.querySelectorAll('path');
    pathElements.forEach(pathEl => {
      // Keep original stroke color
      if (pathEl.getAttribute('stroke')) {
        pathEl.style.strokeOpacity = '1';
      }
    });
    
    // Add SVG to the container
    svgContainer.appendChild(clonedSvg);
    tempContainer.appendChild(svgContainer);
    document.body.appendChild(tempContainer);
    
    // Force browser to process layout
    void tempContainer.offsetWidth;
    
    // Use html-to-image library
    import('html-to-image').then(({ toPng }) => {
      toPng(tempContainer, { 
        backgroundColor: theme === 'dark' ? '#000' : '#fff',
        quality: 1,
        pixelRatio: 2, // For higher quality
        width: tempContainer.clientWidth,
        height: tempContainer.clientHeight,
        style: {
          // Preserve all styles
          transform: 'none',
          overflow: 'visible'
        }
      })
        .then(dataUrl => {
          // Create a sanitized filename from the title
          const sanitizedTitle = title
            ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30)
            : 'mindmap';
            
          const link = document.createElement('a');
          link.download = `${sanitizedTitle}.png`;
          link.href = dataUrl;
          link.click();
          
          toast.success('Mind map exported successfully');
        })
        .catch((error) => {
          console.error('Error generating PNG:', error);
          toast.error('Failed to export mind map');
        })
        .finally(() => {
          document.body.removeChild(tempContainer);
          // Restore scroll position
          window.scrollTo(scrollX, scrollY);
        });
    });
  } catch (error) {
    console.error('Error exporting mindmap:', error);
    toast.error('Failed to export mind map');
  }
}

// Handle zoom operations
export const zoomIn = (
  svg: SVGSVGElement | null,
  factor: number = 1.25
) => {
  if (!svg) return;
  
  try {
    // Define a type for the data structure
    interface MarkmapData {
      zoom?: {
        transform: Record<string, any>;
        scaleBy: (element: SVGSVGElement, factor: number) => void;
      };
      rescale?: (factor: number) => void;
    }

    const svgWithData = svg as SVGSVGElement & { __data__?: MarkmapData };
    const markmapDataObj = svgWithData.__data__;
    
    if (markmapDataObj?.zoom && typeof markmapDataObj.zoom.scaleBy === 'function') {
      // Scale without referencing k
      markmapDataObj.zoom.scaleBy(svg, factor);
    } else if (markmapDataObj?.rescale && typeof markmapDataObj.rescale === 'function') {
      markmapDataObj.rescale(factor);
    }
  } catch (error) {
    console.error('Error zooming in:', error);
  }
};

export const zoomOut = (
  svg: SVGSVGElement | null,
  factor: number = 0.8
) => {
  if (!svg) return;
  
  try {
    // Define a type for the data structure
    interface MarkmapData {
      zoom?: {
        transform: Record<string, any>;
        scaleBy: (element: SVGSVGElement, factor: number) => void;
      };
      rescale?: (factor: number) => void;
    }

    const svgWithData = svg as SVGSVGElement & { __data__?: MarkmapData };
    const markmapDataObj = svgWithData.__data__;
    
    if (markmapDataObj?.zoom && typeof markmapDataObj.zoom.scaleBy === 'function') {
      // Scale without referencing k
      markmapDataObj.zoom.scaleBy(svg, factor);
    } else if (markmapDataObj?.rescale && typeof markmapDataObj.rescale === 'function') {
      markmapDataObj.rescale(factor);
    }
  } catch (error) {
    console.error('Error zooming out:', error);
  }
};

// Handle fullscreen toggling
export const toggleFullscreen = (
  element: HTMLElement | null
) => {
  if (!element) return;
  
  try {
    if (!document.fullscreenElement) {
      // Add current theme class to the element before entering fullscreen
      const isDarkTheme = document.documentElement.classList.contains('dark');
      
      // Clear existing theme classes and add the current one
      element.classList.remove('light-theme', 'dark-theme');
      element.classList.add(isDarkTheme ? 'dark-theme' : 'light-theme');
      
      // Request fullscreen
      element.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  } catch (error) {
    console.error('Error toggling fullscreen:', error);
  }
}; 