import React, { useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { COMPONENT_TYPES } from '../../../data/mockCms';

function Img({ url }) {
  return url ? <img src={url} alt="" draggable={false} className="w-full h-full object-cover select-none pointer-events-none" /> : <ImageIcon size={16} className="m-auto text-tertiary" />;
}

// A component's picture(s). In layout rows: fixed height, carousels scroll sideways. In the library
// (`library`): single banners full width; carousels scroll sideways (trackpad, scrollbar or mouse
// drag) — 4:5 carousels show two cards at a time.
const ComponentStrip = ({ component, height = 120, library = false }) => {
  const ref = useRef(null);
  const drag = useRef(null);
  const meta = COMPONENT_TYPES[component?.type];
  if (!meta) return null;
  if (meta.inventory) {
    return (
      <div className="rounded-lg bg-neutral-200 flex items-center justify-center px-3 text-[12px] font-medium text-neutral-500 text-center" style={{ height, width: 200 }}>
        {component.config?.heading || component.internalName}
      </div>
    );
  }
  const [rw, rh] = meta.ratio.split(':').map(Number);
  if (!meta.carousel) {
    if (library) {
      return (
        <div className="w-full rounded-lg overflow-hidden bg-fill flex items-center justify-center" style={{ aspectRatio: `${rw} / ${rh}` }}>
          <Img url={component.items[0]?.imageUrl?.url} />
        </div>
      );
    }
    return (
      <div className="rounded-lg overflow-hidden bg-fill flex items-center justify-center" style={{ height, width: Math.round((height * rw) / rh), maxWidth: '100%' }}>
        <Img url={component.items[0]?.imageUrl?.url} />
      </div>
    );
  }
  const tall = library && meta.ratio === '4:5';
  const wide = library && !tall; // library carousels: one post at a time, with the next peeking in
  return (
    <div
      ref={ref}
      className={`w-full flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin] ${library ? '' : 'cursor-grab active:cursor-grabbing'}`}
      onPointerDown={(e) => {
        // In the library a mouse drag moves the whole card; scroll there with trackpad/scrollbar.
        if (!library && e.pointerType === 'mouse') drag.current = { x: e.clientX, left: ref.current.scrollLeft };
      }}
      onPointerMove={(e) => {
        if (drag.current) ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      {component.items.map((it) => (
        <div
          key={it.id}
          className="shrink-0 rounded-lg overflow-hidden bg-fill ring-1 ring-inset ring-neutral-200 flex items-center justify-center"
          style={tall ? { width: 'calc((100% - 6px) / 2)', aspectRatio: '4 / 5' } : wide ? { width: '86%', aspectRatio: `${rw} / ${rh}` } : { height, width: Math.round((height * rw) / rh) }}
        >
          <Img url={it.imageUrl?.url} />
        </div>
      ))}
    </div>
  );
};

export default ComponentStrip;
