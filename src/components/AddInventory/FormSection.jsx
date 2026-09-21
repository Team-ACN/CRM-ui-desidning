import React from 'react';

/** Numbered block of the add-property form. */
const FormSection = ({ step, title, children }) => (
  <section className="scroll-mt-24">
    <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-900 text-white text-xs font-semibold">
        {step}
      </span>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>

    <div className="pt-6 flex flex-col gap-6">{children}</div>
  </section>
);

export default FormSection;
