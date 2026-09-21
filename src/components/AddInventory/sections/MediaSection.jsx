import React, { useRef } from 'react';
import { Image, Upload, X } from 'lucide-react';
import FormSection from '../FormSection';

const MAX_IMAGES = 100;

const FileList = ({ files, onRemove }) =>
  files.length === 0 ? null : (
    <ul className="flex flex-col gap-1 mt-3">
      {files.map((name, index) => (
        <li
          key={`${name}-${index}`}
          className="flex items-center justify-between gap-2 px-3 py-1.5 rounded bg-gray-50 text-xs text-gray-700"
        >
          <span className="truncate">{name}</span>
          <button type="button" onClick={() => onRemove(index)} className="p-0.5 text-gray-400 hover:text-gray-900">
            <X size={12} />
          </button>
        </li>
      ))}
    </ul>
  );

const DropZone = ({ title, subtitle, buttonLabel, buttonClass, accept, onPick }) => {
  const inputRef = useRef(null);

  return (
    <div className="border border-dashed border-gray-300 rounded-lg py-10 flex flex-col items-center gap-2">
      <Upload size={26} className="text-gray-400" />
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>

      <button type="button" onClick={() => inputRef.current?.click()} className={buttonClass}>
        {buttonLabel}
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(event) => {
          onPick([...event.target.files].map((file) => file.name));
          event.target.value = '';
        }}
      />
    </div>
  );
};

const MediaSection = ({ media, onAdd, onRemove }) => (
  <FormSection step={5} title="Media Details">
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-bold text-gray-900">Photos</h3>

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[15px] font-bold text-gray-900">
          <Image size={18} className="text-gray-500" />
          Property Images
        </span>
        <span className="text-sm text-gray-500">
          {media.photos.length} of {MAX_IMAGES} images
        </span>
      </div>

      <DropZone
        title="Click to upload or drag and drop"
        subtitle="PNG, JPG, JPEG up to 10MB each"
        buttonLabel="Choose Images / Videos"
        buttonClass="mt-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
        accept="image/*,video/*"
        onPick={(names) => onAdd('photos', names)}
      />

      <FileList files={media.photos} onRemove={(index) => onRemove('photos', index)} />
    </div>

    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <span className="flex items-center gap-2 text-[15px] font-bold text-gray-900">
          <span className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300">
            <Upload size={15} className="text-gray-600" />
          </span>
          Upload files
        </span>
        <span className="text-sm text-gray-500">{media.documents.length} files</span>
      </div>

      <div className="pt-4">
        <DropZone
          title="Choose a file or drag & drop it here"
          subtitle="PDFs and Documents only"
          buttonLabel="Browse Files"
          buttonClass="mt-2 px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm font-semibold hover:bg-gray-50"
          accept=".pdf,.doc,.docx"
          onPick={(names) => onAdd('documents', names)}
        />

        <FileList files={media.documents} onRemove={(index) => onRemove('documents', index)} />
      </div>
    </div>
  </FormSection>
);

export default MediaSection;
