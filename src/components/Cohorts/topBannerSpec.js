// Design spec for the Website hero (Top Banner) image.
// Source: Figma "Banner designing guide" (Home-Page file, node 10128:12526).
export const TOP_BANNER_SPEC = {
  width: 1440,
  height: 378,
  safeArea: { width: 600, rightPaddingDesktop: 120, rightPaddingMobile: 32 },
  maxFileSizeMb: 2,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  ratioTolerance: 0.02,
};

const formatMb = (bytes) => (bytes / (1024 * 1024)).toFixed(1);

// Returns a list of human-readable warnings. Empty list = image matches spec.
export const getTopBannerWarnings = ({ type, size, width, height }) => {
  const spec = TOP_BANNER_SPEC;
  const warnings = [];

  if (type && !spec.acceptedTypes.includes(type)) {
    warnings.push('Use JPG, PNG or WebP for best results.');
  }
  if (size && size > spec.maxFileSizeMb * 1024 * 1024) {
    warnings.push(`File is ${formatMb(size)}MB. Keep it under ${spec.maxFileSizeMb}MB for fast page load.`);
  }
  if (width && height) {
    const expectedRatio = spec.width / spec.height;
    const ratioDiff = Math.abs(width / height - expectedRatio) / expectedRatio;
    if (ratioDiff > spec.ratioTolerance) {
      warnings.push(`Image is ${width}×${height}. Expected ${spec.width}×${spec.height} ratio, it will be cropped.`);
    } else if (width < spec.width) {
      warnings.push(`Image is ${width}px wide. Use at least ${spec.width}px to avoid blur on large screens.`);
    }
  }
  return warnings;
};

// Reads an uploaded file into a data URL plus its pixel dimensions.
export const readImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.onload = () => {
      const dataUrl = reader.result;
      const img = new Image();
      img.onerror = () => reject(new Error('Selected file is not a valid image.'));
      img.onload = () => resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
