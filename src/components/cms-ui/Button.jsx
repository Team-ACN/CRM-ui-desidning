import React from 'react';
import { pressable } from './styles';

// Matches the CRM design-system buttons (see Home/Agents/Leads): dark primary, outlined secondary, rounded-lg.
const VARIANTS = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300',
  secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400',
  plain: 'bg-transparent text-gray-700 hover:bg-gray-100 disabled:text-gray-400',
  destructive: 'bg-transparent text-red-600 hover:bg-red-50 disabled:text-gray-400',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-[13px] gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
};

// One primary per view; everything else secondary or plain.
const Button = ({ variant = 'secondary', size = 'md', icon: Icon, children, className = '', ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:active:scale-100 ${pressable} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...props}
  >
    {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2} />}
    {children}
  </button>
);

export const IconButton = ({ icon, label, className = '', size = 16, ...props }) => {
  const Icon = icon;
  return (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 ${pressable} ${className}`}
    {...props}
  >
    <Icon size={size} strokeWidth={1.75} />
  </button>
  );
};

export default Button;
