import React from 'react';
import { X, ImageOff } from 'lucide-react';
import DividerStar from './DividerStar';
import { WEB_BANNER_ASPECT, WEB_CARD_WIDTH, WEB_WELL } from './popupConstants';
import { getTemplate } from './popupTemplates';

// The web popup, built to the desktop template (Figma node 207:1634): a 910x436 banner
// carrying the whole creative, with the divider and the CTAs drawn by the system inside
// the well the artwork leaves clear on its left side.
// Geometry is the 910pt design, scaled by `width`.
const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const DIVIDER_COLOR = '#E5E5E5';

const PopupBannerPreview = ({
  popup,
  width = WEB_CARD_WIDTH,
  showSlots = false,
  selectedSlotIndex = null,
  onSelectSlot,
  showToast = false,
}) => {
  const template = getTemplate(popup.templateKey);
  const scale = width / WEB_CARD_WIDTH;
  const px = (value) => value * scale;
  const buttons = (popup.buttons || []).slice(0, template.buttonCount ?? 0);
  const closeLeft = popup.closeCorner === 'top_left';

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ backgroundColor: `rgba(0,0,0,${popup.backdropOpacity ?? 0.6})`, fontFamily: FONT }}
    >
      {/* Toast sits above the card so it never covers the CTA that fired it */}
      {showToast && (
        <div className="flex justify-center" style={{ marginBottom: px(16) }}>
          <div
            className="text-center"
            style={{
              backgroundColor: 'rgba(23,23,23,0.95)',
              color: '#FAFAFA',
              borderRadius: px(12),
              padding: `${px(12)}px ${px(20)}px`,
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

      {/* Card — the banner is the whole card */}
      <div
        className="relative overflow-hidden shadow-2xl bg-gray-200"
        style={{
          width: px(WEB_CARD_WIDTH),
          aspectRatio: `${WEB_BANNER_ASPECT}`,
          borderRadius: px(12),
        }}
      >
        {popup.imageUrlDesktop ? (
          <img
            src={popup.imageUrlDesktop}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100">
            <ImageOff size={20} className="text-gray-400" />
            <p className="text-[11px] text-gray-500 font-medium">Banner · 910×436</p>
          </div>
        )}

        {/* Close control — top corner, inside the card */}
        <div
          className="absolute flex items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          style={{
            width: px(WEB_WELL.closeSize),
            height: px(WEB_WELL.closeSize),
            top: px(WEB_WELL.closeInset),
            left: closeLeft ? px(WEB_WELL.closeInset) : undefined,
            right: closeLeft ? undefined : px(WEB_WELL.closeInset),
          }}
        >
          <X size={px(16)} />
        </div>

        {/* System layer — divider + CTAs, inside the artwork's reserved well */}
        {template.buttonCount > 0 && (
          <div
            className="absolute"
            style={{
              left: px(WEB_WELL.x),
              bottom: px(WEB_WELL.bottomInset),
              width: px(WEB_WELL.width),
            }}
          >
            {showSlots && (
              <div
                className="absolute border-2 border-dashed border-emerald-400 rounded-lg"
                style={{ inset: `${px(-8)}px` }}
              >
                <span className="absolute -top-5 left-0 text-[9px] font-semibold text-white bg-emerald-600 px-1.5 py-0.5 rounded">
                  CTA well · 420pt
                </span>
              </div>
            )}

            {/* Divider — label left, then star and rule */}
            <div
              className="flex items-center"
              style={{ height: px(WEB_WELL.dividerHeight), gap: px(16) }}
            >
              <span
                className="whitespace-nowrap"
                style={{ color: DIVIDER_COLOR, fontSize: px(14), fontWeight: 500, lineHeight: 1.5 }}
              >
                {popup.dividerLabel || 'TRY IT YOURSELF'}
              </span>
              <span className="flex-1 flex items-center" style={{ marginRight: px(-4) }}>
                <DividerStar size={px(12)} color={DIVIDER_COLOR} />
                <span className="flex-1 h-px" style={{ backgroundColor: DIVIDER_COLOR }} />
              </span>
            </div>

            {/* CTAs — 420x48, stacked 11pt apart */}
            <div
              className="flex flex-col"
              style={{
                gap: px(WEB_WELL.ctaGap),
                marginTop: px(WEB_WELL.dividerGap),
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
                  }`}
                  style={{
                    height: px(WEB_WELL.ctaHeight),
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
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupBannerPreview;
