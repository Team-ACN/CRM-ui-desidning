// Reads the poster's bottom edge so the action area can continue the artwork.
// Samples the middle 60% of the bottom strip — the corners and outer edges often
// carry rounding or vignetting that would drag the average off-colour.

const toHex = (value) => Math.round(value).toString(16).padStart(2, '0').toUpperCase();

export const sampleBottomEdgeColor = (src) =>
  new Promise((resolve) => {
    if (!src || typeof document === 'undefined') {
      resolve(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onerror = () => resolve(null);

    image.onload = () => {
      try {
        const width = Math.max(1, Math.min(image.naturalWidth, 240));
        const height = Math.max(1, Math.min(image.naturalHeight, 240));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0, width, height);

        const stripHeight = Math.max(1, Math.round(height * 0.04));
        const stripWidth = Math.max(1, Math.round(width * 0.6));
        const stripLeft = Math.round((width - stripWidth) / 2);

        const { data } = context.getImageData(stripLeft, height - stripHeight, stripWidth, stripHeight);

        let r = 0;
        let g = 0;
        let b = 0;
        const pixels = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        resolve(`#${toHex(r / pixels)}${toHex(g / pixels)}${toHex(b / pixels)}`);
      } catch (error) {
        // Cross-origin images without CORS headers taint the canvas — fall back to manual.
        console.error('Could not sample the poster colour:', error);
        resolve(null);
      }
    };

    image.src = src;
  });
