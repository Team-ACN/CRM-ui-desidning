import React from 'react';

// Every builder section looks the same: step number, title, one line of guidance.
const Section = ({ step, title, hint, action, children }) => (
  <section className="px-5 py-6 border-b border-separator last:border-b-0">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="w-4 text-[13px] text-tertiary tabular-nums">{step}</span>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-label">{title}</h3>
        </div>
        {hint && <p className="text-[13px] text-secondary mt-1 ml-6">{hint}</p>}
      </div>
      {action}
    </div>
    <div className="ml-6 space-y-4">{children}</div>
  </section>
);

export default Section;
