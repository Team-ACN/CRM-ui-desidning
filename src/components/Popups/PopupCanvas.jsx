import React from 'react';
import { Smartphone, Monitor, Frame, MessageSquare } from 'lucide-react';
import { pressable } from '../cms-ui';
import AppHeaderMock from '../Cohorts/AppHeaderMock';
import PropertiesHeaderMock from '../Cohorts/PropertiesHeaderMock';
import DesktopFrameMock from './DesktopFrameMock';
import PopupBannerPreview from './PopupBannerPreview';
import PopupSheetPreview from './PopupSheetPreview';
import { pageLabel } from './popupConstants';

// The popup dims the whole screen, so the overlay sits above the app chrome too.
const PhoneFrame = ({ children, header }) => (
  <div className="w-[390px] h-[844px] bg-[#FAFAFA] rounded-[48px] shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_24px_60px_rgb(0_0_0/0.14)] overflow-hidden border-[10px] border-[#1d1d1f] relative shrink-0 origin-top scale-[0.78]">
    <div className="absolute inset-0 flex flex-col items-center">
      {header}
      <div className="flex-1 w-full px-3 py-3 space-y-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 bg-white border border-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
    <div className="absolute inset-0 z-20">{children}</div>
  </div>
);

const PopupCanvas = ({
  popup,
  showSlots,
  onToggleSlots,
  showToast,
  onToggleToast,
  selectedSlotIndex,
  onSelectSlot,
}) => {
  const isApp = popup.surface === 'app';
  const page = popup.trigger?.pageKey ? pageLabel(popup.trigger.pageKey) : 'Home';

  const banner = (
    <PopupBannerPreview
      popup={popup}
      width={640}
      showSlots={showSlots}
      showToast={showToast}
      selectedSlotIndex={selectedSlotIndex}
      onSelectSlot={onSelectSlot}
    />
  );

  const sheet = (
    <PopupSheetPreview
      popup={popup}
      width={374}
      showSlots={showSlots}
      showToast={showToast}
      selectedSlotIndex={selectedSlotIndex}
      onSelectSlot={onSelectSlot}
    />
  );

  return (
    <div className="flex-1 flex flex-col bg-canvas overflow-y-auto">
      <div className="flex items-center justify-center gap-2 px-6 py-4 shrink-0">
        <span className="flex items-center gap-1.5 mr-2 text-[13px] font-medium text-secondary">
          {isApp ? <Smartphone size={14} strokeWidth={1.75} /> : <Monitor size={14} strokeWidth={1.75} />}
          {isApp ? 'App' : 'Web'}
        </span>

        <button
          onClick={onToggleSlots}
          title="Outline where the system draws the button and the close icon, so you can check the artwork leaves room for them"
          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium cursor-pointer ${pressable} ${
            showSlots ? 'bg-accent-soft text-accent' : 'bg-fill text-secondary hover:bg-fill-strong hover:text-label'
          }`}
        >
          <Frame size={14} strokeWidth={1.75} />
          {showSlots ? 'Hide guides' : 'Show guides'}
        </button>

        <button
          onClick={onToggleToast}
          title="Preview the toast that appears after a CTA tap"
          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] font-medium cursor-pointer ${pressable} ${
            showToast ? 'bg-accent-soft text-accent' : 'bg-fill text-secondary hover:bg-fill-strong hover:text-label'
          }`}
        >
          <MessageSquare size={14} strokeWidth={1.75} />
          Toast
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center pb-8 px-6">
        {isApp ? (
          <PhoneFrame
            header={
              popup.trigger?.pageKey === 'properties' ? (
                <PropertiesHeaderMock pageType="PROPERTIES" />
              ) : (
                <AppHeaderMock pageType="HOME" />
              )
            }
          >
            {sheet}
          </PhoneFrame>
        ) : (
          <div className="origin-top scale-[0.82]">
            <DesktopFrameMock pageLabel={page}>{banner}</DesktopFrameMock>
          </div>
        )}

        {isApp && (
          <p className="text-[12px] text-secondary mt-2">
            Swiping the poster down closes the popup.
          </p>
        )}
      </div>
    </div>
  );
};

export default PopupCanvas;
