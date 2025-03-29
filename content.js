// This script is injected into all web pages
// In the future, we can add features like text highlighting, 
// reading rulers, or other accessibility features here

// For now, this file is mainly a placeholder for future functionality
console.log('SimplifyIt content script loaded'); 

// It applies any saved reading preferences automatically on page load

// Apply saved reading settings
chrome.storage.sync.get('readingSettings', function(data) {
  if (data.readingSettings) {
    applyReadingFeatures(data.readingSettings);
  }
});

// Function to apply reading features
function applyReadingFeatures(settings) {
  // Remove any previously applied styles
  const existingStyle = document.getElementById('adhd-helper-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // If settings is default, remove any OpenDyslexic font link
  if (settings.font === 'default') {
    const fontLink = document.getElementById('opendyslexic-font');
    if (fontLink) {
      fontLink.remove();
    }
  }
  
  // Create a new style element
  const styleEl = document.createElement('style');
  styleEl.id = 'adhd-helper-styles';
  
  // Build CSS based on settings
  let css = '';
  
  // Font family setting
  if (settings.font !== 'default') {
    let fontFamily = '';
    switch (settings.font) {
      case 'opendyslexic':
        fontFamily = '"OpenDyslexic", sans-serif';
        // Add OpenDyslexic font if not present
        if (!document.getElementById('opendyslexic-font')) {
          const fontLink = document.createElement('link');
          fontLink.id = 'opendyslexic-font';
          fontLink.rel = 'stylesheet';
          fontLink.href = 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic.min.css';
          document.head.appendChild(fontLink);
        }
        break;
      case 'comic-sans':
        fontFamily = '"Comic Sans MS", "Comic Sans", cursive';
        break;
      case 'arial':
        fontFamily = 'Arial, sans-serif';
        break;
      case 'verdana':
        fontFamily = 'Verdana, sans-serif';
        break;
    }
    
    if (fontFamily) {
      css += `body, p, div, span, h1, h2, h3, h4, h5, h6, li, a { font-family: ${fontFamily} !important; }\n`;
    }
  }
  
  // Font size setting
  if (settings.fontSize > 0) {
    // Adjust so that 50 is medium size (1.0em)
    // Values 0-50 scale from 0.5em to 1.0em
    // Values 51-100 scale from 1.0em to 2.0em
    const sizeFactor = settings.fontSize <= 50 
      ? 0.5 + (settings.fontSize / 100) 
      : 1.0 + ((settings.fontSize - 50) / 50);
    css += `body, p, div, span, li, a { font-size: ${sizeFactor}em !important; }\n`;
  }
  
  // Letter spacing setting
  if (settings.letterSpacing > 0) {
    css += `body, p, div, span, h1, h2, h3, h4, h5, h6, li, a { letter-spacing: ${settings.letterSpacing}px !important; }\n`;
  }
  
  // Line height setting
  if (settings.lineHeight > 0) {
    const lineHeightValue = (settings.lineHeight / 100) * 200 + 100; // Maps 0-100 to 100-300% for line height
    css += `body, p, div, span, li { line-height: ${lineHeightValue}% !important; }\n`;
  }
  
  // Apply the styles
  styleEl.textContent = css;
  document.head.appendChild(styleEl);
  
  return true;
} 