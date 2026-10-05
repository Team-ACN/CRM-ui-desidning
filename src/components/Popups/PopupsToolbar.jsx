import React from 'react';
import { Plus, ArrowUpDown } from 'lucide-react';
import { Button, SearchField, SegmentedControl } from '../cms-ui';
import { SURFACES } from './popupConstants';

const SURFACE_OPTIONS = SURFACES.map((s) => ({ value: s.id, label: s.label }));

const PopupsToolbar = ({
  surface,
  onSurfaceChange,
  searchQuery,
  onSearchChange,
  onManagePriority,
  onCreate,
}) => (
  <div className="flex items-center justify-between gap-3">
    <SegmentedControl options={SURFACE_OPTIONS} value={surface} onChange={onSurfaceChange} />

    <div className="flex items-center gap-2">
      <SearchField value={searchQuery} onChange={onSearchChange} placeholder="Search popups" />
      <Button variant="secondary" icon={ArrowUpDown} onClick={onManagePriority}>
        Manage priority
      </Button>
      <Button variant="primary" icon={Plus} onClick={onCreate}>
        New popup
      </Button>
    </div>
  </div>
);

export default PopupsToolbar;
