import React from 'react';
import { X, ImageOff } from 'lucide-react';
import DividerStar from './DividerStar';
import { POSTER_ASPECT } from './popupConstants';
import { getTemplate } from './popupTemplates';

// The app popup, built to the mobile spec (Figma node 163:1764):
// a bottom sheet made of a 39:50 poster and a solid action area beneath it.
// The action-area colour is authored to match the poster's bottom edge so the two
// read as one surface. Geometry below is the 390pt design, scaled by `width`.
const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const DIVIDER_COLOR = '#E5E5E5';

const PopupSheetPreview = ({
  popup,
  width = 390,
  showSlots = false,
  selectedSlotIndex = null,
  onSelectSlot,
  showToast = false,
}) => {
  const template = getTemplate(popup.templateKey);
  const scale = width / 390;
  const px = (value) => value * scale;
  const buttons = (popup.buttons || []).slice(0, template.buttonCount ?? 0);
  const actionBarColor = popup.actionBarColor || '#111111';

  return (
    <div
      className="absolute inset-0 flex flex-col justify-end"
      style={{ backgroundColor: `rgba(0,0,0,${popup.backdropOpacity ?? 0.6})`, fontFamily: FONT }}
    >
      {/* Close chip — centred above the sheet, 36pt */}
      <div className="flex justify-center" style={{ marginBottom: px(12) }}>
        <div
          className="rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow"
          style={{ width: px(36), height: px(36) }}
        >
          <X size={px(18)} />
        </div>
      </div>

      {showToast && (
        <div className="flex justify-center" style={{ marginBottom: px(12) }}>
          <div
            className="text-center"
            style={{
              width: px(354),
              backgroundColor: 'rgba(23,23,23,0.95)',
              color: '#FAFAFA',
              borderRadius: px(12),
              paddingTop: px(12),
              paddingBottom: px(12),
              paddingLeft: px(16),
              paddingRight: px(16),
              fontSize: px(14),
              fontWeight: 500,
              lineHeight: 1.5,
              boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
            }}
          >
            {popup.toastMessage || 'Toast message not set'}
          </div>
        </div>
      )}

      <div className="w-full">
        {/* Poster — 390x500, 39:50 */}
        <div className="relative w-full bg-gray-200" style={{ aspectRatio: `${POSTER_ASPECT}` }}>
          {popup.imageUrl ? (
            <img src={popup.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100">
              <ImageOff size={20} className="text-gray-400" />
              <p className="text-[11px] text-gray-500 font-medium">Poster · 390×500</p>
            </div>
          )}

          {showSlots && (
            <>
              <div className="absolute inset-1.5 border-2 border-dashed border-white/70 rounded-lg" />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-2 text-[9px] font-semibold text-white bg-black/60 px-2 py-0.5 rounded-full">
                Poster 39:50
              </span>
            </>
          )}

        </div>

        {/* Action area — solid, colour-matched to the poster */}
        <div style={{ backgroundColor: actionBarColor, paddingTop: px(12) }}>
          {template.buttonCount > 0 && (
            <>
              {/* Divider: star + rule, label, rule + star — 300pt wide */}
              <div
                className="flex items-center mx-auto"
                style={{ width: px(300), height: px(21), gap: px(16) }}
              >
                <span className="flex-1 flex items-center justify-end" style={{ marginRight: px(-4) }}>
                  <span className="flex-1 h-px" style={{ backgroundColor: DIVIDER_COLOR }} />
                  <DividerStar size={px(12)} color={DIVIDER_COLOR} />
                </span>
                <span
                  className="whitespace-nowrap text-center"
                  style={{
                    color: DIVIDER_COLOR,
                    fontSize: px(14),
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  {popup.dividerLabel || 'TRY IT YOURSELF'}
                </span>
                <span className="flex-1 flex items-center" style={{ marginLeft: px(-4) }}>
                  <DividerStar size={px(12)} color={DIVIDER_COLOR} />
                  <span className="flex-1 h-px" style={{ backgroundColor: DIVIDER_COLOR }} />
                </span>
              </div>

              {/* Buttons — 354pt wide, stacked, 11pt apart */}
              <div
                className="flex flex-col mx-auto"
                style={{
                  width: px(354),
                  gap: px(11),
                  marginTop: px(12),
                  filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.25))',
                }}
              >
                {buttons.map((button) => (
                  <button
                    key={button.id}
                    type="button"
                    onClick={() => onSelectSlot && onSelectSlot(button.slotIndex)}
                    title={button.redirectUrl || 'No destination set'}
                    className={`w-full flex items-center justify-center ${
                      selectedSlotIndex === button.slotIndex ? 'ring-2 ring-emerald-400' : ''
                    } ${showSlots ? 'outline outline-2 outline-dashed outline-emerald-400' : ''}`}
                    style={{
                      height: px(48),
                      borderRadius: px(8),
                      backgroundColor: button.bgColor || '#0F766E',
                      color: button.textColor || '#FAFAFA',
                      fontSize: px(16),
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    <span className="truncate" style={{ paddingLeft: px(16), paddingRight: px(16) }}>
                      {button.label || 'Button Label'}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Home indicator sits on the same solid colour */}
          <div className="flex items-end justify-center" style={{ height: px(33) }}>
            <div
              className="rounded-full bg-white/85"
              style={{ width: px(139), height: px(5), marginBottom: px(8) }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default PopupSheetPreview;
