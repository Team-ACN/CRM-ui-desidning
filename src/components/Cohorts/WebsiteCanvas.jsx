import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Monitor, ImageIcon, ChevronDown, Plus, Bell } from 'lucide-react';
import WidgetPreview from './WidgetPreview';
import { TOP_BANNER_SPEC } from './topBannerSpec';

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

// Hero image is right-anchored so the safe area stays visible while the left side crops.
const heroStyle = (imageUrl) => ({
  aspectRatio: `${TOP_BANNER_SPEC.width} / ${TOP_BANNER_SPEC.height}`,
  backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
  backgroundSize: 'cover',
  backgroundPosition: 'right center',
});

const HeroControls = ({ hasImage, isSelected }) => (
  <>
    <div className={`absolute top-[72px] left-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
      isSelected ? 'bg-emerald-600 text-white' : 'bg-white/90 text-gray-700'
    }`}>
      <ImageIcon size={12} /> Top Banner
    </div>
    {!hasImage && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-sm font-medium text-gray-500 bg-white/80 px-3 py-1.5 rounded-lg">
          Upload a {TOP_BANNER_SPEC.width}×{TOP_BANNER_SPEC.height} hero image in widget settings
        </p>
      </div>
    )}
  </>
);

// Matches Figma "Header" (Home-Page file, node 10120:11296)
const NAV_LINKS = [
  { label: 'My Business' },
  { label: 'Properties' },
  { label: 'Services', hasDropdown: true },
  { label: 'Edge', hasDropdown: true },
];

const WebsiteNav = () => (
  <div className="relative z-10 flex items-center justify-between">
    <span className="text-white text-[22px] font-bold tracking-tight font-['Outfit']">ACN</span>
    <div className="flex items-center gap-6">
      <nav className="hidden md:flex items-center gap-8 text-[#FAFAFA] text-base tracking-[0.04px] font-['Outfit']">
        {NAV_LINKS.map(({ label, hasDropdown }) => (
          <span key={label} className="flex items-center gap-1">
            {label}
            {hasDropdown && <ChevronDown size={16} />}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <button className="h-10 px-3 flex items-center gap-1.5 rounded-lg bg-[#FAFAFA] text-[#115E59] text-sm font-medium font-['Inter']">
          <Plus size={16} /> Add Property
        </button>
        <div className="h-10 px-4 flex items-center gap-1.5 rounded-lg bg-[#FAFAFA] border-[1.5px] border-[#E5E5E5]">
          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#D6A75B] to-[#8A5A1F]" />
          <span className="text-base font-semibold text-[#0F766E] font-['Outfit']">100</span>
        </div>
        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#FAFAFA] border-[1.5px] border-[#E5E5E5] text-[#262626]">
          <Bell size={16} />
        </div>
        <div className="h-10 w-10 rounded-full bg-[#F5F5F5] border-[1.5px] border-[#E5E5E5] flex items-center justify-center text-[#262626] text-xl font-bold font-['Outfit']">
          A
        </div>
      </div>
    </div>
  </div>
);

const WebsiteHeader = ({ hero, isHeroSelected, onSelectHero }) => {
  const heroImage = hero?.config?.imageUrl;
  return (
    <div className="relative">
      <div
        onClick={onSelectHero}
        style={heroStyle(heroImage)}
        className={`relative bg-gray-200 bg-no-repeat cursor-pointer ${isHeroSelected ? 'ring-4 ring-inset ring-emerald-500' : ''}`}
      >
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
        <HeroControls hasImage={!!heroImage} isSelected={isHeroSelected} />
        <div className="px-12 py-3">
          <WebsiteNav />

          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-10 w-[720px] max-w-[90%]">
            <div className="w-[720px] max-w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
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
  const hero = widgets.find((w) => w.type === 'top_banner');
  const bodyWidgets = widgets.filter((w) => w.type !== 'top_banner');
  const widgetIds = bodyWidgets.map((w) => w.id);

  return (
    <div className="w-full flex justify-center">
      <div className="w-[1180px] max-w-[95vw] bg-[#FAFAFA] rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <WebsiteHeader
          hero={hero}
          isHeroSelected={!!hero && selectedWidgetId === hero.id}
          onSelectHero={() => hero && onSelectWidget(hero.id)}
        />

        <div
          ref={setNodeRef}
          className={`px-12 pt-24 pb-10 transition-colors ${isOver ? 'bg-emerald-50/70' : ''}`}
        >
          {bodyWidgets.length === 0 ? (
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
                {bodyWidgets.map((widget) => (
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

