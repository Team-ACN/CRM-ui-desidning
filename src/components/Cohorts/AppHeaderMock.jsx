import React from 'react';
import { Search, Bell, Battery, Wifi, Signal, Coins } from 'lucide-react';

const AppHeaderMock = ({ pageType }) => {
  return (
    <div className="w-full bg-[#FAFAFA] flex flex-col relative top-0 z-10">
      {/* System Bar */}
      <div className="w-full h-[53px] bg-[#FFEDD5]/90 backdrop-blur-md flex items-center justify-between px-6">
        <span className="text-black text-[14px] font-semibold tracking-tight ml-2">9:41</span>
        <div className="flex items-center gap-1.5 opacity-80">
          <Signal size={14} className="fill-black" />
          <Wifi size={14} className="fill-black" />
          <Battery size={16} className="fill-black" />
        </div>
      </div>

      {/* Header Profile / Coins / Bell */}
      <div className="w-full h-auto bg-[#FFEDD5] flex flex-col items-center">
        <div className="w-full h-[40px] mt-2 mb-3 flex flex-row justify-between items-center px-4">
          {/* Profile Logo */}
          <div className="w-[40px] h-[40px] bg-[#262626] rounded-full flex items-center justify-center">
            <span className="text-[#FAFAFA] text-[18px] font-medium font-['Outfit']">A</span>
          </div>

          <div className="flex flex-row items-center gap-3">
            {/* Coins */}
            <div className="h-[40px] bg-[#FAFAFA] border-[1.5px] border-[#D4D4D4] rounded-full flex flex-row items-center px-4 gap-1.5 shadow-sm">
              <Coins size={20} className="text-amber-500" />
              <span className="text-[#0F766E] text-[16px] font-semibold font-['Outfit']">100</span>
            </div>

            {/* Bell */}
            <div className="w-[40px] h-[40px] bg-[#FAFAFA] border border-[#E5E5E5] rounded-full flex items-center justify-center relative">
              <Bell size={18} className="text-[#404040]" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="w-full flex flex-row items-center justify-between px-4 mb-4">
          <div className={`flex-1 h-[48px] rounded-[13px] flex items-center justify-center mx-1 transition-colors ${pageType === 'HOME' || !pageType ? 'bg-[#EA580C] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#262626]'}`}>
            <span className="text-[14px] font-semibold font-['Outfit']">Home</span>
          </div>
          <div className={`flex-1 h-[48px] rounded-[13px] flex items-center justify-center mx-1 transition-colors ${pageType === 'PROPERTIES' ? 'bg-[#EA580C] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#262626]'}`}>
            <span className="text-[14px] font-semibold font-['Outfit']">Properties</span>
          </div>
          <div className="flex-1 h-[48px] bg-[#FAFAFA] rounded-[13px] flex items-center justify-center mx-1">
            <span className="text-[#262626] text-[14px] font-semibold font-['Outfit']">EDGE</span>
          </div>
          <div className="flex-1 h-[48px] bg-[#FAFAFA] rounded-[13px] flex items-center justify-center text-center mx-1 leading-tight">
            <span className="text-[#262626] text-[14px] font-semibold font-['Outfit'] px-2">My<br />Business</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full px-4 pb-4">
          <div className="w-full h-[52px] bg-[#FAFAFA] border border-[#D4D4D4] rounded-xl flex items-center px-4 gap-3">
            <Search size={20} className="text-[#737373]" strokeWidth={2.5} />
            <span className="text-[#737373] text-[15px] font-medium font-['Inter']">Search for the property here s</span>
          </div>
        </div>
      </div>
      
      {/* Decorative gradient drop-off simulating visual continuation */}
      <div className="w-full h-4 bg-gradient-to-b from-[#FFEDD5] to-[#FAFAFA]" />
    </div>
  );
};

export default AppHeaderMock;
