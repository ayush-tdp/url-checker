const { JSDOM } = require('jsdom');

// Function to check if the URL exists and return the status and message
async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return {
        status: true,
        message: `URL exists. Content-Type: ${response.headers.get('Content-Type')}`,
      };
    }
    return { status: false, message: 'URL exists, but returned non-OK status' };
  } catch (error) {
    console.error(`Error checking URL: ${url}`, error);
    return { status: false, message: `Error checking URL: ${error.message}` };
  }
}

// Function to display video if URL is valid
function displayVideo(url, document) {
  const video = document.createElement('video');
  video.src = url;
  video.controls = true;
  document.body.appendChild(video);
  console.log('Video displayed');
}

// Function to display iframe if URL is valid
function displayIframe(url, document) {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.width = '600';
  iframe.height = '400';
  document.body.appendChild(iframe);
  console.log('Iframe displayed');
}

// Function to display image if URL is valid
function displayImage(url, document) {
  const img = document.createElement('img');
  img.src = url;
  img.alt = 'Loaded content';
  document.body.appendChild(img);
  console.log('Image displayed');
}

// Function to check if iframe contains canvas or video
function checkIframeForCanvasOrVideo(iframe) {
  const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
  
  // Check if there is a canvas element
  const canvas = iframeDocument.querySelector('canvas');
  if (canvas && canvas.getContext) {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    return imageData.data.length > 0; // Check if canvas has any pixel data
  }

  // Check if there is a video element
  const video = iframeDocument.querySelector('video');
  if (video && video.src) {
    return video.paused === false; // Check if the video is playing (has data)
  }

  return false; // Return false if no canvas or video found
}

// Main function to handle the URL
async function handleUrl(url) {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const document = dom.window.document;

  const result = await checkUrl(url);

  if (result.status) {
    console.log(result.message);

    const contentType = result.message.split(': ')[1];  // Extract content type from the message

    if (contentType.includes('video')) {
      displayVideo(url, document);
    } else if (contentType.includes('html')) {
      const iframe = displayIframe(url, document);
      if (checkIframeForCanvasOrVideo(iframe)) {
        console.log('Iframe contains canvas or video with data');
      } else {
        console.log('Iframe does not contain canvas or video with data');
      }
    } else if (contentType.includes('image')) {
      displayImage(url, document);
    } else {
      console.log('Unhandled content type:', contentType);
    }
  } else {
    console.warn(result.message);
  }
}

module.exports = { handleUrl, checkUrl, displayVideo, displayIframe, displayImage, checkIframeForCanvasOrVideo };
