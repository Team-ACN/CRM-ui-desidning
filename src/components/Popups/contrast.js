// WCAG contrast helpers — the guardrail for author-set button colours.

export const hexToRgb = (hex) => {
  const normalized = String(hex || '').trim().replace('#', '');
  const full =
    normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
};

export const isValidHex = (hex) => hexToRgb(hex) !== null;

const channelLuminance = (value) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return (
    0.2126 * channelLuminance(rgb.r) +
    0.7152 * channelLuminance(rgb.g) +
    0.0722 * channelLuminance(rgb.b)
  );
};

export const contrastRatio = (foreground, background) => {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  if (fg === null || bg === null) return null;

  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
};

// AA for normal text is 4.5:1, AAA is 7:1. Anything under 4.5 ships unreadable.
export const contrastLevel = (foreground, background) => {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) return { ratio: null, level: 'unknown', pass: false };
  if (ratio >= 7) return { ratio, level: 'AAA', pass: true };
  if (ratio >= 4.5) return { ratio, level: 'AA', pass: true };
  return { ratio, level: 'Fail', pass: false };
};

export const formatRatio = (ratio) =>
  ratio === null || ratio === undefined ? '—' : `${ratio.toFixed(2)}:1`;
