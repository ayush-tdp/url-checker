const { JSDOM } = require('jsdom');

// Function to check if the URL exists and return the status and message
async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return { status: true, message: 'URL exists' };
    }
    return { status: false, message: 'URL exists, but returned non-OK status' };
  } catch (error) {
    console.error(`Error checking URL: ${url}`, error);
    return { status: false, message: `Error checking URL: ${error.message}` };
  }
}

// Function to check if iframe, video, or canvas with data exists in the loaded content
function checkContentForData(document) {
  // Check for iframe, video, or canvas elements
  const iframe = document.querySelector('iframe');
  if (iframe) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const canvas = iframeDoc.querySelector('canvas');
    const video = iframeDoc.querySelector('video');
    
    if (canvas && canvas.getContext) {
      const context = canvas.getContext('2d');
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      if (imageData.data.length > 0) {
        return true; // Canvas has data
      }
    }

    if (video && video.src && !video.paused) {
      return true; // Video is playing
    }
  }
  
  // Check for video and canvas directly in the document
  const canvasInDocument = document.querySelector('canvas');
  if (canvasInDocument && canvasInDocument.getContext) {
    const context = canvasInDocument.getContext('2d');
    const imageData = context.getImageData(0, 0, canvasInDocument.width, canvasInDocument.height);
    if (imageData.data.length > 0) {
      return true; // Canvas has data
    }
  }

  const videoInDocument = document.querySelector('video');
  if (videoInDocument && videoInDocument.src && !videoInDocument.paused) {
    return true; // Video is playing
  }

  return false; // No iframe, video, or canvas with data found
}

// Main function to handle the URL and check the conditions
async function handleUrl(url) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const document = dom.window.document;

  const result = await checkUrl(url);
  
  if (!result.status) {
    console.warn(result.message);
    return false; // URL not valid or returned non-OK status
  }

  const contentLoaded = await fetch(url).then(response => response.text());
  dom.window.document.body.innerHTML = contentLoaded;

  const hasData = checkContentForData(dom.window.document);

  if (!hasData) {
    console.warn('No iframe, video, or canvas with data found');
    return false; // No iframe/video/canvas with data found
  }

  console.log('Content loaded successfully with valid data');
  return true; // Content is valid and contains iframe, video, or canvas with data
}

module.exports = { handleUrl, checkUrl, checkContentForData };
