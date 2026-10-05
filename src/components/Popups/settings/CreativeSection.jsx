import React from 'react';
import { SegmentedControl, labelClass } from '../../cms-ui';
import Section from './Section';
import ImageUploadField from '../ImageUploadField';
import { IMAGE_CONSTRAINTS, SURFACES } from '../popupConstants';
import { POPUP_TEMPLATES } from '../popupTemplates';
import { errorFor } from '../popupValidation';

const SURFACE_OPTIONS = SURFACES.map((s) => ({ value: s.id, label: s.label }));
const LAYOUT_OPTIONS = POPUP_TEMPLATES.map((template) => ({
  value: template.key,
  label: <span title={template.description}>{template.label}</span>,
}));

// Stretch segments to fill the panel width.
const fullWidth = 'flex w-full [&>button]:flex-1 [&>button]:px-2';

const CreativeSection = ({ popup, validation, onChange, onSurfaceChange, onTemplateChange }) => {
  const isApp = popup.surface === 'app';

  return (
    <Section
      step={1}
      title="Surface & creative"
      hint="Web and app are separate popups — the surface decides the creative."
    >
      {/* Surface first: everything below depends on it */}
      <SegmentedControl
        options={SURFACE_OPTIONS}
        value={popup.surface}
        onChange={onSurfaceChange}
        className={fullWidth}
      />

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
        <p className="text-[12px] leading-4 text-danger">{errorFor(validation, 'creative')}</p>
      )}

      <div>
        <p className={labelClass}>Layout</p>
        <SegmentedControl
          options={LAYOUT_OPTIONS}
          value={popup.templateKey}
          onChange={onTemplateChange}
          size="sm"
          className={fullWidth}
        />
      </div>
    </Section>
  );
};

export default CreativeSection;
