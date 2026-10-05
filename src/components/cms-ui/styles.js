// Shared class strings for the CMS design language (see src/index.css tokens).
// Press feedback lives on :active so it's instant on pointer-down.
export const pressable = 'transition-[transform,background-color,color,box-shadow] duration-100 ease-out active:scale-[0.97]';

export const fieldClass =
  'w-full h-9 px-3 rounded-[10px] bg-fill text-[14px] text-label placeholder:text-tertiary ' +
  'border border-transparent outline-none transition-colors ' +
  'focus:bg-surface focus:border-accent/40 focus:ring-4 focus:ring-accent/10';

export const textareaClass = fieldClass.replace('h-9', 'min-h-[72px] py-2');

export const labelClass = 'block text-[13px] font-medium text-label mb-1.5';
export const hintClass = 'text-[12px] leading-4 text-secondary';

export const cardClass = 'bg-surface rounded-2xl shadow-card';

export const sectionTitleClass = 'text-[17px] leading-[22px] font-semibold tracking-[-0.01em] text-label';
export const pageTitleClass = 'text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-label';
