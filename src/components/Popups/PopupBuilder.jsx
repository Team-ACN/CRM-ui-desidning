import React, { useMemo, useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
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

  const applyPosterColor = (imageUrl) => {
    sampleBottomEdgeColor(imageUrl).then((color) => {
      if (color) setPopup((prev) => ({ ...prev, actionBarColor: color }));
    });
  };

  const handleChange = (updates) => {
    setPopup((prev) => {
      const next = { ...prev, ...updates };
      // The action area continues the poster, so it re-reads the artwork's bottom edge.
      if ('imageUrl' in updates && next.matchPosterColor !== false) applyPosterColor(updates.imageUrl);
      return next;
    });
  };

  const handleMatchPoster = (shouldMatch) => {
    setPopup((prev) => ({ ...prev, matchPosterColor: shouldMatch }));
    if (shouldMatch) applyPosterColor(popup.imageUrl);
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header — the name is the title, not another form field */}
      <header className="h-14 bg-white border-b border-gray-200 pl-3 pr-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {popup.name || 'Untitled popup'}
            </h2>
            <p className="text-[11px] text-gray-400">{isEditing ? 'Editing' : 'New popup'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {validation.errors.length > 0 && (
            <span
              title={validation.errors.map((e) => e.message).join('\n')}
              className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg"
            >
              <AlertTriangle size={12} />
              {validation.errors.length} to fix
            </span>
          )}
          <button
            onClick={() => onSave({ ...popup, status: 'Draft', isActive: false })}
            disabled={!popup.name.trim()}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Save draft
          </button>
          <button
            onClick={() => onSave({ ...popup, status: 'Not Live', isActive: false })}
            disabled={!validation.isValid}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Send for approval
          </button>
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
        <aside className="w-[380px] bg-white border-l border-gray-200 overflow-y-auto shrink-0">
          <div className="px-5 py-4 border-b border-gray-100">
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Popup name</label>
            <input
              value={popup.name}
              onChange={(e) => handleChange({ name: e.target.value })}
              placeholder="e.g. Whitefield premium — book a demo"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
