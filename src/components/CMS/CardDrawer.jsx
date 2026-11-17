import React, { useState } from 'react';
import { Drawer, Button, UploadZone, useToast } from './index';
import { LinkFields } from './ComponentDrawer';
import { COMPONENT_TYPES, createCard, getCard, updateCard } from '../../data/mockCms';

const inputClass =
  'w-full h-9 px-3 rounded-[10px] bg-neutral-100 text-[14px] text-label placeholder:text-tertiary border border-transparent outline-none transition-colors focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100';

// One reusable carousel card: a name, an image and a link.
const CardDrawer = ({ id, type, onClose, onChanged }) => {
  const existing = id ? getCard(id) : null;
  const meta = COMPONENT_TYPES[existing?.type || type];
  const toast = useToast();
  const [card, setCard] = useState({ name: '', imageUrl: null, linkUrl: '', appendCpid: false, ...(existing || {}) });
  const set = (patch) => setCard((cur) => ({ ...cur, ...patch }));

  const invalid = !card.name.trim() ? 'Name is required' : !card.imageUrl ? 'Image is required' : !card.linkUrl.trim() ? 'Link URL is required' : null;

  function save() {
    if (invalid) return;
    const data = { name: card.name.trim(), imageUrl: card.imageUrl, linkUrl: card.linkUrl, appendCpid: card.appendCpid };
    if (existing) updateCard(existing.id, data);
    else createCard(type, data);
    toast('Saved');
    onChanged();
    onClose();
  }

  return (
    <Drawer
      title={existing ? existing.name : `New ${meta.label} card`}
      onClose={onClose}
      footer={
        <div className="w-full">
          <Button variant="primary" className="w-full" disabled={!!invalid} onClick={save}>
            {existing ? 'Save' : 'Create'}
          </Button>
          {invalid && <p className="mt-1.5 text-[12px] text-danger text-center">{invalid}</p>}
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-label mb-1.5">Name</label>
          <input type="text" value={card.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Diwali offer" className={inputClass} />
        </div>
        <UploadZone className={meta.ratio === '4:5' ? 'w-1/2' : ''} ratio={meta.ratio} value={card.imageUrl} onChange={(v) => set({ imageUrl: v })} />
        <LinkFields item={card} onChange={set} />
      </div>
    </Drawer>
  );
};

export default CardDrawer;
