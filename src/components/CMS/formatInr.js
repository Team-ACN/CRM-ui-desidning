// 2300000 -> "₹23 L", 23000000 -> "₹2.3 Cr", 45000 -> "₹45 K". Plain numbers below 1,000.
export function formatInr(value) {
  const n = Number(value);
  if (!n) return '';
  const trim = (x) => String(parseFloat(x.toFixed(2)));
  if (n >= 1e7) return `₹${trim(n / 1e7)} Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5)} L`;
  if (n >= 1e3) return `₹${trim(n / 1e3)} K`;
  return `₹${n}`;
}
