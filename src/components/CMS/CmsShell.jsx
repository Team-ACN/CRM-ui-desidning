import React, { useState } from 'react';
import { MousePointerClick } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ToastProvider } from './index';
import ClickInsightsDrawer from './ClickInsightsDrawer';

const PAGES = [
  { value: 'popups', label: 'Popups' },
  { value: 'templates', label: 'Templates' },
  { value: 'components', label: 'Components' },
  { value: 'cohorts', label: 'Cohorts' },
];

// Two-row header: a slim title row, then a plain left-aligned tab bar below it — no icons,
// no underline, just weight/colour to show which page is active.
const CmsShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [insightsOpen, setInsightsOpen] = useState(false);
  const activePage = PAGES.find((p) => location.pathname.startsWith(`/cms/${p.value}`))?.value || 'cohorts';

  return (
    <ToastProvider>
      <div className="cms relative h-full flex flex-col bg-white">
        <header className="shrink-0 h-12 flex items-center px-6 bg-surface sticky top-0 z-30">
          <span className="text-label font-semibold text-[14px]">CMS</span>
        </header>
        <nav className="shrink-0 flex items-center gap-1 pl-3 pr-6 bg-surface border-b border-separator sticky top-12 z-20">
          {PAGES.map((p) => {
            const selected = activePage === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => navigate(`/cms/${p.value}`)}
                className={`px-3 py-3 text-[13px] font-medium transition-colors ${
                  selected ? 'text-neutral-900 font-semibold' : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                {p.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setInsightsOpen(true)}
            className="ml-auto px-3 py-3 text-[13px] font-medium text-neutral-400 hover:text-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <MousePointerClick size={14} /> Clicks
          </button>
        </nav>
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
        {insightsOpen && <ClickInsightsDrawer onClose={() => setInsightsOpen(false)} />}
      </div>
    </ToastProvider>
  );
};

export default CmsShell;
