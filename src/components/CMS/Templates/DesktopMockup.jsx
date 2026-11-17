import React, { useEffect, useRef, useState } from 'react';
import { Bell, Image as ImageIcon, Search } from 'lucide-react';
import { COMPONENT_TYPES, SYSTEM_WIDGETS, componentTitle, getComponent, resolvePage } from '../../../data/mockCms';

const WIDTH = 1440; // logical page width; the whole page is scaled to fit the space it is given
const cssRatio = (r) => r.replace(':', ' / ');

function Img({ url }) {
  return url ? <img src={url} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={28} className="m-auto text-neutral-400" />;
}

function Nav() {
  return (
    <div className="absolute inset-x-0 top-0 z-10 h-[88px] px-16 flex items-center justify-between text-white">
      <span className="text-[44px] font-black tracking-tight leading-none">ACN</span>
      <div className="flex items-center gap-10 text-[20px]">
        <span>Home</span>
        <span>My Business</span>
        <span>Edge ⌄</span>
        <span>Services ⌄</span>
        <span className="px-6 h-[54px] inline-flex items-center rounded-xl bg-white text-neutral-800 font-medium">+ Add Property</span>
        <span className="px-6 h-[54px] inline-flex items-center rounded-xl bg-white text-teal-700 font-semibold">● 5</span>
        <span className="w-[54px] h-[54px] inline-flex items-center justify-center rounded-xl bg-white text-neutral-700">
          <Bell size={20} />
        </span>
        <span className="w-[54px] h-[54px] inline-flex items-center justify-center rounded-full bg-white text-neutral-800 font-bold">S</span>
      </div>
    </div>
  );
}

// The Search widget: the white card that overlaps the bottom of the top banner.
function SearchCard() {
  return (
    <div className="relative z-10 -mt-[80px] mx-auto w-[1110px] rounded-3xl bg-white shadow-card border border-neutral-200 overflow-hidden">
      <div className="flex gap-12 px-8 h-[70px] items-center border-b border-neutral-200 text-[20px] text-neutral-700">
        <span className="font-semibold text-teal-700 border-b-2 border-teal-700 h-full flex items-center">Resale</span>
        <span className="flex items-center">Rental</span>
        <span className="flex items-center">Commercial</span>
      </div>
      <div className="flex items-center px-8 h-[100px] gap-8 text-[20px]">
        {[
          ['Explore', 'Search Location'],
          ['Asset Type', 'Select'],
          ['Budget', 'Select'],
          ['BHK/Size', 'Select'],
        ].map(([a, b], i) => (
          <div key={a} className={i === 0 ? 'flex-1' : 'w-[200px]'}>
            <p className="text-neutral-700">{a}</p>
            <p className="text-neutral-400">{b}</p>
          </div>
        ))}
        <span className="w-14 h-14 rounded-xl bg-teal-700 text-white inline-flex items-center justify-center">
          <Search size={22} />
        </span>
      </div>
    </div>
  );
}

// Sections of unknown size are drawn 2:1 (width : height); `stretch` fills the height of its neighbour.
const Box = ({ label, stretch, className = '' }) => (
  <div className={`rounded-2xl bg-neutral-200 flex items-center justify-center text-[22px] font-medium text-neutral-500 text-center px-6 ${className}`} style={stretch ? undefined : { aspectRatio: '2 / 1' }}>
    {label}
  </div>
);

function Hidden({ label }) {
  return <div className="mx-auto w-[1344px] my-4 h-20 rounded-2xl border-2 border-dashed border-neutral-300 flex items-center justify-center text-[18px] text-neutral-400">{label}</div>;
}

function CmsBlock({ item }) {
  const c = getComponent(item.componentId);
  if (!c) return null;
  const meta = COMPONENT_TYPES[c.type];
  const posts = c.items.filter((it) => !it.hidden).slice(0, item.maxCount || undefined);
  if (meta.inventory) return <div className="mx-auto w-[1344px] my-6"><Box label={c.config?.heading || c.internalName} /></div>;
  if (meta.carousel) {
    const per = meta.ratio === '4:5' ? 4 : 3;
    return (
      <div className="mx-auto w-[1344px] my-8 flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((it) => (
          <div key={it.id} className="shrink-0 rounded-2xl overflow-hidden bg-neutral-100" style={{ width: (1344 - (per - 1) * 24) / per, aspectRatio: cssRatio(meta.ratio) }}>
            <Img url={it.imageUrl?.url} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mx-auto w-[1344px] my-8 rounded-2xl overflow-hidden bg-neutral-100" style={{ aspectRatio: cssRatio(meta.ratio) }}>
      <Img url={c.items[0]?.imageUrl?.url} />
    </div>
  );
}

// Desktop website: nav over the top banner, search card, then the page's sections. The first
// property section is the fixed 2:1 block (properties 2/3, My Business 1/3).
// eslint-disable-next-line no-unused-vars
const DesktopMockup = ({ page, templateId, gap = 112, zoom: _zoom }) => {
  const items = resolvePage(page.key, templateId);
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const update = () => setScale(el.clientWidth / WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const top = items.find((i) => i.row.kind === 'top' && !i.hidden);
  const topComponent = top ? getComponent(top.componentId) : null;
  const pairId = items.find((i) => i.row.kind === 'system' && !i.hidden && (i.row.widget === 'RESALE_INVENTORY' || i.row.widget === 'RENTAL_INVENTORY'))?.row.id;

  return (
    <div ref={wrapRef} className="w-full rounded-2xl border-[6px] border-neutral-800 shadow-raised overflow-hidden bg-white flex flex-col" style={{ height: `calc(100vh - ${gap}px)` }}>
      <div className="shrink-0 h-7 bg-neutral-800 flex items-center gap-1.5 px-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
        ))}
      </div>
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#FAFAFA]">
        <div style={{ zoom: scale, width: WIDTH }}>
          <div className="relative bg-[#0B1F5C]" style={{ aspectRatio: '1440 / 378' }}>
            {topComponent && <Img url={topComponent.items[0]?.imageUrl?.url} />}
            <Nav />
          </div>
          {items
            .filter((i) => i.row.kind !== 'top')
            .map((item) => {
              const { row } = item;
              if (item.hidden) return <Hidden key={row.id} label={row.kind === 'system' ? SYSTEM_WIDGETS[row.widget].label : componentTitle(getComponent(row.componentId))} />;
              if (row.kind === 'cms') return <CmsBlock key={row.id} item={item} />;
              if (row.widget === 'SEARCH') return <SearchCard key={row.id} />;
              const label = item.heading || SYSTEM_WIDGETS[row.widget].label;
              if (row.id === pairId) {
                return (
                  <div key={row.id} className="mx-auto w-[1344px] my-10 grid grid-cols-2 gap-8">
                    <Box label={label} />
                    <Box label="My Business" stretch />
                  </div>
                );
              }
              return (
                <div key={row.id} className="mx-auto w-[1344px] my-6">
                  <Box label={label} />
                </div>
              );
            })}
          <div className="h-16" />
        </div>
      </div>
    </div>
  );
};

export default DesktopMockup;
