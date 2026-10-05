import React, { useState } from 'react';
import { Upload, AlertTriangle, Check, Trash2, Monitor, Tablet } from 'lucide-react';
import { TOP_BANNER_SPEC, getTopBannerWarnings, readImageFile } from './topBannerSpec';
import { IconButton, SegmentedControl, fieldClass, labelClass } from '../cms-ui';

const PREVIEW_VIEWPORTS = {
  desktop: { label: 'Desktop', icon: Monitor, width: TOP_BANNER_SPEC.width, rightPadding: TOP_BANNER_SPEC.safeArea.rightPaddingDesktop },
  tablet: { label: 'Tablet', icon: Tablet, width: 803, rightPadding: TOP_BANNER_SPEC.safeArea.rightPaddingMobile },
};

// Shows how the hero crops at a given viewport, with the text-safe area outlined.
const BannerPreview = ({ imageUrl, viewport }) => {
  const { width, rightPadding } = PREVIEW_VIEWPORTS[viewport];
  const safeArea = TOP_BANNER_SPEC.safeArea;

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden bg-fill shadow-card bg-no-repeat"
      style={{
        aspectRatio: `${width} / ${TOP_BANNER_SPEC.height}`,
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: 'auto 100%',
        backgroundPosition: 'right center',
      }}
    >
      <div
        className="absolute inset-y-0 border-[1.5px] border-dashed border-warning-dot bg-warning-dot/10 flex items-end justify-center pb-1"
        style={{ right: `${(rightPadding / width) * 100}%`, width: `${(safeArea.width / width) * 100}%` }}
      >
        <span className="text-[12px] leading-4 font-medium text-warning bg-surface/90 px-1.5 rounded">Safe area</span>
      </div>
      {!imageUrl && (
        <span className="absolute inset-0 flex items-center justify-center text-[12px] text-tertiary">No image</span>
      )}
    </div>
  );
};

const TopBannerSettings = ({ config, onChange }) => {
  const [viewport, setViewport] = useState('desktop');
  const [uploadError, setUploadError] = useState('');
  const spec = TOP_BANNER_SPEC;
  const warnings = config.imageMeta ? getTopBannerWarnings(config.imageMeta) : [];

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError('');
    try {
      const { dataUrl, width, height } = await readImageFile(file);
      onChange({ imageUrl: dataUrl, imageMeta: { type: file.type, size: file.size, width, height } });
    } catch (error) {
      setUploadError(error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-fill rounded-xl text-[12px] leading-[18px] text-secondary space-y-1">
        <p className="text-[13px] font-medium text-label">Banner spec</p>
        <p className="tabular-nums">{spec.width}×{spec.height}px · JPG, PNG, WebP · max {spec.maxFileSizeMb}MB</p>
        <p>
          Keep text & logos inside the {spec.safeArea.width}×{spec.height} safe area on the right
          ({spec.safeArea.rightPaddingDesktop}px from edge on desktop, {spec.safeArea.rightPaddingMobile}px on smaller screens).
          The left side crops as screens get smaller.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`${labelClass} mb-0!`}>Preview</label>
          <SegmentedControl
            size="sm"
            value={viewport}
            onChange={setViewport}
            options={Object.entries(PREVIEW_VIEWPORTS).map(([key, { label }]) => ({ value: key, label }))}
          />
        </div>
        <BannerPreview imageUrl={config.imageUrl} viewport={viewport} />
      </div>

      <div className="flex gap-2">
        <label className="flex-1 flex items-center justify-center h-9 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.97] rounded-lg px-4 text-sm text-gray-700 font-medium transition-[transform,background-color] duration-100 cursor-pointer">
          <Upload size={16} strokeWidth={1.75} className="mr-1.5 text-secondary" />
          {config.imageUrl ? 'Replace image' : 'Upload image'}
          <input type="file" accept={spec.acceptedTypes.join(',')} className="hidden" onChange={handleFile} />
        </label>
        {config.imageUrl && (
          <IconButton
            icon={Trash2}
            label="Remove image"
            onClick={() => onChange({ imageUrl: '', imageMeta: null })}
            className="w-9! h-9! hover:text-danger! hover:bg-danger-soft!"
          />
        )}
      </div>

      {uploadError && <p className="text-[12px] text-danger">{uploadError}</p>}

      {config.imageUrl && warnings.length === 0 && config.imageMeta && (
        <div className="text-[12px] text-positive flex items-center gap-1 tabular-nums">
          <Check size={14} strokeWidth={2} /> {config.imageMeta.width}×{config.imageMeta.height} · matches spec
        </div>
      )}

      {warnings.length > 0 && (
        <div className="p-3 bg-warning-dot/10 rounded-xl space-y-1.5">
          {warnings.map((warning) => (
            <p key={warning} className="text-[12px] leading-4 text-warning flex items-start gap-1.5">
              <AlertTriangle size={14} strokeWidth={1.75} className="shrink-0" /> {warning}
            </p>
          ))}
        </div>
      )}

      <div>
        <label className={labelClass}>Click-through URL (optional)</label>
        <input
          type="text"
          placeholder="https://"
          value={config.linkUrl || ''}
          onChange={(e) => onChange({ linkUrl: e.target.value })}
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Alt text</label>
        <input
          type="text"
          placeholder="e.g. Lakeside apartments at sunset"
          value={config.altText || ''}
          onChange={(e) => onChange({ altText: e.target.value })}
          className={fieldClass}
        />
      </div>
    </div>
  );
};

export default TopBannerSettings;
