import React from 'react';

// Every builder section looks the same: step number, title, one line of guidance.
const Section = ({ step, title, hint, action, children }) => (
  <section className="px-5 py-5 border-b border-gray-100 last:border-b-0">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">
            {step}
          </span>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        {hint && <p className="text-[11px] text-gray-400 mt-1 ml-7">{hint}</p>}
      </div>
      {action}
    </div>
    <div className="ml-7 space-y-3">{children}</div>
  </section>
);

export default Section;
