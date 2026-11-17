import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Check, ChevronDown, ChevronRight, GripVertical, Image as ImageIcon, LayoutList, Plus } from 'lucide-react';
import { SearchField } from '../index';
import { COMPONENT_TYPES, SYSTEM_WIDGETS, componentFitsPage, getCard, getCards, getComponents, getPageMatrix, componentTitle } from '../../../data/mockCms';
import { WIDGET_ICONS } from './widgetIcons';
import ComponentStrip from './ComponentStrip';
import { componentName, typeLine } from './rowLabel';

function LibraryRow({ dragId, data, icon, thumb, title, disabled, onAdd, component, noDrag, pickMode, pickable, onPick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: dragId, data, disabled: disabled || noDrag || pickMode });
  if (component) {
    return (
      <div
        ref={setNodeRef}
        {...(noDrag || disabled || pickMode ? {} : { ...attributes, ...listeners })}
        onClick={pickMode && pickable ? onPick : undefined}
        className={`rounded-xl border bg-surface overflow-hidden transition-[opacity,box-shadow] ${
          pickMode ? (pickable ? 'border-neutral-900 ring-2 ring-neutral-900/10 cursor-pointer hover:shadow-card' : 'border-neutral-200 opacity-30') : `border-neutral-200 ${noDrag || disabled ? '' : 'cursor-grab hover:shadow-card active:cursor-grabbing'}`
        } ${isDragging ? 'opacity-30' : ''} ${disabled && !pickMode ? 'opacity-50' : ''}`}
      >
        {!COMPONENT_TYPES[component.type]?.inventory && <ComponentStrip library component={component} />}
        <div className="flex items-center gap-2 px-2.5 py-2">
          {!noDrag && !pickMode && (
            <span className="shrink-0 text-tertiary" title="Drag into the layout">
              <GripVertical size={14} />
            </span>
          )}
          <p className="min-w-0 flex-1 text-[12.5px] font-medium text-label truncate">
            {`${typeLine(component)} · ${componentName(component)}`}
          </p>
          {!disabled && !pickMode && (
            <button type="button" title="Add to page" onClick={onAdd} className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 shrink-0">
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div
      ref={setNodeRef}
      {...(disabled ? {} : { ...attributes, ...listeners })}
      className={`flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-surface px-2.5 py-2 transition-[opacity,box-shadow] ${disabled ? 'opacity-50' : 'cursor-grab hover:shadow-card active:cursor-grabbing'} ${isDragging ? 'opacity-30' : ''}`}
    >
      <span className="shrink-0 text-tertiary" title="Drag into the layout">
        <GripVertical size={14} />
      </span>
      <div className="w-9 h-9 rounded-lg bg-neutral-200 flex items-center justify-center shrink-0">{thumb ? <img src={thumb} alt="" className="w-full h-full object-cover rounded-lg" /> : icon}</div>
      <p className="min-w-0 flex-1 text-[13px] font-medium text-label truncate">{title}</p>
      {!disabled && (
        <button type="button" title="Add to page" onClick={onAdd} className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 shrink-0">
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}

export const MIN_CARDS = 3;

function CardTile({ card, ratio, wide, selected, dragIds, onToggle }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `lib:card:${card.id}`, data: { cardIds: dragIds } });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} onClick={onToggle} className={`min-w-0 ${wide ? 'flex items-center gap-2.5 rounded-lg border border-neutral-200 p-1.5' : ''} ${isDragging ? 'opacity-30' : ''} cursor-pointer`}>
      <div className={`relative rounded-lg overflow-hidden bg-fill ${wide ? 'w-20 shrink-0' : ''}`} style={{ aspectRatio: ratio.replace(':', ' / ') }}>
        <img src={card.imageUrl?.url} alt="" draggable={false} className="w-full h-full object-cover select-none pointer-events-none" />
        {selected && (
          <span className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <span className="w-7 h-7 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow">
              <Check size={16} />
            </span>
          </span>
        )}
      </div>
      <p className={`text-[11.5px] font-medium text-label truncate ${wide ? 'flex-1' : 'mt-1'}`}>{card.name}</p>
    </div>
  );
}

function Group({ title, count, open, onToggle, children }) {
  return (
    <div>
      <button type="button" onClick={onToggle} className="w-full flex items-center gap-1 mb-1.5 text-left text-[11.5px] font-semibold text-tertiary uppercase tracking-wide hover:text-neutral-700">
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        {title} {count != null && <span className="font-normal">· {count}</span>}
      </button>
      {open && <div className="space-y-1.5">{children}</div>}
    </div>
  );
}

// Everything that can go on a page, each group collapsible: the app's widgets first, then top
// banners (pressing + swaps the page's single top banner), banners, carousels, 4:5 carousels.
const ComponentLibrary = ({ page, templateId, onAdd, replace, onPick, selected, setSelected }) => {
  const [query, setQuery] = useState('');
  const toggleCard = (card) =>
    setSelected((cur) => {
      if (cur.includes(card.id)) return cur.filter((x) => x !== card.id);
      const sameType = cur.every((id) => getCard(id)?.type === card.type);
      return sameType ? [...cur, card.id] : [card.id];
    });
  const [opened, setOpened] = useState({});
  const toggle = (key) => setOpened((cur) => ({ ...cur, [key]: !cur[key] }));
  const matrix = getPageMatrix(page.key);
  const topRowHere = matrix.rows.find((r) => r.kind === 'top' && (r.onlyFor ? r.onlyFor === templateId : true));
  const q = query.trim().toLowerCase();

  const widgets = Object.entries(SYSTEM_WIDGETS).filter(([type, m]) => !m.fixed && (!page.widgets || page.widgets.includes(type)) && (!q || m.label.toLowerCase().includes(q)));
  const groups = Object.entries(COMPONENT_TYPES)
    .filter(([, meta]) => meta.platform === 'both' || meta.platform === page.platform)
    // Once the page has a top banner, the top-banner group is hidden (remove it to pick another).
    .filter(([key]) => !(/top_banner$/.test(key) && topRowHere && !(templateId && matrix.cells[templateId]?.[topRowHere.id]?.state === 'hide')))
    .map(([key, meta]) => ({
      key,
      label: meta.label,
      cards: !!meta.carousel,
      items: meta.carousel
        ? getCards(key).filter((c) => !q || c.name.toLowerCase().includes(q))
        : getComponents().filter((c) => c.type === key && !c.cardComponent && componentFitsPage(c, page.key) && (!q || componentTitle(c).toLowerCase().includes(q))),
    }))
    .filter((g) => g.cards || g.items.length > 0);

  return (
    <div className="space-y-4">
      <SearchField value={query} onChange={setQuery} placeholder="Search..." className="w-full" />
      {widgets.length > 0 && (
        <Group title="Widgets" open={!!opened.widgets || !!q} onToggle={() => toggle('widgets')}>
          {widgets.map(([type, meta]) => {
            const Icon = WIDGET_ICONS[type];
            return (
              <LibraryRow
                key={type}
                dragId={`lib:sys:${type}`}
                data={{ widget: type }}
                icon={<Icon size={16} className="text-neutral-600" />}
                title={meta.label}
                sub={meta.description}
                onAdd={() => onAdd({ widget: type })}
              />
            );
          })}
        </Group>
      )}
      {groups.map((g) => g.cards ? (
        <Group key={g.key} title={g.label} count={g.items.length} open={!!opened[g.key] || !!q} onToggle={() => toggle(g.key)}>
          <div className={`grid gap-2 ${q ? 'grid-cols-1' : g.key === 'feed_vertical_carousel' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {g.items.map((card) => (
              <CardTile key={card.id} card={card} ratio={COMPONENT_TYPES[g.key].ratio} wide={!!q} selected={selected.includes(card.id)} dragIds={selected.includes(card.id) ? selected : [card.id]} onToggle={() => toggleCard(card)} />
            ))}
          </div>
        </Group>
      ) : (
        <Group key={g.key} title={g.label} count={g.items.length} open={replace ? g.key === replace.type : !!opened[g.key] || !!q} onToggle={() => toggle(g.key)}>
          {g.items.map((c) => {
            const isTop = /top_banner$/.test(g.key);
            const hiddenTop = isTop && !!templateId && matrix.cells[templateId]?.[topRowHere?.id]?.state === 'hide';
            const onPage = isTop && topRowHere?.componentId === c.id;
            return (
              <LibraryRow
                key={c.id}
                component={c}
                noDrag={isTop}
                pickMode={!!replace}
                pickable={!!replace && g.key === replace.type && c.id !== replace.currentId && true}
                onPick={() => onPick(c.id)}
                dragId={`lib:cms:${c.id}`}
                data={{ componentId: c.id }}
                icon={COMPONENT_TYPES[c.type].inventory ? <LayoutList size={15} className="text-tertiary" /> : <ImageIcon size={14} className="text-tertiary" />}
                title={componentTitle(c)}
                sub={onPage ? (hiddenTop ? 'Hidden in this template' : 'Already on this page') : COMPONENT_TYPES[c.type].label}
                disabled={onPage && !hiddenTop}
                onAdd={() => onAdd(isTop ? { topId: c.id } : { componentId: c.id })}
              />
            );
          })}
        </Group>
      ))}
    </div>
  );
};

export default ComponentLibrary;
