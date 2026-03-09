import React from 'react';
import { Eye, Share2, Phone, MessageCircle } from 'lucide-react';

const MockPropertyCard = () => {
  return (
    <div className="w-[296px] h-[477px] bg-[#FAFAFA] border border-[#E5E5E5] rounded-[12px] flex flex-col items-start gap-4 box-border mb-4 shrink-0">
      
      {/* Top Section - Image Carousel Area */}
      <div className="w-full h-[393px] flex flex-col items-start gap-3">
        
        {/* Image Container with Gradient Overlay */}
        <div className="w-[296px] h-[240px] flex flex-col justify-between items-start pt-[12px] pb-[8px] gap-[10px] relative bg-gray-200 overflow-hidden rounded-t-[11px]">
           {/* Simulated image gradient via overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/0 to-black/50 pointer-events-none z-10" />
          
          {/* Top Tags Row */}
          <div className="w-full px-4 flex flex-row justify-between items-start z-20">
             {/* Views Tag */}
             <div className="flex flex-row justify-center items-center px-3 py-1 gap-1 h-[26px] bg-[#262626]/60 rounded-[35px] backdrop-blur-sm">
               <Eye size={12} className="text-white" />
               <span className="font-['Inter'] font-medium text-[12px] text-white">20</span>
             </div>

             {/* Share Tag */}
             <div className="flex flex-row justify-center items-center px-[12px] py-[6px] gap-1 w-[30px] h-[30px] bg-[#404040]/70 rounded-[8px] backdrop-blur-sm">
                <Share2 size={14} className="text-white" />
             </div>
          </div>

          {/* Bottom Indicators Row */}
          <div className="w-full px-4 flex flex-row justify-between items-center h-[26px] z-20">
            {/* Carousel Dots */}
            <div className="flex flex-row items-center gap-1 mx-auto h-[10px]">
               <div className="w-1 h-1 bg-[#A3A3A3] rounded-full" />
               <div className="w-1.5 h-1.5 bg-[#D4D4D4] rounded-full" />
               <div className="w-2.5 h-2.5 bg-[#FAFAFA] rounded-full" />
               <div className="w-1.5 h-1.5 bg-[#D4D4D4] rounded-full" />
               <div className="w-1 h-1 bg-[#A3A3A3] rounded-full" />
            </div>

            {/* Photo Count */}
            <div className="flex flex-row items-center px-2 py-1 gap-1 h-[26px] bg-[#262626]/40 rounded-[19px] backdrop-blur-sm">
                <span className="font-['Inter'] font-medium text-[12px] text-white tracking-wide">13 Pix</span>
            </div>
          </div>
        </div>

        {/* Property Details Section */}
        <div className="w-full px-4 flex flex-col items-start gap-4 h-[141px]">
          
          <div className="w-[264px] flex flex-col items-start gap-2 h-[104px]">
            
            {/* Meta row */}
            <div className="w-full flex flex-col gap-1 h-[69px]">
               <div className="w-full flex flex-row justify-between items-start h-[18px]">
                 <span className="font-['Inter'] font-normal text-[12px] text-[#404040]">PB1704</span>
                 <span className="font-['Inter'] font-normal text-[12px] text-[#404040]">Updated on: 24 Jan</span>
               </div>
               
               <div className="w-full flex flex-col items-start gap-[2px] h-[47px]">
                 <span className="font-['Outfit'] font-medium text-[16px] text-[#262626] tracking-tight">Sobha Dream Acers</span>
                 <span className="font-['Inter'] font-normal text-[14px] text-[#262626]">3BHK Apartment in Whitefield</span>
               </div>
            </div>

            {/* Price row */}
            <div className="w-full flex flex-row items-baseline gap-1 h-[27px]">
               <span className="font-['Inter'] font-semibold text-[18px] text-[#262626]">₹25,000/mo</span>
               <span className="font-['Inter'] font-medium text-[14px] text-[#525252]">Deposit: ₹1.25L</span>
            </div>

            {/* Amenities Row */}
            <div className="w-full flex flex-row justify-between items-center h-[21px] mt-1">
               <div className="flex flex-row items-center gap-1.5 mx-auto h-[21px]">
                  <span className="text-[14px]">🛋️</span>
                  <span className="font-['Inter'] font-normal text-[14px] text-[#262626]">Semi Furnished</span>
               </div>
               <div className="flex flex-row items-center gap-1.5 mx-auto h-[21px]">
                  <span className="text-[14px]">🤝</span>
                  <span className="font-['Inter'] font-normal text-[14px] text-[#262626]">Side by Side</span>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Contact Card */}
      <div className="w-full flex flex-row items-center p-3 gap-3 h-[68px] border-t border-dashed border-[#D4D4D4] box-border">
         <div className="flex-1 flex flex-row items-center gap-2 h-[44px]">
             {/* Agent Avatar */}
            <div className="w-[40px] h-[40px] bg-[#FCA5A5] rounded-full flex flex-col justify-center items-center">
               <span className="font-['Inter'] font-medium text-[16px] text-[#262626]">A</span>
            </div>

            {/* Agent Details */}
            <div className="flex-1 flex flex-col items-start h-[39px] justify-center">
               <span className="font-['Inter'] font-semibold text-[14px] text-[#262626]">70243 90500</span>
               <span className="font-['Inter'] font-normal text-[12px] text-[#525252]">Ankit Kumar Tiwari</span>
            </div>

            {/* Contact Buttons */}
            <div className="w-[96px] h-[44px] flex flex-row justify-end items-center gap-2">
               <div className="w-[44px] h-[44px] bg-[#0F766E] rounded-[8px] flex justify-center items-center">
                 <Phone size={20} className="text-[#FAFAFA]" />
               </div>
               <div className="w-[44px] h-[44px] bg-[#60D669] rounded-[8px] flex justify-center items-center relative overflow-hidden">
                   {/* Simulating the generic message circle icon if whatsapp logo is missing */}
                 <MessageCircle size={20} className="text-[#FAFAFA]" />
                 <div className="absolute inset-x-2 inset-y-2 border border-white/20 rounded-md pointer-events-none" />
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default MockPropertyCard;
