import React from 'react';
import { Lock } from 'lucide-react';

// Browser-chrome mock for the desktop preview — same role as AppHeaderMock
// in the template builder, just for web.
const DesktopFrameMock = ({ children, pageLabel = 'Home' }) => (
  <div className="w-[900px] h-[560px] bg-white rounded-xl shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_24px_60px_rgb(0_0_0/0.14)] overflow-hidden flex flex-col shrink-0">
    {/* Chrome */}
    <div className="h-10 bg-[#ececee] border-b border-black/[0.08] flex items-center gap-3 px-4 shrink-0">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex-1 max-w-md mx-auto flex items-center justify-center gap-1.5 h-6 px-3 bg-black/[0.05] rounded-md">
        <Lock size={11} className="text-tertiary" />
        <span className="text-[12px] text-secondary">acn.example.com/{pageLabel.toLowerCase()}</span>
      </div>
    </div>

    {/* Page body behind the overlay */}
    <div className="flex-1 relative bg-gray-50 overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="h-9 w-56 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white border border-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 bg-white border border-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
      {children}
    </div>
  </div>
);

export default DesktopFrameMock;
