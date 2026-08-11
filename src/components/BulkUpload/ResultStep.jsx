import React from 'react';
import { CheckCircle2, RotateCcw, ArrowRight, AlertTriangle } from 'lucide-react';
import UploadedPropertiesTable from './UploadedPropertiesTable';
import { MIN_IMAGES_PER_PROPERTY } from './propertySchema';

const ResultStep = ({ properties, imagesByProperty, fileName, onManageImages, onReset, onDone }) => {
  const needingImages = properties.filter(
    (property) => (imagesByProperty[property.key] ?? []).length < MIN_IMAGES_PER_PROPERTY,
  );
  const withImages = properties.length - needingImages.length;

  const totalImages = Object.values(imagesByProperty).reduce((count, images) => count + images.length, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-emerald-800" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} uploaded
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              From <span className="font-medium text-gray-700">{fileName}</span> · {withImages} of{' '}
              {properties.length} have images ({totalImages} total)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {needingImages.length > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-amber-700">
              <AlertTriangle size={16} />
              {needingImages.length} still need{needingImages.length === 1 ? 's' : ''} a photo
            </span>
          )}
          <button
            onClick={onReset}
            className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw size={16} />
            Upload another file
          </button>
          <button
            onClick={onDone}
            disabled={needingImages.length > 0}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View properties
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <UploadedPropertiesTable
        properties={properties}
        imagesByProperty={imagesByProperty}
        onManageImages={onManageImages}
      />
    </div>
  );
};

export default ResultStep;
