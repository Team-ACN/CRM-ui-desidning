// Normalizes any phone string to its last 10 digits, for matching across differing formats
// (+91 98450 11287 vs 9845011287 vs +919845011287). Shared by phone-lookup flows across Agents,
// Leads, and Legal Doc so "is this number already in the system" always compares the same way.
export function digitsOf(value) {
  return String(value ?? '').replace(/\D/g, '').slice(-10);
}
