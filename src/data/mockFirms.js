// Firms a CP agent can belong to. Starter list only — the "Working as: Firm" field in
// VerifyAgentSection searches this and lets a KAM add a brand new one inline when it's missing,
// same idea as picking vs. creating a developer in Edge, just without that flow's Restack sync.
export const mockFirms = [
  'IQOL',
  'Square Yards',
  'NoBroker',
  'Zapkey',
  'Housing.com',
  'NestAway Realty',
  'Prestige Partners',
];

export function addFirm(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return null;
  const existing = mockFirms.find((f) => f.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;
  mockFirms.push(trimmed);
  return trimmed;
}
