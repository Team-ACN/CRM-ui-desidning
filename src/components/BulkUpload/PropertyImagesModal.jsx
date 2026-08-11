import React, { useRef, useState } from 'react';
import { X, ImagePlus, Trash2, AlertCircle } from 'lucide-react';

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const newImageId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `img-${performance.now()}`;

const toImage = (file) => ({
  id: newImageId(),
  name: file.name,
  size: file.size,
  url: URL.createObjectURL(file),
});

const PropertyImagesModal = ({ property, images, onAddImages, onRemoveImage, onClose }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = (fileList) => {
    const files = [...(fileList ?? [])];
    if (files.length === 0) return;

    const rejected = files.filter((file) => !file.type.startsWith('image/') || file.size > MAX_IMAGE_BYTES);
    const accepted = files.filter((file) => !rejected.includes(file));
    const room = MAX_IMAGES - images.length;

    if (rejected.length > 0) {
      setError(`Skipped ${rejected.length} file(s) — images only, up to 5 MB each.`);
    } else if (accepted.length > room) {
      setError(`Only ${MAX_IMAGES} images per property. Added the first ${Math.max(room, 0)}.`);
    } else {
      setError(null);
    }

    if (room > 0 && accepted.length > 0) {
      onAddImages(property.key, accepted.slice(0, room).map(toImage));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Images — {property.propertyName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {property.propertyId} · {images.length} of {MAX_IMAGES} added
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFiles(event.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center text-center cursor-pointer transition-colors ${
              isDragging ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <ImagePlus size={20} className="text-gray-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Drop images here</p>
            <p className="text-xs text-gray-500 mt-0.5">JPG or PNG, up to 5 MB each</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => handleFiles(event.target.files)}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-4 py-2.5 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((image) => (
                <div key={image.id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                  <img src={image.url} alt={image.name} className="w-full h-24 object-cover" />
                  <button
                    onClick={() => onRemoveImage(property.key, image.id)}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-white/90 hover:bg-white text-red-700 rounded border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                  <p className="px-2 py-1.5 text-[11px] text-gray-500 truncate">{image.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyImagesModal;
