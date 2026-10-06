import React, { useMemo, useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button, IconButton, fieldClass, labelClass } from '../cms-ui';
import PopupCanvas from './PopupCanvas';
import CreativeSection from './settings/CreativeSection';
import ButtonsSection from './settings/ButtonsSection';
import PlacementSection from './settings/PlacementSection';
import DeliverySection from './settings/DeliverySection';
import { buildDefaultButtons, getSlots } from './popupTemplates';
import { validatePopup } from './popupValidation';
import { sampleBottomEdgeColor } from './sampleImageColor';

// Keep the author's existing button config for slots the new template still has.
const remapButtons = (buttons, templateKey) => {
  const defaults = buildDefaultButtons(templateKey);
  return getSlots(templateKey).map((slot) => {
    const existing = (buttons || []).find((b) => b.slotIndex === slot.index);
    return existing
      ? { ...existing, slotIndex: slot.index }
      : defaults.find((b) => b.slotIndex === slot.index);
  });
};

const remapForFullTap = (buttons) => {
  const first = (buttons || [])[0];
  return [
    {
      id: first?.id || `btn-full-${Date.now()}`,
      slotIndex: 0,
      label: '',
      bgColor: first?.bgColor || '#000000',
      textColor: first?.textColor || '#FFFFFF',
      redirectUrl: first?.redirectUrl || '',
      openInNewTab: first?.openInNewTab ?? true,
      analyticsKey: first?.analyticsKey || 'card_tap',
    },
  ];
};

const PopupBuilder = ({ popup: initialPopup, cohorts, onSave, onBack }) => {
  const [popup, setPopup] = useState(initialPopup);
  const [showSlots, setShowSlots] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  const isEditing = !!initialPopup?.name;
  const validation = useMemo(() => validatePopup(popup), [popup]);

  const applyCreativeColor = (creative) => {
    sampleBottomEdgeColor(creative).then((color) => {
      if (color) setPopup((prev) => ({ ...prev, actionBarColor: color }));
    });
  };

  // Whichever creative this surface uses is the one the action area continues.
  const creativeOf = (record) => (record.surface === 'app' ? record.imageUrl : record.imageUrlDesktop);

  const handleChange = (updates) => {
    setPopup((prev) => {
      const next = { ...prev, ...updates };
      const creativeChanged = 'imageUrl' in updates || 'imageUrlDesktop' in updates || 'surface' in updates;
      if (creativeChanged && next.matchPosterColor !== false) applyCreativeColor(creativeOf(next));
      return next;
    });
  };

  const handleMatchPoster = (shouldMatch) => {
    setPopup((prev) => ({ ...prev, matchPosterColor: shouldMatch }));
    if (shouldMatch) applyCreativeColor(creativeOf(popup));
  };

  const handleSurfaceChange = (surface) => handleChange({ surface });

  const handleTemplateChange = (templateKey) => {
    setPopup((prev) => ({
      ...prev,
      templateKey,
      buttons:
        templateKey === 'full_tap'
          ? remapForFullTap(prev.buttons)
          : remapButtons(prev.buttons, templateKey),
    }));
    setSelectedSlotIndex(null);
  };

  return (
    <div className="flex flex-col h-screen bg-canvas">
      {/* Header — the name is the title, not another form field */}
      <header className="material h-14 bg-surface/80 backdrop-blur-xl backdrop-saturate-150 border-b border-separator pl-3 pr-4 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <IconButton icon={ArrowLeft} label="Back" size={18} onClick={onBack} />
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-label truncate">
              {popup.name || 'Untitled popup'}
            </h2>
            <p className="text-[12px] text-secondary">{isEditing ? 'Editing' : 'New popup'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {validation.errors.length > 0 && (
            <span
              title={validation.errors.map((e) => e.message).join('\n')}
              className="flex items-center gap-1.5 mr-2 text-[13px] font-medium text-warning tabular-nums"
            >
              <AlertTriangle size={14} strokeWidth={1.75} />
              {validation.errors.length} to fix
            </span>
          )}
          <Button
            variant="secondary"
            onClick={() => onSave({ ...popup, status: 'Draft', isActive: false })}
            disabled={!popup.name.trim()}
          >
            Save draft
          </Button>
          <Button
            variant="primary"
            onClick={() => onSave({ ...popup, status: 'Not Live', isActive: false })}
            disabled={!validation.isValid}
          >
            Send for approval
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <PopupCanvas
          popup={popup}
          showSlots={showSlots}
          onToggleSlots={() => setShowSlots((prev) => !prev)}
          showToast={showToast}
          onToggleToast={() => setShowToast((prev) => !prev)}
          selectedSlotIndex={selectedSlotIndex}
          onSelectSlot={setSelectedSlotIndex}
        />

        {/* One column, four steps, no sub-tabs */}
        <aside className="w-[380px] bg-surface border-l border-separator overflow-y-auto shrink-0">
          <div className="px-5 py-5 border-b border-separator">
            <label className={labelClass}>Popup name</label>
            <input
              value={popup.name}
              onChange={(e) => handleChange({ name: e.target.value })}
              placeholder="e.g. Whitefield premium — book a demo"
              className={fieldClass}
            />
          </div>

          <CreativeSection
            popup={popup}
            validation={validation}
            onChange={handleChange}
            onSurfaceChange={handleSurfaceChange}
            onTemplateChange={handleTemplateChange}
          />
          <ButtonsSection
            popup={popup}
            validation={validation}
            onMatchPoster={handleMatchPoster}
            selectedSlotIndex={selectedSlotIndex}
            onSelectSlot={setSelectedSlotIndex}
            onChange={handleChange}
          />
          <PlacementSection
            popup={popup}
            validation={validation}
            cohorts={cohorts}
            onChange={handleChange}
          />
          <DeliverySection popup={popup} validation={validation} onChange={handleChange} />
        </aside>
      </div>
    </div>
  );
};

export default PopupBuilder;
