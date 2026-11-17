import React, { useRef, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { COMPONENT_TYPES, SYSTEM_WIDGETS, getComponent, resolvePage, componentTitle } from '../../../data/mockCms';
import AppHeader from './appPreview/AppHeader';
import PageBackground from './appPreview/PageBackground';
import { ExploreFooter } from './appPreview/PageExtras';

const cssRatio = (ratio) => ratio.replace(':', ' / ');
const isHex = (v) => /^#[0-9A-Fa-f]{6}$/.test(v || '');
const ring = (selected) => (selected ? 'ring-2 ring-neutral-900 ring-offset-2' : 'hover:ring-2 hover:ring-neutral-300 hover:ring-offset-2');

// Space the header takes at the top of the scroll area (top bar + search + tab strip).
// Slimmer phone: the whole frame is scaled down, content keeps its real 390-wide proportions.
const PHONE_ZOOM = 0.82;
const HEADER_INSET = { home: 244, properties: 244, services: 184 };

function Image16({ url }) {
  return url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={16} className="m-auto text-tertiary" />;
}

// Horizontal rail that scrolls with trackpad/touch and also by dragging with the mouse.
function HScroll({ children, step, onIndex, className = '' }) {
  const ref = useRef(null);
  const drag = useRef(null);
  return (
    <div
      ref={ref}
      className={`flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing ${className}`}
      onScroll={(e) => onIndex && onIndex(Math.round(e.currentTarget.scrollLeft / step))}
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') return;
        drag.current = { x: e.clientX, left: ref.current.scrollLeft };
      }}
      onPointerMove={(e) => {
        if (drag.current) ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      {children}
    </div>
  );
}

function CmsBlock({ item }) {
  const [dot, setDot] = useState(0);
  const component = getComponent(item.componentId);
  if (!component) return null;
  const meta = COMPONENT_TYPES[component.type];
  const posts = component.items.filter((it) => !it.hidden).slice(0, item.maxCount || undefined);

  if (meta.inventory) return <SystemBox label={component.config?.heading || componentTitle(component)} />;

  if (component.type === 'mobile_top_banner') {
    return (
      <div className="w-full bg-[#F3F4F6]" style={{ aspectRatio: cssRatio(meta.ratio) }}>
        <Image16 url={component.items[0]?.imageUrl?.url} />
      </div>
    );
  }
  if (component.type === 'mobile_banner') {
    return (
      <div className="mx-4 mb-4 rounded-2xl overflow-hidden shadow-card bg-fill" style={{ width: '91.5%', aspectRatio: '179 / 68' }}>
        <Image16 url={component.items[0]?.imageUrl?.url} />
      </div>
    );
  }
  if (component.type === 'feed_carousel') {
    return (
      <div className="pt-8">
        <HScroll step={366} onIndex={setDot} className="gap-2 px-4">
          {posts.map((it) => (
            <div key={it.id} className="shrink-0 rounded-2xl overflow-hidden bg-fill border border-black/5" style={{ width: 358, aspectRatio: '179 / 88' }}>
              <Image16 url={it.imageUrl?.url} />
            </div>
          ))}
        </HScroll>
        <div className="flex justify-center gap-1.5 mt-3 mb-4">
          {posts.map((it, i) => (
            <span key={it.id} className={`h-1.5 rounded-full ${i === dot ? 'w-4 bg-neutral-800' : 'w-1.5 bg-neutral-300'}`} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="py-4">
      <HScroll step={293} className="gap-3 px-4">
        {posts.map((it) => (
          <div key={it.id} className="shrink-0 rounded-2xl overflow-hidden bg-fill" style={{ width: 281, aspectRatio: '4 / 5' }}>
            <Image16 url={it.imageUrl?.url} />
          </div>
        ))}
      </HScroll>
    </div>
  );
}

// Auto (system) widgets are not ours to design: a plain grey square with the name in the middle.
function SystemBox({ label }) {
  return (
    <div className="mx-4 my-3 rounded-2xl bg-neutral-200 flex items-center justify-center text-center px-6 text-[15px] font-medium text-neutral-500" style={{ aspectRatio: '1 / 1' }}>
      {label}
    </div>
  );
}

function HiddenSlot({ label }) {
  return <div className="mx-4 my-2 rounded-xl border border-dashed border-neutral-300 h-14 flex items-center justify-center text-[11px] text-neutral-300">{label}</div>;
}

// The page exactly as the app builds it: header, page art, then the template's widgets in order.
// Click a widget to select it. A widget hidden for this template stays as an empty dashed slot.
// gap = space left free above + below the phone, so it fills the rest of the screen height.
const PhoneMockup = ({ page, templateId, selectedRowId, onSelect, gap = 112, zoom = PHONE_ZOOM }) => {
  const items = resolvePage(page.key, templateId);
  const [scrollY, setScrollY] = useState(0);

  const topItem = items.find((i) => i.row.kind === 'top' && !i.hidden);
  const topComponent = topItem ? getComponent(topItem.componentId) : null;
  const tint = isHex(topComponent?.color) ? topComponent.color : undefined;
  // Services has no app chrome in the mockup: only what we add (top banner + components).
  const bare = page.key === 'services';
  const inset = bare ? 0 : HEADER_INSET[page.key] || 244;

  return (
    <div
      className="relative w-[406px] shrink-0 rounded-[46px] border-[8px] border-neutral-800 shadow-raised overflow-hidden bg-[#FAFAFA]"
      style={{ zoom, height: `calc((100vh - ${gap}px) / ${zoom})` }}
    >
      {!bare && <PageBackground page={page.key} color={tint} scrollY={scrollY} />}
      <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}>
        <div style={{ paddingTop: inset }}>
          {items.map((item) => {
            const { row } = item;
            const selected = selectedRowId === row.id;
            let body;
            if (item.hidden) {
              body = <HiddenSlot label={row.kind === 'system' ? SYSTEM_WIDGETS[row.widget].label : componentTitle(getComponent(row.componentId))} />;
            } else if (row.kind === 'system') {
              body = <SystemBox label={item.heading || SYSTEM_WIDGETS[row.widget].label} />;
            } else {
              body = <CmsBlock item={item} />;
            }
            return (
              <div key={row.id} className={`relative ${selected ? 'z-[1]' : ''}`}>
                <button type="button" onClick={() => onSelect && onSelect(row)} className={`block w-full text-left rounded-lg transition-shadow ${onSelect ? ring(selected) : 'cursor-default'}`}>
                  {item.state === 'override' && !item.hidden && (
                    <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-full bg-neutral-900/80 text-white text-[9px] font-semibold">Override</span>
                  )}
                  {body}
                </button>
              </div>
            );
          })}
          {!bare && <ExploreFooter />}
        </div>
      </div>
      {!bare && (
        <div className="absolute inset-x-0 top-0 z-20">
          <AppHeader page={page.key} scrolled={scrollY > 40} tint={tint} />
        </div>
      )}
    </div>
  );
};

export default PhoneMockup;
