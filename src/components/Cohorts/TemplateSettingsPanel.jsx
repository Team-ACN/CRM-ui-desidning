import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { availableWidgets } from '../../data/mockCohorts';
import { Button, SearchField, fieldClass, textareaClass, labelClass, hintClass } from '../cms-ui';

const MAX_WIDGETS = 5;

const FieldLabel = ({ children, required }) => (
  <label className={labelClass}>
    {children}
    {required && <span className="text-danger ml-0.5">*</span>}
  </label>
);

const matchesCohort = (cohort, query) => {
  const q = query.toLowerCase();
  return cohort.name.toLowerCase().includes(q) || cohort.id.toString().toLowerCase().includes(q);
};

const CohortPicker = ({ cohorts, cohortIds, setCohortIds, onOpenCohortModal }) => {
  const [search, setSearch] = useState('');
  const visible = cohorts.filter((c) => matchesCohort(c, search));

  const toggle = (id, checked) =>
    setCohortIds(checked ? [...cohortIds, id] : cohortIds.filter((cid) => cid !== id));

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <FieldLabel required>Target cohorts</FieldLabel>
        <Button variant="plain" size="sm" icon={Plus} onClick={onOpenCohortModal} className="-mr-3 -mt-1.5">
          New cohort
        </Button>
      </div>

      <SearchField
        value={search}
        onChange={setSearch}
        placeholder="Search cohorts"
        className="w-full mb-2"
      />

      <div className="max-h-44 overflow-y-auto custom-scrollbar rounded-[10px] bg-surface shadow-card divide-y divide-separator">
        {visible.map((c) => {
          const isSelected = cohortIds.includes(c.id);
          return (
            <label
              key={c.id}
              className={`flex items-start gap-2.5 px-3 py-2 cursor-pointer transition-colors ${isSelected ? 'bg-accent-soft' : 'hover:bg-black/[0.02]'}`}
            >
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-accent shrink-0"
                checked={isSelected}
                onChange={(e) => toggle(c.id, e.target.checked)}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium text-label truncate">{c.name}</span>
                <span className="text-[12px] text-secondary mt-0.5 line-clamp-1">{c.description || 'No description'}</span>
              </div>
            </label>
          );
        })}
        {visible.length === 0 && (
          <div className="p-3 text-center text-[13px] text-secondary">No matching cohorts.</div>
        )}
      </div>

      {cohortIds.length === 0 ? (
        <p className="mt-1.5 text-[12px] text-danger">At least one cohort is required.</p>
      ) : (
        <p className={`mt-1.5 ${hintClass}`}><span className="tabular-nums">{cohortIds.length}</span> cohort(s) selected.</p>
      )}
    </div>
  );
};

const LayoutSummary = ({ widgets, onSelectWidget }) => (
  <div className="pt-5 border-t border-separator">
    <div className="flex items-center justify-between mb-2">
      <FieldLabel>Layout</FieldLabel>
      {widgets.length > 0 && (
        <span className="text-[12px] text-tertiary tabular-nums">{widgets.length}/{MAX_WIDGETS}</span>
      )}
    </div>
    {widgets.length === 0 ? (
      <div className="py-3.5 rounded-[10px] bg-fill text-center text-[13px] text-secondary">
        Drag widgets onto the canvas
      </div>
    ) : (
      <div className="rounded-[10px] bg-surface shadow-card divide-y divide-separator overflow-hidden">
        {widgets.map((w, i) => {
          const def = availableWidgets.find((aw) => aw.type === w.type);
          return (
            <button
              key={w.id}
              onClick={() => onSelectWidget(w.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-label hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors text-left"
            >
              <span className="w-4 text-[12px] text-tertiary tabular-nums shrink-0">
                {i + 1}
              </span>
              <span className="text-secondary">{def?.icon}</span>
              <span className="truncate flex-1 font-medium">{w.componentName || def?.label}</span>
            </button>
          );
        })}
      </div>
    )}
  </div>
);

const ReviewNotice = () => (
  <div className="p-3 rounded-xl bg-fill">
    <p className="flex items-center gap-1.5 text-[13px] font-medium text-label">
      <span className="w-1.5 h-1.5 rounded-full bg-warning-dot shrink-0" />
      Review before going live
    </p>
    <p className="text-[12px] text-secondary mt-0.5 leading-relaxed">
      Saved templates start as inactive. Activate them from <span className="font-medium text-label">Manage priority</span>.
    </p>
  </div>
);

const TemplateSettingsPanel = ({
  name,
  setName,
  description,
  setDescription,
  cohorts,
  cohortIds,
  setCohortIds,
  onOpenCohortModal,
  widgets,
  onSelectWidget,
}) => (
  <>
    <div className="px-4 py-3.5 border-b border-separator">
      <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-label">Template settings</h3>
      <p className="text-[13px] text-secondary mt-0.5">Configure name, cohorts, and layout</p>
    </div>
    <div className="p-4 space-y-5 flex-1 overflow-y-auto">
      <div>
        <FieldLabel required>Template name</FieldLabel>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Premium Whitefield Home"
          className={fieldClass}
        />
      </div>

      <div>
        <FieldLabel>Description</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of who this targets..."
          rows={2}
          className={`${textareaClass} resize-none`}
        />
      </div>

      <CohortPicker
        cohorts={cohorts}
        cohortIds={cohortIds}
        setCohortIds={setCohortIds}
        onOpenCohortModal={onOpenCohortModal}
      />

      <LayoutSummary widgets={widgets} onSelectWidget={onSelectWidget} />

      <ReviewNotice />
    </div>
  </>
);

export default TemplateSettingsPanel;
