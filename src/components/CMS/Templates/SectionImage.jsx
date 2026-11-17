import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { COMPONENT_TYPES } from '../../../data/mockCms';

// A component shown as its picture at the section's real ratio (full width of whatever holds it).
const SectionImage = ({ component, className = '' }) => {
  const meta = COMPONENT_TYPES[component?.type];
  if (!meta) return null;
  const ratio = meta.inventory ? '1 / 1' : meta.ratio.replace(':', ' / ');
  const url = component.items[0]?.imageUrl?.url;
  return (
    <div className={`${meta.ratio === '4:5' ? 'w-1/2 mx-auto' : 'w-full'} overflow-hidden bg-fill flex items-center justify-center ${className}`} style={{ aspectRatio: ratio }}>
      {meta.inventory ? (
        <span className="px-4 text-center text-[13px] font-medium text-neutral-500">{component.config?.heading || component.internalName}</span>
      ) : url ? (
        <img src={url} alt="" draggable={false} className="w-full h-full object-cover select-none pointer-events-none" />
      ) : (
        <ImageIcon size={18} className="text-tertiary" />
      )}
    </div>
  );
};

export default SectionImage;
