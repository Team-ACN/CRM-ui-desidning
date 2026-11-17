import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Image as ImageIcon, Pencil, Archive, Copy, AlertCircle, Eye, MousePointerClick, Plus } from 'lucide-react';
import { useToast } from './index';
import { getCards, cardStats, getComponents, getComponent, setComponentStatus, COMPONENT_TYPES } from '../../data/mockCms';
import { SearchCircle, ArchiveCircle } from './ToolbarIcons';
import ComponentDrawer from './ComponentDrawer';
import CardDrawer from './CardDrawer';
import InventoryDrawer from './InventoryDrawer';
import StatusTag from './StatusTag';
import { formatInr } from './formatInr';

const GROUPS = [
  { key: 'mobile_top_banner', name: 'Top banner', variants: ['mobile_top_banner'] },
  { key: 'desktop_top_banner', name: 'Top banner', device: 'Desktop', variants: ['desktop_top_banner'] },
  { key: 'mobile_banner', name: 'Banner', variants: ['mobile_banner'] },
  { key: 'desktop_banner', name: 'Banner', device: 'Desktop', variants: ['desktop_banner'] },
  { key: 'feed_carousel', name: 'Carousel', variants: ['feed_carousel'] },
  { key: 'feed_vertical_carousel', name: '4:5 Carousel', variants: ['feed_vertical_carousel'] },
  { key: 'inventory', name: 'Inventory', variants: ['inventory'] },
];

// Cards per row: 3 for the Carousel, 4 for the 4:5 Carousel (the grid uses one more column for the add tile).
const CAROUSEL_VISIBLE = { feed_carousel: 3, feed_vertical_carousel: 4 };

const cssRatio = (ratio) => ratio.replace(':', ' / ');

function range(min, max, format, unit = '') {
  if (min && max) return `${format(min)} – ${format(max)}${unit}`;
  if (min) return `${format(min)}+${unit}`;
  if (max) return `Up to ${format(max)}${unit}`;
  return null;
}
const fmt = (n) => n.toLocaleString('en-IN');
const ctr = (clicks, views) => (views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0');

function componentWarning(component) {
  const meta = COMPONENT_TYPES[component.type];
  if (component.items.length < meta.minItems) return `Only ${component.items.length} of minimum ${meta.minItems} items`;
  const today = new Date().toISOString().slice(0, 10);
  if (component.items.some((it) => it.endDate && it.endDate < today)) return '1 item expired';
  if (component.items.some((it) => !it.linkUrl)) return 'An item has no link';
  return null;
}

const CmsComponentsPage = () => {
  const [, forceRender] = useState(0);
  const bump = () => forceRender((v) => v + 1);
  const toast = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const openId = searchParams.get('open');
  const openType = searchParams.get('type');

  const [groupKey, setGroupKey] = useState(GROUPS[0].key);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('active');
  const [scrolled, setScrolled] = useState(false);
  const [cardEdit, setCardEdit] = useState(null);

  const openDrawer = (id, t) => setSearchParams(id ? { open: id, ...(t ? { type: t } : {}) } : {});
  const closeDrawer = () => setSearchParams({});

  const group = GROUPS.find((g) => g.key === groupKey);

  function visibleFor(variant) {
    return getComponents().filter((c) => {
      if (c.type !== variant) return false;
      if (tab === 'archived' ? c.status !== 'archived' : c.status === 'archived') return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const matchesName = c.internalName.toLowerCase().includes(q);
        const matchesTag = c.tags.some((t) => t.toLowerCase().includes(q));
        const matchesAlt = c.items.some((it) => `${it.name || ''} ${it.description || ''}`.toLowerCase().includes(q));
        const cfg = c.config;
        const matchesCfg = cfg && [cfg.assetType, cfg.zone, ...cfg.propertyIds].some((v) => (v || '').toLowerCase().includes(q));
        if (!matchesName && !matchesTag && !matchesAlt && !matchesCfg) return false;
      }
      return true;
    });
  }

  function handleArchive(c) {
    setComponentStatus(c.id, 'archived');
    bump();
    toast(`Archived '${c.internalName}'`, {
      undo: () => {
        setComponentStatus(c.id, 'inactive');
        bump();
      },
    });
  }

  const actions = (c) => <CardActions status={c.status} onEdit={() => openDrawer(c.id)} onArchive={() => handleArchive(c)} />;

  function copyList(list, label) {
    navigator.clipboard?.writeText(list.join('\n')).then(() => toast(`Copied ${list.length} ${label} CPIDs`));
  }

  const openComponent = openId && openId !== 'new' ? getComponent(openId) : null;
  const drawerType = openComponent?.type || (openType && COMPONENT_TYPES[openType] ? openType : group.variants[0]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div
        className={`shrink-0 px-6 pt-5 pb-4 flex items-center justify-between gap-3 flex-wrap border-b transition-colors ${
          scrolled ? 'border-separator' : 'border-transparent'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {GROUPS.map((g) => {
            const active = groupKey === g.key;
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => setGroupKey(g.key)}
                className={`px-3 py-1.5 rounded-xl border text-left transition-colors ${
                  active ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-surface text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <span className="block text-[13px] font-medium leading-tight whitespace-nowrap">{g.name}</span>
                <span className={`block text-[11px] leading-tight mt-0.5 whitespace-nowrap ${active ? 'text-white/60' : 'text-tertiary'}`}>
                  {CAROUSEL_VISIBLE[g.key] ? 'Mobile + Desktop' : g.device || 'Mobile'}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SearchCircle value={query} onChange={setQuery} />
          <ArchiveCircle active={tab === 'archived'} onToggle={() => setTab((t) => (t === 'archived' ? 'active' : 'archived'))} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-10" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}>
        {group.variants.map((variant) => {
          const meta = COMPONENT_TYPES[variant];
          const rows = visibleFor(variant);
          const gridCols = meta.carousel ? '' : meta.inventory || meta.platform === 'app' ? 'grid grid-cols-3 gap-5' : 'grid grid-cols-1 gap-5';
          const visible = CAROUSEL_VISIBLE[variant];
          const addBox = (
            <button
              type="button"
              onClick={() => openDrawer('new', variant)}
              className="rounded-2xl border border-neutral-200 bg-neutral-100/70 flex flex-col text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
              style={meta.carousel ? { width: `calc((100% - 2.5rem - ${visible - 1}rem) / ${visible})` } : undefined}
            >
              <span
                className="flex-1 w-full flex flex-col items-center justify-center gap-1"
                style={meta.inventory ? { minHeight: 170 } : { aspectRatio: cssRatio(meta.ratio) }}
              >
                <Plus size={18} />
                <span className="text-[13px] font-medium">New {meta.label}</span>
                {meta.ratio && <span className="text-[11.5px] text-tertiary tabular-nums">{meta.ratio}</span>}
              </span>
            </button>
          );
          const activeRows = tab === 'active' ? rows.filter((c) => c.status === 'live') : [];
          const otherRows = tab === 'active' ? rows.filter((c) => c.status === 'inactive') : rows;
          const renderRow = (list) =>
            list.map((c) => <BannerCard key={c.id} component={c} meta={meta} onOpen={() => openDrawer(c.id)} actions={actions(c)} onCopy={copyList} />);
          if (meta.carousel) {
            const q = query.trim().toLowerCase();
            const cards = getCards(variant).filter((c) => !q || c.name.toLowerCase().includes(q));
            return (
              <div key={variant} className={`grid gap-5 ${visible === 4 ? 'grid-cols-5' : 'grid-cols-3'}`}>
                {tab === 'active' && (
                  <button type="button" onClick={() => setCardEdit({ id: null, type: variant })} className="min-h-[120px] rounded-2xl border border-neutral-200 bg-neutral-100/70 flex flex-col items-center justify-center gap-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors">
                    <Plus size={18} />
                    <span className="text-[13px] font-medium">Add card</span>
                  </button>
                )}
                {cards.map((c) => {
                  const st = cardStats(c.id);
                  return (
                    <div key={c.id} className="bg-surface rounded-2xl shadow-card overflow-hidden">
                      <button type="button" onClick={() => setCardEdit({ id: c.id, type: variant })} className="relative w-full bg-fill flex items-center justify-center" style={{ aspectRatio: cssRatio(meta.ratio) }}>
                        {c.imageUrl ? <img src={c.imageUrl.url} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={22} className="text-tertiary" strokeWidth={1.5} />}
                        <StatusTag overlay status="live" />
                      </button>
                      <div className="px-4 pt-3 pb-4">
                        <button type="button" onClick={() => setCardEdit({ id: c.id, type: variant })} className="block min-w-0 max-w-full text-left">
                          <p className="text-[13.5px] font-semibold text-label truncate">{c.name}</p>
                        </button>
                        <Stats className="mt-2" views={st.views} clicks={st.clicks} onCopyViewers={() => copyList(st.viewerCpids, 'viewer')} onCopyClickers={() => copyList(st.clickerCpids, 'clicker')} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }
          if (meta.inventory) {
            const tableRows = [...activeRows, ...otherRows];
            return (
              <div key={variant} className="space-y-4">
                {tab === 'active' && (
                  <button
                    type="button"
                    onClick={() => openDrawer('new', variant)}
                    className="w-full h-14 rounded-2xl border border-neutral-200 bg-neutral-100/70 flex items-center justify-center gap-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                  >
                    <Plus size={16} />
                    <span className="text-[13px] font-medium">New Inventory</span>
                  </button>
                )}
                {tableRows.length > 0 && (
                  <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-separator text-left text-[12px] text-secondary">
                          <th className="px-5 py-3 font-medium">Inventory</th>
                          <th className="px-4 py-3 font-medium w-28 text-center">Status</th>
                          <th className="pl-4 pr-6 py-3 w-24 font-medium text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.map((c) => (
                          <InventoryRow key={c.id} component={c} onOpen={() => openDrawer(c.id)} actions={actions(c)} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          }
          return (
            <div key={variant} className={meta.carousel ? 'space-y-5' : gridCols}>
              {tab === 'active' && addBox}
              {renderRow(activeRows)}
              {activeRows.length > 0 && otherRows.length > 0 && <div className="col-span-full border-t border-separator my-5" />}
              {renderRow(otherRows)}
            </div>
          );
        })}
      </div>

      {cardEdit && <CardDrawer id={cardEdit.id} type={cardEdit.type} onClose={() => setCardEdit(null)} onChanged={bump} />}
      {openId &&
        (drawerType === 'inventory' ? (
          <InventoryDrawer id={openId === 'new' ? null : openId} onClose={closeDrawer} onChanged={bump} />
        ) : (
          <ComponentDrawer id={openId === 'new' ? null : openId} initialType={drawerType} onClose={closeDrawer} onChanged={bump} />
        ))}
    </div>
  );
};

function InventoryRow({ component: c, onOpen, actions }) {
  const cfg = c.config;
  const manual = cfg.propertyIds.length > 0;
  const chips = manual
    ? [`${cfg.propertyIds.length} property ID${cfg.propertyIds.length === 1 ? '' : 's'}`, ...cfg.propertyIds.slice(0, 4)]
    : [
        cfg.assetType,
        ...cfg.configs,
        cfg.zone,
        range(cfg.priceMin, cfg.priceMax, formatInr),
        range(cfg.plotAreaMin, cfg.plotAreaMax, (v) => Number(v).toLocaleString('en-IN'), ' sq.ft plot'),
        range(cfg.sbuaMin, cfg.sbuaMax, (v) => Number(v).toLocaleString('en-IN'), ' sq.ft'),
        cfg.mustHaveMedia ? 'Images / video required' : null,
      ].filter(Boolean);
  return (
    <tr onClick={onOpen} className="border-b border-separator last:border-0 cursor-pointer hover:bg-fill/50 transition-colors">
      <td className="px-5 py-3.5 min-h-[48px]">
        <p className="font-semibold text-label">{c.internalName}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {chips.map((chip) => (
            <span key={chip} className="inline-flex items-center h-5 px-2 rounded-full bg-neutral-100 text-[11px] text-neutral-600">
              {chip}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3.5 text-center">
        <StatusTag status={c.status} />
      </td>
      <td className="pl-4 pr-6 py-3.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-2">{actions}</div>
      </td>
    </tr>
  );
}

function BannerCard({ component: c, meta, onOpen, actions, onCopy }) {
  const warning = componentWarning(c);
  const thumb = c.items[0]?.imageUrl;
  return (
    <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
      <button
        type="button"
        onClick={onOpen}
        className="relative w-full bg-fill flex items-center justify-center"
        style={{ aspectRatio: cssRatio(meta.ratio), ...(c.color ? { backgroundColor: c.color } : {}) }}
      >
        {thumb ? <img src={thumb.url} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={22} className="text-tertiary" strokeWidth={1.5} />}
        <StatusTag overlay status={c.status} />
        {warning && (
          <span title={warning} className="absolute top-2.5 right-2.5 text-warning bg-surface rounded-full p-1 shadow-card">
            <AlertCircle size={13} />
          </span>
        )}
      </button>
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onOpen} className="min-w-0 flex items-center gap-2 text-left">
            <p className="text-[13.5px] font-semibold text-label truncate">{c.internalName}</p>
          </button>
          {actions}
        </div>
        <Stats
          className="mt-2"
          views={c.analytics.viewsOverall}
          clicks={c.analytics.clicksOverall}
          onCopyViewers={() => onCopy(c.analytics.viewerCpids, 'viewer')}
          onCopyClickers={() => onCopy(c.analytics.clickerCpids, 'clicker')}
        />
      </div>
    </div>
  );
}

function Stats({ views, clicks, onCopyViewers, onCopyClickers, className = '' }) {
  const copyBtn = (title, onClick) => (
    <button type="button" title={title} onClick={onClick} className="text-tertiary hover:text-neutral-900">
      <Copy size={11} />
    </button>
  );
  return (
    <span className={`flex items-center gap-3 text-[11px] text-secondary tabular-nums ${className}`}>
      <span className="flex items-center gap-1" title="Views">
        <Eye size={11} /> {fmt(views)} {copyBtn('Copy CPIDs who saw', onCopyViewers)}
      </span>
      <span className="flex items-center gap-1" title="Clicks">
        <MousePointerClick size={11} /> {fmt(clicks)} {copyBtn('Copy CPIDs who clicked', onCopyClickers)}
      </span>
      <span className="font-medium text-neutral-700">{ctr(clicks, views)}%</span>
    </span>
  );
}

// Active components can't be archived; only an inactive one gets the Archive button.
function CardActions({ status, onEdit, onArchive }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {status === 'inactive' && (
        <button
          type="button"
          title="Archive"
          onClick={onArchive}
          className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <Archive size={13} />
        </button>
      )}
      <button
        type="button"
        title="Edit"
        onClick={onEdit}
        className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
      >
        <Pencil size={13} />
      </button>
    </div>
  );
}

export default CmsComponentsPage;
