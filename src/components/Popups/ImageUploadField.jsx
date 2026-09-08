import React, { useRef, useState } from 'react';
import { Upload, Trash2, AlertTriangle } from 'lucide-react';
import { IMAGE_CONSTRAINTS } from './popupConstants';

const readImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onloadend = () => {
      const probe = new Image();
      probe.onerror = () => reject(new Error('That file is not a readable image.'));
      probe.onload = () =>
        resolve({ dataUrl: reader.result, width: probe.width, height: probe.height });
      probe.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const ImageUploadField = ({ label, hint, value, minWidth, minHeight, onChange }) => {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setNote('');

    if (!IMAGE_CONSTRAINTS.acceptedTypes.includes(file.type)) {
      setError('Use a PNG, JPG or WebP file.');
      return;
    }
    if (file.size > IMAGE_CONSTRAINTS.maxBytes) {
      setError(`File is ${(file.size / (1024 * 1024)).toFixed(1)}MB — the limit is 2MB.`);
      return;
    }

    try {
      const { dataUrl, width, height } = await readImage(file);
      if (width < minWidth || height < minHeight) {
        setNote(`Uploaded at ${width}×${height} — below the recommended ${minWidth}×${minHeight}.`);
      }
      onChange(dataUrl);
    } catch (uploadError) {
      console.error('Popup creative upload failed:', uploadError);
      setError('Upload failed. Try a different file.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] font-medium text-gray-600">{label}</p>
        <span className="text-[10px] text-gray-400">{hint}</span>
      </div>

      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200">
          <img src={value} alt="" className="w-full h-24 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1 bg-white text-gray-800 rounded-md text-[11px] font-medium cursor-pointer"
            >
              Replace
            </button>
            <button
              onClick={() => {
                onChange('');
                setNote('');
                setError('');
              }}
              className="p-1.5 bg-white text-red-600 rounded-md cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-20 flex flex-col items-center justify-center gap-1 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer"
        >
          <Upload size={15} />
          <span className="text-[11px] font-medium">Upload creative</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_CONSTRAINTS.acceptAttr}
        onChange={handleFile}
        className="hidden"
      />

      {(error || note) && (
        <p className={`mt-1.5 flex items-start gap-1.5 text-[10px] ${error ? 'text-red-600' : 'text-amber-600'}`}>
          <AlertTriangle size={11} className="mt-px shrink-0" />
          {error || note}
        </p>
      )}
    </div>
  );
};

export default ImageUploadField;
