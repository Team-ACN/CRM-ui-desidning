import React, { useState } from 'react';
import { Upload, AlertTriangle, Check, Trash2, Monitor, Tablet } from 'lucide-react';
import { TOP_BANNER_SPEC, getTopBannerWarnings, readImageFile } from './topBannerSpec';

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
      className="relative w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100 bg-no-repeat"
      style={{
        aspectRatio: `${width} / ${TOP_BANNER_SPEC.height}`,
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: 'auto 100%',
        backgroundPosition: 'right center',
      }}
    >
      <div
        className="absolute inset-y-0 border-2 border-dashed border-amber-400 bg-amber-300/15 flex items-end justify-center pb-1"
        style={{ right: `${(rightPadding / width) * 100}%`, width: `${(safeArea.width / width) * 100}%` }}
      >
        <span className="text-[8px] font-semibold text-amber-800 bg-amber-100/90 px-1 rounded">Safe area</span>
      </div>
      {!imageUrl && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">No image</span>
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
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-[11px] text-gray-600 space-y-0.5">
        <p className="font-semibold text-gray-800">Banner spec</p>
        <p>Size: {spec.width}×{spec.height}px · JPG, PNG, WebP · max {spec.maxFileSizeMb}MB</p>
        <p>
          Keep text & logos inside the {spec.safeArea.width}×{spec.height} safe area on the right
          ({spec.safeArea.rightPaddingDesktop}px from edge on desktop, {spec.safeArea.rightPaddingMobile}px on smaller screens).
          The left side crops as screens get smaller.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-600">Preview</label>
          <div className="flex bg-gray-100 rounded-md p-0.5">
            {Object.entries(PREVIEW_VIEWPORTS).map(([key, { label, icon }]) => {
              const Icon = icon;
              return (
              <button
                key={key}
                type="button"
                onClick={() => setViewport(key)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  viewport === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={10} /> {label}
              </button>
              );
            })}
          </div>
        </div>
        <BannerPreview imageUrl={config.imageUrl} viewport={viewport} />
      </div>

      <div className="flex gap-2">
        <label className="flex-1 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-50 hover:border-emerald-300 rounded-lg px-3 py-2 text-xs text-gray-700 font-medium transition-colors cursor-pointer">
          <Upload size={12} className="mr-1.5 text-emerald-600" />
          {config.imageUrl ? 'Replace Image' : 'Upload Image'}
          <input type="file" accept={spec.acceptedTypes.join(',')} className="hidden" onChange={handleFile} />
        </label>
        {config.imageUrl && (
          <button
            type="button"
            onClick={() => onChange({ imageUrl: '', imageMeta: null })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
            aria-label="Remove image"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {uploadError && <p className="text-[11px] text-red-600">{uploadError}</p>}

      {config.imageUrl && warnings.length === 0 && config.imageMeta && (
        <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium bg-emerald-50 px-2 py-1 rounded">
          <Check size={10} /> {config.imageMeta.width}×{config.imageMeta.height} · matches spec
        </div>
      )}

      {warnings.length > 0 && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
          {warnings.map((warning) => (
            <p key={warning} className="text-[11px] text-amber-800 flex items-start gap-1.5">
              <AlertTriangle size={12} className="mt-px shrink-0" /> {warning}
            </p>
          ))}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Click-through URL (optional)</label>
        <input
          type="text"
          placeholder="https://"
          value={config.linkUrl || ''}
          onChange={(e) => onChange({ linkUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Alt text</label>
        <input
          type="text"
          placeholder="e.g. Lakeside apartments at sunset"
          value={config.altText || ''}
          onChange={(e) => onChange({ altText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};

export default TopBannerSettings;
