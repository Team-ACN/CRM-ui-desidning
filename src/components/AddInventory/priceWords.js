/** Indian-notation words for an amount, e.g. 22000000 -> "2 Crore 20 Lakh Rupees only". */
const UNITS = [
  { label: 'Crore', size: 10000000 },
  { label: 'Lakh', size: 100000 },
  { label: 'Thousand', size: 1000 },
];

export const priceInWords = (amount) => {
  if (!Number.isFinite(amount) || amount <= 0) return '0';

  const { parts, rest } = UNITS.reduce(
    (state, unit) => {
      const count = Math.floor(state.rest / unit.size);
      return count > 0
        ? { parts: [...state.parts, `${count} ${unit.label}`], rest: state.rest - count * unit.size }
        : state;
    },
    { parts: [], rest: Math.round(amount) },
  );

  const all = rest > 0 ? [...parts, String(rest)] : parts;
  return `${all.join(' ')} Rupees only`;
};
