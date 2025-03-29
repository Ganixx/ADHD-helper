# SimplifyIt - Chrome Extension for ADHD & Dyslexia

A Chrome extension to help users with ADHD, dyslexia, and other learning differences. Similar to Helperbird but focused on simplicity and core accessibility features.

## Current Features

- **Text Summarization**: Extract and summarize content from any webpage to help with focus and comprehension

## Upcoming Features

- Font customization for improved readability
- Text highlighting tools
- Reading rulers to help track lines of text
- Color filters and contrast adjustments
- Focus mode to minimize distractions
- Text-to-speech capabilities
- Spelling assistance

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked" and select the folder containing this extension
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Navigate to any webpage you want to summarize
2. Click the SimplifyIt extension icon in your toolbar
3. Click the "Summarize Page" button
4. The extension will extract page content and display a concise summary

## Development

This extension is built with vanilla JavaScript, HTML, and CSS. No build steps or dependencies required.

### Files Structure

- `manifest.json`: Extension configuration
- `popup.html/js/css`: The UI that appears when clicking the extension icon
- `content.js`: Script injected into web pages
- `background.js`: Background service worker

## License

MIT 