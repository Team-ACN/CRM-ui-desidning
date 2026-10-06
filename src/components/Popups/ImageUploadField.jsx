import React, { useRef, useState } from 'react';
import { Upload, Trash2, AlertTriangle } from 'lucide-react';
import { pressable } from '../cms-ui';
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
        <p className="text-[13px] font-medium text-label">{label}</p>
        <span className="text-[12px] text-tertiary tabular-nums">{hint}</span>
      </div>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden bg-fill shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)]">
          <img src={value} alt="" className="w-full h-24 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-[background-color,opacity] duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => inputRef.current?.click()}
              className={`h-8 px-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-[13px] font-medium cursor-pointer ${pressable}`}
            >
              Replace
            </button>
            <button
              onClick={() => {
                onChange('');
                setNote('');
                setError('');
              }}
              aria-label="Remove creative"
              className={`w-8 h-8 flex items-center justify-center bg-white text-danger rounded-full cursor-pointer ${pressable}`}
            >
              <Trash2 size={14} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-24 flex flex-col items-center justify-center gap-1.5 border border-dashed border-separator rounded-2xl text-secondary hover:border-accent/50 hover:bg-accent-soft hover:text-accent transition-colors cursor-pointer"
        >
          <Upload size={16} strokeWidth={1.75} />
          <span className="text-[13px] font-medium">Upload creative</span>
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
        <p className={`mt-1.5 flex items-start gap-1.5 text-[12px] leading-4 ${error ? 'text-danger' : 'text-warning'}`}>
          <AlertTriangle size={14} strokeWidth={1.75} className="shrink-0" />
          {error || note}
        </p>
      )}
    </div>
  );
};

export default ImageUploadField;
