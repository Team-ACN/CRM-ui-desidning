import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Monitor } from 'lucide-react';
import WidgetPreview from './WidgetPreview';

const WebsiteFooter = () => {
  return (
    <footer className="bg-[#171717] text-white pt-14 pb-6">
      <div className="px-12">
        <div className="flex items-start justify-between gap-10">
          <div className="w-[260px]">
            <div className="w-[89px] h-9 bg-white/10 rounded flex items-center justify-center">
              <span className="text-xs font-semibold tracking-wide text-white/90">ACN</span>
            </div>
            <p className="mt-4 text-[18px] leading-[150%] text-[#D4D4D4] font-['Outfit']">
              Connect, Collaborate &amp; Succeed
            </p>

            <div className="mt-8 space-y-3 text-[#D4D4D4] text-sm font-['Inter']">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-4 h-4 rounded border border-[#D4D4D4]" />
                <p className="leading-[150%]">
                  ACN Bengaluru 123 Business Park, Koramangala, Bengaluru, Karnataka 560095
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border border-[#D4D4D4]" />
                <p>contact@acnonline.in</p>
              </div>
            </div>
          </div>

          <div className="w-[126px]">
            <p className="text-[14px] font-semibold tracking-wide text-[#FAFAFA] font-['Outfit']">Properties</p>
            <ul className="mt-4 space-y-4 text-[#D4D4D4] text-sm font-['Inter']">
              <li>Residential Resale</li>
              <li>Commercial Resale</li>
              <li>Residential Rental</li>
              <li>Commercial Rental</li>
            </ul>
          </div>

          <div className="w-[122px]">
            <p className="text-[14px] font-semibold tracking-wide text-[#FAFAFA] font-['Outfit']">Legal</p>
            <ul className="mt-4 space-y-4 text-[#D4D4D4] text-sm font-['Inter']">
              <li>Terms &amp; Condition</li>
              <li>Privacy Policy</li>
              <li>Delisting Policy</li>
              <li>Our SOPs</li>
            </ul>
          </div>

          <div className="w-[132px]">
            <p className="text-[16px] font-semibold tracking-wide text-[#FAFAFA] font-['Archivo']">Other</p>
            <ul className="mt-4 space-y-4 text-[#D4D4D4] text-sm font-['Manrope']">
              <li>Contact Account Manger</li>
              <li>Report a Problem</li>
            </ul>
          </div>

          <div className="w-[172px]">
            <p className="text-[16px] font-semibold tracking-wide text-[#FAFAFA] font-['Archivo']">Connect with us</p>
            <div className="mt-3 flex items-center gap-5">
              <div className="w-7 h-7 rounded bg-white/10" />
              <div className="w-7 h-7 rounded bg-white/10" />
              <div className="w-7 h-7 rounded bg-white/10" />
              <div className="w-7 h-7 rounded bg-white/10" />
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between gap-8">
            <div>
              <p className="text-[16px] font-bold text-[#FAFAFA] font-['Manrope']">About Canvas Homes</p>
              <p className="mt-1 text-[16px] leading-[150%] text-[#D4D4D4] font-['Manrope']">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            <p className="shrink-0 text-[16px] text-[#D4D4D4] font-['Manrope']">© 2026 ACN Bengaluru. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

const WebsiteHeader = () => {
  return (
    <div className="relative">
      <div className="bg-[#262626] text-[#F5F5F5] h-10 flex items-center px-3">
        <div className="flex-1 flex items-center gap-2 text-[12px] font-medium font-['Inter'] opacity-90">
          <span className="inline-block w-2.5 h-2.5 rounded bg-[#FDE047]" />
          <span>2BHK in Sobha Dream Acres</span>
          <span className="inline-block w-1 h-1 rounded-full bg-[#F5F5F5]" />
          <span>1200 sqft sold for ₹1.25Cr on 12 Jan</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[12px] text-[#FFE4E6] font-['Inter']">
          <span>Why Bangalore property prices are rising in 2026</span>
          <span className="inline-block w-2 h-2 rounded bg-[#CA8A04]" />
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#7BAEE1] to-[#CFE1EF]">
        <div className="px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-6 bg-white/20 rounded" />
            </div>
            <div className="hidden md:flex items-center gap-8 text-white text-sm font-['Outfit']">
              <span>My Business</span>
              <span>Properties</span>
              <span>Rent</span>
              <span>My Wallet</span>
              <span>Need Help</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-10 px-4 rounded-lg bg-white text-[#115E59] text-sm font-medium font-['Inter']">
                Add Inventory
              </button>
              <div className="h-10 w-10 rounded-lg bg-white/90 border border-white/40" />
              <div className="h-10 w-10 rounded-full bg-white/90 border border-white/40 flex items-center justify-center text-[#262626] font-bold font-['Outfit']">
                A
              </div>
            </div>
          </div>

          <div className="mt-10 max-w-[780px]">
            <h1 className="text-white text-[40px] leading-[1.2] font-semibold font-['Outfit']">
              Search best inventories for your client from 10,000+ options
            </h1>

            <div className="mt-6 w-[720px] max-w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center bg-white px-3 h-14 gap-4 border-b border-[#D4D4D4]">
                <div className="text-sm font-semibold text-[#0F766E] border-b-2 border-[#0F766E] h-full flex items-center px-2 font-['Outfit']">
                  Resale (50)
                </div>
                <div className="text-sm text-[#525252] font-medium font-['Outfit']">Rental (20)</div>
                <div className="text-sm text-[#525252] font-medium font-['Outfit']">New Launch (8)</div>
              </div>
              <div className="flex items-center h-[72px] px-5 gap-4">
                <div className="flex-1">
                  <p className="text-[12px] text-[#262626] font-['Outfit']">Location or project name</p>
                  <p className="text-[14px] text-[#737373] font-medium font-['Inter']">Search Location</p>
                </div>
                <div className="w-px h-12 bg-[#E5E5E5]" />
                <div className="w-[160px]">
                  <p className="text-[12px] text-[#262626] font-['Outfit']">Configuration</p>
                  <p className="text-[14px] text-[#737373] font-medium font-['Inter']">2BHK</p>
                </div>
                <div className="w-px h-12 bg-[#E5E5E5]" />
                <div className="w-[140px]">
                  <p className="text-[12px] text-[#262626] font-['Outfit']">Budget</p>
                  <p className="text-[14px] text-[#737373] font-medium font-['Inter']">₹ 60L+</p>
                </div>
                <button className="ml-auto h-11 w-11 rounded-lg bg-[#0F766E]" />
              </div>
            </div>
          </div>
        </div>
        <div className="h-10" />
      </div>
    </div>
  );
};

const WebsiteCanvas = ({
  widgets,
  isOver,
  setNodeRef,
  selectedWidgetId,
  onSelectWidget,
  onRemoveWidget,
}) => {
  const widgetIds = widgets.map((w) => w.id);

  return (
    <div className="w-full flex justify-center">
      <div className="w-[1180px] max-w-[95vw] bg-[#FAFAFA] rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <WebsiteHeader />

        <div
          ref={setNodeRef}
          className={`px-12 py-10 transition-colors ${isOver ? 'bg-emerald-50/70' : ''}`}
        >
          {widgets.length === 0 ? (
            <div className="h-56 rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                <Monitor size={18} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Drop widgets here</p>
              <p className="text-xs text-gray-500 mt-1">This is the Website Page canvas</p>
            </div>
          ) : (
            <SortableContext items={widgetIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {widgets.map((widget) => (
                  <div key={widget.id} className="max-w-[900px]">
                    <WidgetPreview
                      widget={widget}
                      onRemove={onRemoveWidget}
                      isSelected={selectedWidgetId === widget.id}
                      onSelect={() => onSelectWidget(widget.id)}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        <WebsiteFooter />
      </div>
    </div>
  );
};

export default WebsiteCanvas;

