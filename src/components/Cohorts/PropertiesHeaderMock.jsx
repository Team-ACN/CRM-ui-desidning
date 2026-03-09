import React from 'react';
import { Search, Bell, Battery, Wifi, Signal, Coins } from 'lucide-react';

const PropertiesHeaderMock = ({ pageType }) => {
  return (
    <div className="w-full bg-[#FAFAFA] flex flex-col relative top-0 z-10 shrink-0">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-[444px] bg-gradient-to-b from-[#CCFBF1] to-transparent pointer-events-none" />

      {/* System Bar */}
      <div className="w-full h-[53px] bg-transparent backdrop-blur-md flex items-center justify-between px-6 z-10">
        <span className="text-black text-[14px] font-semibold tracking-tight ml-2">9:41</span>
        <div className="flex items-center gap-1.5 opacity-80">
          <Signal size={14} className="fill-black" />
          <Wifi size={14} className="fill-black" />
          <Battery size={16} className="fill-black" />
        </div>
      </div>

      {/* Header Profile / Coins / Bell */}
      <div className="w-full h-auto bg-transparent flex flex-col items-center z-10">
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
            <div className="w-[40px] h-[40px] bg-[#FAFAFA] border border-[#E5E5E5] rounded-full flex items-center justify-center relative shadow-sm">
              <Bell size={18} className="text-[#404040]" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="w-full flex flex-row items-center justify-between px-4 mb-4 gap-2">
          <div className={`flex-1 h-[56px] rounded-[13px] flex items-center justify-center transition-colors ${pageType === 'HOME' ? 'bg-[#0F766E] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#262626]'}`}>
            <span className="text-[14px] font-semibold font-['Outfit']">Home</span>
          </div>
          <div className={`flex-1 h-[56px] rounded-[13px] flex items-center justify-center transition-colors ${pageType === 'PROPERTIES' || !pageType ? 'bg-[#0F766E] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#262626]'}`}>
            <span className="text-[14px] font-semibold font-['Outfit']">Properties</span>
          </div>
          <div className="flex-1 h-[56px] bg-[#FAFAFA] rounded-[13px] flex items-center justify-center">
            <span className="text-[#262626] text-[14px] font-semibold font-['Outfit'] flex items-center h-[21px]">EDGE</span>
          </div>
          <div className={`flex-1 h-[56px] rounded-[13px] flex items-center justify-center text-center leading-[110%] transition-colors ${pageType === 'BUSINESS' ? 'bg-[#0F766E] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#262626]'}`}>
            <span className="text-[14px] font-semibold font-['Outfit'] px-2">My<br />Business</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full px-4 pb-4">
          <div className="w-full h-[64px] bg-[#FAFAFA] border border-[#D4D4D4] rounded-[12px] flex items-center px-5 gap-3">
            <Search size={24} className="text-[#737373]" strokeWidth={2} />
            <span className="text-[#737373] text-[16px] font-medium font-['Inter']">Search for the property here s</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default PropertiesHeaderMock;
