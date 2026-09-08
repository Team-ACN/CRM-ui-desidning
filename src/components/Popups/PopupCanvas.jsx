import React from 'react';
import { Smartphone, Monitor, Frame, MessageSquare } from 'lucide-react';
import AppHeaderMock from '../Cohorts/AppHeaderMock';
import PropertiesHeaderMock from '../Cohorts/PropertiesHeaderMock';
import DesktopFrameMock from './DesktopFrameMock';
import PopupOverlayPreview from './PopupOverlayPreview';
import PopupSheetPreview from './PopupSheetPreview';
import { pageLabel } from './popupConstants';

// The popup dims the whole screen, so the overlay sits above the app chrome too.
const PhoneFrame = ({ children, header }) => (
  <div className="w-[390px] h-[844px] bg-[#FAFAFA] rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-gray-800 relative shrink-0 origin-top scale-[0.78]">
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

  const overlay = (cardWidth, previewDevice) => (
    <PopupOverlayPreview
      popup={popup}
      device={previewDevice}
      cardWidth={cardWidth}
      showSlots={showSlots}
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
    <div className="flex-1 flex flex-col bg-gray-50 overflow-y-auto">
      <div className="flex items-center justify-center gap-2 px-6 py-3 shrink-0">
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
          {isApp ? <Smartphone size={14} /> : <Monitor size={14} />}
          {isApp ? 'App' : 'Web'}
        </span>

        <button
          onClick={onToggleSlots}
          title="Outline where the system draws the button and the close icon, so you can check the artwork leaves room for them"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            showSlots
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700'
          }`}
        >
          <Frame size={14} />
          {showSlots ? 'Hide guides' : 'Show guides'}
        </button>

        {isApp && (
          <button
            onClick={onToggleToast}
            title="Preview the toast that appears after a CTA tap"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              showToast
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700'
            }`}
          >
            <MessageSquare size={14} />
            Toast
          </button>
        )}
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
            <DesktopFrameMock pageLabel={page}>{overlay(420, 'desktop')}</DesktopFrameMock>
          </div>
        )}

        {isApp && (
          <p className="text-[11px] text-gray-400 mt-2">
            Swiping the poster down closes the popup.
          </p>
        )}
      </div>
    </div>
  );
};

export default PopupCanvas;
