import { SOURCE_AI } from '../formModel';

const BASE = 'px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors';

export const IDLE_PILL = `${BASE} border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-400`;

/** Selected pills are green, unless the value came from the AI pass and still needs a look. */
export const selectedPill = (source, confidence) => {
  if (source === SOURCE_AI && confidence === 'low') return `${BASE} border-amber-400 bg-amber-50 text-amber-800`;
  if (source === SOURCE_AI) return `${BASE} border-violet-400 bg-violet-50 text-violet-800`;
  return `${BASE} border-emerald-600 bg-emerald-50 text-emerald-900`;
};

export const inputRing = (issue, source, confidence) => {
  if (issue?.severity === 'error') return 'border-red-300 bg-red-50/40 focus:ring-red-400';
  if (source === SOURCE_AI && confidence === 'low') return 'border-amber-300 bg-amber-50/40 focus:ring-amber-400';
  if (source === SOURCE_AI) return 'border-violet-300 bg-violet-50/30 focus:ring-violet-400';
  return 'border-gray-200 bg-white focus:ring-emerald-500';
};
