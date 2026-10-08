// Stand-in imagery only — there's no real PDF behind the page-picker mock, so each "page" just
// gets a deterministic placeholder photo (same seed = same image for that page number everywhere
// it shows up, instead of a different random one on every render).
export function sitePlanPlaceholderImageUrl(pageNum, width, height) {
  return `https://picsum.photos/seed/ec-site-plan-page-${pageNum}/${width}/${height}`;
}
