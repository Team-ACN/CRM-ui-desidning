import React from 'react';
import { X, ImageOff } from 'lucide-react';
import { CLOSE_ZONE_PCT, getAspect, getTemplate } from './popupTemplates';

// The renderer. Background image is pure art; every button is a real element
// positioned as a % of the card, straight from the template registry — so a slot
// never drifts out of the artwork's empty well at any size.
const PopupOverlayPreview = ({
  popup,
  device = 'mobile',
  cardWidth = 320,
  showSlots = false,
  selectedSlotIndex = null,
  onSelectSlot,
}) => {
  const template = getTemplate(popup.templateKey);
  const aspect = getAspect(popup.templateKey, device);
  const image =
    device === 'desktop'
      ? popup.imageUrlDesktop || popup.imageUrl
      : popup.imageUrl || popup.imageUrlDesktop;
  const closeLeft = popup.closeCorner === 'top_left';
  const scale = cardWidth / 320;

  const buttonFor = (slotIndex) =>
    (popup.buttons || []).find((b) => b.slotIndex === slotIndex);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center px-3"
      style={{ backgroundColor: `rgba(0,0,0,${popup.backdropOpacity ?? 0.6})` }}
    >
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100"
        style={{ width: cardWidth, aspectRatio: `${aspect}` }}
      >
        {/* Background creative */}
        {image ? (
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100 border border-dashed border-gray-300">
            <ImageOff size={22} className="text-gray-400" />
            <p className="text-[11px] text-gray-500 font-medium">No creative uploaded</p>
          </div>
        )}

        {/* full_tap: whole card is the link, minus the reserved close zone */}
        {template.wholeCardTap && (
          <div className="absolute inset-0" title={buttonFor(0)?.redirectUrl || 'No destination set'}>
            {showSlots && (
              <div className="absolute inset-2 border-2 border-dashed border-emerald-400/80 rounded-xl flex items-end justify-center pb-2">
                <span className="text-[10px] font-semibold text-emerald-100 bg-emerald-600/80 px-2 py-0.5 rounded-full">
                  Whole card is tappable
                </span>
              </div>
            )}
          </div>
        )}

        {/* Reserved close-button zone (marked so artwork keeps it clear) */}
        {showSlots && (
          <div
            className="absolute border-2 border-dashed border-white/70 rounded-lg"
            style={{
              width: `${CLOSE_ZONE_PCT.wPct}%`,
              height: `${CLOSE_ZONE_PCT.hPct}%`,
              top: '2%',
              left: closeLeft ? '2%' : undefined,
              right: closeLeft ? undefined : '2%',
            }}
          />
        )}

        {/* System-rendered buttons in their template slots */}
        {template.slots.map((slot) => {
          const button = buttonFor(slot.index);
          const isSelected = selectedSlotIndex === slot.index;

          return (
            <button
              key={slot.index}
              type="button"
              onClick={() => onSelectSlot && onSelectSlot(slot.index)}
              title={button?.redirectUrl || 'No destination set'}
              className={`absolute flex items-center justify-center font-semibold rounded-xl transition-shadow ${
                isSelected ? 'ring-2 ring-offset-2 ring-emerald-400' : ''
              } ${showSlots ? 'outline outline-2 outline-dashed outline-emerald-400' : ''}`}
              style={{
                left: `${slot.xPct}%`,
                top: `${slot.yPct}%`,
                width: `${slot.wPct}%`,
                height: `${slot.hPct}%`,
                backgroundColor: button?.bgColor || '#E5E7EB',
                color: button?.textColor || '#111827',
                fontSize: Math.max(10, Math.round(13 * scale)),
              }}
            >
              <span className="truncate px-2">{button?.label || `Slot ${slot.index + 1}`}</span>
            </button>
          );
        })}

        {/* System close button — always present, corner configurable */}
        <div
          className="absolute flex items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          style={{
            width: Math.max(22, Math.round(28 * scale)),
            height: Math.max(22, Math.round(28 * scale)),
            top: '3%',
            left: closeLeft ? '4%' : undefined,
            right: closeLeft ? undefined : '4%',
          }}
        >
          <X size={Math.max(12, Math.round(15 * scale))} />
        </div>
      </div>
    </div>
  );
};

export default PopupOverlayPreview;
