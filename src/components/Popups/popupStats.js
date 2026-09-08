// Derived popup metrics — mirrors the helper-module pattern in
// src/components/Enquiries/enquiryStats.js. All inputs come from popup.stats.

const safeDivide = (numerator, denominator) =>
  denominator > 0 ? numerator / denominator : 0;

export const totalClicks = (popup) =>
  Object.values(popup?.stats?.buttonClicks || {}).reduce((sum, n) => sum + n, 0);

export const clickThroughRate = (popup) =>
  safeDivide(totalClicks(popup), popup?.stats?.impressions || 0);

export const dismissRate = (popup) =>
  safeDivide(popup?.stats?.closes || 0, popup?.stats?.impressions || 0);

export const buttonBreakdown = (popup) => {
  const clicks = popup?.stats?.buttonClicks || {};
  const impressions = popup?.stats?.impressions || 0;

  return (popup?.buttons || []).map((button) => {
    const count = clicks[button.analyticsKey] || 0;
    return {
      id: button.id,
      label: button.label || 'Whole card',
      analyticsKey: button.analyticsKey,
      clicks: count,
      ctr: safeDivide(count, impressions),
      shareOfClicks: safeDivide(count, totalClicks(popup)),
    };
  });
};

export const aggregateStats = (popups = []) => {
  const impressions = popups.reduce((sum, p) => sum + (p.stats?.impressions || 0), 0);
  const clicks = popups.reduce((sum, p) => sum + totalClicks(p), 0);
  const closes = popups.reduce((sum, p) => sum + (p.stats?.closes || 0), 0);

  return {
    popupCount: popups.length,
    liveCount: popups.filter((p) => p.status === 'Live').length,
    impressions,
    clicks,
    closes,
    ctr: safeDivide(clicks, impressions),
    dismissRate: safeDivide(closes, impressions),
  };
};

export const formatPct = (value) => `${(value * 100).toFixed(1)}%`;

export const formatCount = (value) => (value || 0).toLocaleString('en-IN');
