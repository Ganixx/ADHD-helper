// Background service worker for the extension
// This script runs in the background while the extension is active

// Initialize the extension when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Focus Assist extension installed');
  
  // Set default settings if needed
  chrome.storage.sync.get('settings', (data) => {
    if (!data.settings) {
      const defaultSettings = {
        fontSize: '50',
        fontType: 'default',
        colorMode: 'default'
      };
      
      chrome.storage.sync.set({ settings: defaultSettings });
    }
  });
});

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSummary') {
    // For future use - if we want to handle API requests here instead of in popup.js
    sendResponse({ status: 'received' });
  }
  
  // Always return true for async response
  return true;
}); 