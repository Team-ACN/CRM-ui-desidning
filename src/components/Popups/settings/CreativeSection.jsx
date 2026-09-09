import React from 'react';
import Section from './Section';
import ImageUploadField from '../ImageUploadField';
import { IMAGE_CONSTRAINTS, SURFACES } from '../popupConstants';
import { POPUP_TEMPLATES } from '../popupTemplates';
import { errorFor } from '../popupValidation';

const CreativeSection = ({ popup, validation, onChange, onSurfaceChange, onTemplateChange }) => {
  const isApp = popup.surface === 'app';

  return (
    <Section
      step={1}
      title="Surface & creative"
      hint="Web and app are separate popups — the surface decides the creative."
    >
      {/* Surface first: everything below depends on it */}
      <div className="flex items-center p-1 bg-gray-100 rounded-lg">
        {SURFACES.map((s) => (
          <button
            key={s.id}
            onClick={() => onSurfaceChange(s.id)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              popup.surface === s.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isApp ? (
        <ImageUploadField
          label="App creative"
          hint={`4:5 · ${IMAGE_CONSTRAINTS.minWidth}×${IMAGE_CONSTRAINTS.minHeight}`}
          value={popup.imageUrl}
          minWidth={IMAGE_CONSTRAINTS.minWidth}
          minHeight={IMAGE_CONSTRAINTS.minHeight}
          onChange={(imageUrl) => onChange({ imageUrl })}
        />
      ) : (
        <ImageUploadField
          label="Web banner"
          hint={`910:436 · ${IMAGE_CONSTRAINTS.desktopMinWidth}×${IMAGE_CONSTRAINTS.desktopMinHeight}`}
          value={popup.imageUrlDesktop}
          minWidth={IMAGE_CONSTRAINTS.desktopMinWidth}
          minHeight={IMAGE_CONSTRAINTS.desktopMinHeight}
          onChange={(imageUrlDesktop) => onChange({ imageUrlDesktop })}
        />
      )}

      {errorFor(validation, 'creative') && (
        <p className="text-[10px] text-red-600">{errorFor(validation, 'creative')}</p>
      )}

      <div className="pt-1">
        <p className="text-[11px] font-medium text-gray-600 mb-1.5">Layout</p>
        <div className="flex items-center p-1 bg-gray-100 rounded-lg">
          {POPUP_TEMPLATES.map((template) => (
            <button
              key={template.key}
              onClick={() => onTemplateChange(template.key)}
              title={template.description}
              className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                popup.templateKey === template.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default CreativeSection;
