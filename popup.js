document.addEventListener('DOMContentLoaded', function() {
  const summarizeBtn = document.getElementById('summarize-btn');
  const loadingElem = document.getElementById('loading');
  const summaryContainer = document.getElementById('summary-container');
  const summaryContent = document.getElementById('summary-content');
  const errorContainer = document.getElementById('error-container');
  const errorText = document.getElementById('error-text');
  
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
    const apiUrl = 'https://hackday.app.n8n.cloud/webhook/summarize';
    
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
}); 