document.addEventListener('DOMContentLoaded', function() {
  const summarizeBtn = document.getElementById('summarize-btn');
  const loadingElem = document.getElementById('loading');
  const summaryContainer = document.getElementById('summary-container');
  const summaryContent = document.getElementById('summary-content');
  const errorContainer = document.getElementById('error-container');
  const errorText = document.getElementById('error-text');
  
  // Reading features elements
  const fontSelector = document.getElementById('font-selector');
  const fontSize = document.getElementById('font-size');
  const fontSizeValue = document.getElementById('font-size-value');
  const letterSpacing = document.getElementById('letter-spacing');
  const letterSpacingValue = document.getElementById('letter-spacing-value');
  const lineHeight = document.getElementById('line-height');
  const lineHeightValue = document.getElementById('line-height-value');
  const applyReadingSettings = document.getElementById('apply-reading-settings');
  const resetReadingSettings = document.getElementById('reset-reading-settings');
  
  // Initialize reading settings from storage
  initializeReadingSettings();
  
  // Add event listeners for reading features
  fontSize.addEventListener('input', function() {
    fontSizeValue.textContent = `${fontSize.value}%`;
  });
  
  letterSpacing.addEventListener('input', function() {
    letterSpacingValue.textContent = `${letterSpacing.value}px`;
  });
  
  lineHeight.addEventListener('input', function() {
    lineHeightValue.textContent = `${lineHeight.value}%`;
  });
  
  // Reset reading settings to default
  resetReadingSettings.addEventListener('click', async function() {
    // Default settings
    const defaultSettings = {
      font: 'default',
      fontSize: '50',
      letterSpacing: '0',
      lineHeight: '50'
    };
    
    // Apply default values to UI
    fontSelector.value = defaultSettings.font;
    fontSize.value = defaultSettings.fontSize;
    fontSizeValue.textContent = `${defaultSettings.fontSize}%`;
    letterSpacing.value = defaultSettings.letterSpacing;
    letterSpacingValue.textContent = `${defaultSettings.letterSpacing}px`;
    lineHeight.value = defaultSettings.lineHeight;
    lineHeightValue.textContent = `${defaultSettings.lineHeight}%`;
    
    // Save default settings to storage
    await chrome.storage.sync.set({ readingSettings: defaultSettings });
    
    // Apply default settings to current tab
    await applySettingsToCurrentTab(defaultSettings);
  });
  
  applyReadingSettings.addEventListener('click', async function() {
    const settings = {
      font: fontSelector.value,
      fontSize: fontSize.value,
      letterSpacing: letterSpacing.value,
      lineHeight: lineHeight.value
    };
    
    // Save settings to storage
    await chrome.storage.sync.set({ readingSettings: settings });
    
    // Apply settings to current tab
    await applySettingsToCurrentTab(settings);
  });
  
  // Add click event listener to summarize button
  summarizeBtn.addEventListener('click', async function() {
    // Reset UI
    summaryContainer.classList.add('hidden');
    errorContainer.classList.add('hidden');
    loadingElem.classList.remove('hidden');
    
    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Execute script in the active tab to get page content
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPageContent
      });
      
      // Get the extracted content from the result
      const extractedContent = result[0].result;
      
      if (!extractedContent) {
        throw new Error('No content could be extracted from the page');
      }
      
      // Send content to summarization API
      const summaryResponse = await summarizeContent(extractedContent);
      
      // Display the summary
      loadingElem.classList.add('hidden');
      summaryContainer.classList.remove('hidden');
      summaryContent.textContent = summaryResponse;
      
    } catch (error) {
      // Handle errors
      loadingElem.classList.add('hidden');
      errorContainer.classList.remove('hidden');
      errorText.textContent = error.message || 'An error occurred while summarizing the page';
      console.error('Summarization error:', error);
    }
  });
  
  // Function to extract content from the active page
  function extractPageContent() {
    // Get all paragraph and heading content from the page
    const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, article, section, main');
    let content = '';
    
    elements.forEach(element => {
      // Get the text content and remove extra whitespace
      const text = element.textContent.trim();
      if (text) {
        content += text + '\n\n';
      }
    });
    
    // If no paragraphs or headings were found, get all text from body
    if (!content) {
      content = document.body.innerText.trim();
    }
    
    return content;
  }
  
  // Function to send content to the summarization API
  async function summarizeContent(content) {
    const apiUrl = 'https://adhdapi.vercel.app/api';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: content })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // The API returns data in the format [{ output: "summary text" }]
    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      return data[0].output;
    } else {
      throw new Error('Unexpected API response format');
    }
  }
  
  // Function to initialize reading settings from storage
  async function initializeReadingSettings() {
    try {
      const data = await chrome.storage.sync.get('readingSettings');
      if (data.readingSettings) {
        fontSelector.value = data.readingSettings.font;
        fontSize.value = data.readingSettings.fontSize;
        fontSizeValue.textContent = `${data.readingSettings.fontSize}%`;
        letterSpacing.value = data.readingSettings.letterSpacing;
        letterSpacingValue.textContent = `${data.readingSettings.letterSpacing}px`;
        lineHeight.value = data.readingSettings.lineHeight;
        lineHeightValue.textContent = `${data.readingSettings.lineHeight}%`;
      }
    } catch (error) {
      console.error('Error loading reading settings:', error);
    }
  }
  
  // Function to apply reading settings to current tab
  async function applySettingsToCurrentTab(settings) {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Apply settings by injecting CSS and script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: applyReadingFeatures,
        args: [settings]
      });
      
    } catch (error) {
      console.error('Error applying reading settings:', error);
    }
  }
  
  // Function to be injected into the page to apply reading features
  function applyReadingFeatures(settings) {
    // Remove any previously applied styles
    const existingStyle = document.getElementById('adhd-helper-styles');
    if (existingStyle) {
      existingStyle.remove();
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
}); 

const youtubeActionBtn = document.getElementById('youtube-action-btn');
const youtubeResultContainer = document.getElementById('youtube-result-container');
const youtubeResultContent = document.getElementById('youtube-result-content');
const youtubeLoading = document.getElementById('youtube-loading');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'youtubeTranscriptSummary') {
    // Hide loading indicator
    youtubeLoading.classList.add('hidden');
    
    // Display the summary
    youtubeResultContainer.classList.remove('hidden');
    youtubeResultContent.textContent = request.summary;
  }
});

youtubeActionBtn.addEventListener('click', async function() {
  try {
    // Reset UI
    youtubeResultContainer.classList.add('hidden');
    youtubeLoading.classList.remove('hidden');
    
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if the URL is a YouTube video page
    if (tab.url.includes('youtube.com/watch')) {
      // Execute script in the active tab to interact with the page
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: interactWithYouTubePage
      });
    } else {
      youtubeLoading.classList.add('hidden');
      alert('This is not a YouTube video page.');
    }
  } catch (error) {
    youtubeLoading.classList.add('hidden');
    console.error('Error interacting with YouTube page:', error);
  }
});

async function interactWithYouTubePage() {
  // Define the summarizeContent function inside the injected context
  async function summarizeContent(content) {
    const apiUrl = 'https://adhdapi.vercel.app/api';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: content })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // The API returns data in the format [{ output: "summary text" }]
    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      return data[0].output;
    } else {
      throw new Error('Unexpected API response format');
    }
  }

  // Click the "More" button in the description if it exists
  const moreButton = document.querySelector('#expand.button.style-scope.ytd-text-inline-expander');
  if (moreButton) {
    moreButton.click();
  }

  // Click the "Transcript" button if it exists
  const transcriptButton = document.querySelector('.yt-spec-button-shape-next.yt-spec-button-shape-next--outline.yt-spec-button-shape-next--call-to-action.yt-spec-button-shape-next--size-m');
  if (transcriptButton) {
    transcriptButton.click();

    // Wait for the transcript to load and then read the text
    setTimeout(async () => {
      const start = Date.now();
      const transcriptSegments = document.querySelectorAll('.segment-text.style-scope.ytd-transcript-segment-renderer');
      let transcriptText = '';


      transcriptSegments.forEach(segment => {
        transcriptText += segment.textContent + '\n';
      });
      // Your code here



      if (transcriptText) {
        try {
          // Call summarizeContent with the transcript text
          const summarizeTranscript = await summarizeContent(transcriptText);
          
          // Send the summary back to the extension popup
          chrome.runtime.sendMessage({
            action: 'youtubeTranscriptSummary',
            summary: summarizeTranscript
          });
        } catch (error) {
          console.error('Error summarizing transcript:', error);
          chrome.runtime.sendMessage({
            action: 'youtubeTranscriptSummary',
            summary: 'Error: ' + error.message
          });
        }
      } else {
        chrome.runtime.sendMessage({
          action: 'youtubeTranscriptSummary',
          summary: 'No transcript found for this video.'
        });
      }
      const end = Date.now();
      console.log(`Time taken: ${end - start} ms`);
      
    }, 500); // Adjust timeout as needed for transcript to load
  } else {
    chrome.runtime.sendMessage({
      action: 'youtubeTranscriptSummary',
      summary: 'Could not find transcript button for this video.'
    });
  }
}
