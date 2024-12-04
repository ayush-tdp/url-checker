const { JSDOM } = require('jsdom');

class UrlChecker {
  constructor() {
    this.dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    this.document = this.dom.window.document;
  }

  async checkUrl(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return {
          exists: true,
          contentType: response.headers.get('Content-Type'),
        };
      }
      return { exists: false };
    } catch (error) {
      console.error(`Error checking URL: ${url}`, error);
      return { exists: false };
    }
  }

  async handleUrls(urls) {
    for (const url of urls) {
      const result = await this.checkUrl(url);

      if (result.exists) {
        console.log(`URL exists: ${url}`);
        console.log(`Content-Type: ${result.contentType}`);

        if (result.contentType.includes('video')) {
          this.displayVideo(url);
        } else if (result.contentType.includes('html')) {
          this.displayIframe(url);
        } else if (result.contentType.includes('image')) {
          this.displayImage(url);
        } else {
          console.log(`Unhandled content type: ${result.contentType}`);
        }
      } else {
        console.warn(`URL does not exist or is not working: ${url}`);
      }
    }
  }

  displayVideo(url) {
    const video = this.document.createElement('video');
    video.src = url;
    video.controls = true;
    this.document.body.appendChild(video);
    console.log('Video displayed');
  }

  displayIframe(url) {
    const iframe = this.document.createElement('iframe');
    iframe.src = url;
    iframe.width = '600';
    iframe.height = '400';
    this.document.body.appendChild(iframe);
    console.log('Iframe displayed');
  }

  displayImage(url) {
    const img = this.document.createElement('img');
    img.src = url;
    img.alt = 'Loaded content';
    this.document.body.appendChild(img);
    console.log('Image displayed');
  }
}

module.exports = UrlChecker;
