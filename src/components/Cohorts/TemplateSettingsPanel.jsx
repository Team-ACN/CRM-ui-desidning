import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { availableWidgets } from '../../data/mockCohorts';

const MAX_WIDGETS = 5;

const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent';

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-semibold text-gray-800 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
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
        <FieldLabel required>Target Cohorts</FieldLabel>
        <button
          onClick={onOpenCohortModal}
          className="flex items-center gap-0.5 text-[10px] text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
        >
          <Plus size={11} />
          New Cohort
        </button>
      </div>

      <div className="relative mb-2">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <Search size={12} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search cohorts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors"
        />
      </div>

      <div className="max-h-44 overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg bg-white">
        {visible.map((c) => {
          const isSelected = cohortIds.includes(c.id);
          return (
            <label
              key={c.id}
              className={`flex items-start gap-2 px-2.5 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-emerald-50/40' : ''}`}
            >
              <input
                type="checkbox"
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 shrink-0"
                checked={isSelected}
                onChange={(e) => toggle(c.id, e.target.checked)}
              />
              <div className="flex flex-col min-w-0">
                <span className={`text-xs truncate ${isSelected ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>{c.name}</span>
                <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{c.description || 'No description'}</span>
              </div>
            </label>
          );
        })}
        {visible.length === 0 && (
          <div className="p-3 text-center text-xs text-gray-500">No matching cohorts.</div>
        )}
      </div>

      {cohortIds.length === 0 ? (
        <p className="mt-1.5 text-[10px] text-red-500">At least one cohort is required.</p>
      ) : (
        <p className="mt-1.5 text-[10px] text-gray-500">{cohortIds.length} cohort(s) selected.</p>
      )}
    </div>
  );
};

const LayoutSummary = ({ widgets, onSelectWidget }) => (
  <div className="pt-4 border-t border-gray-100">
    <div className="flex items-center justify-between mb-2">
      <FieldLabel>Layout</FieldLabel>
      {widgets.length > 0 && (
        <span className="text-[10px] font-medium text-gray-400">{widgets.length}/{MAX_WIDGETS}</span>
      )}
    </div>
    {widgets.length === 0 ? (
      <div className="py-3.5 rounded-lg border border-gray-100 bg-gray-50 text-center text-xs text-gray-400">
        Drag widgets onto the canvas
      </div>
    ) : (
      <div className="space-y-1">
        {widgets.map((w, i) => {
          const def = availableWidgets.find((aw) => aw.type === w.type);
          return (
            <button
              key={w.id}
              onClick={() => onSelectWidget(w.id)}
              className="w-full flex items-center gap-2 text-xs text-gray-700 hover:bg-gray-50 p-1.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors text-left"
            >
              <span className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-[10px] font-medium text-gray-500 shrink-0">
                {i + 1}
              </span>
              <span className="text-gray-500">{def?.icon}</span>
              <span className="truncate flex-1 font-medium">{w.componentName || def?.label}</span>
            </button>
          );
        })}
      </div>
    )}
  </div>
);

const ReviewNotice = () => (
  <div className="p-3 border border-gray-200 rounded-lg bg-white">
    <div className="border-l-[3px] border-amber-400 pl-2.5">
      <p className="text-[11px] font-semibold text-gray-800">Review before going live</p>
      <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
        Saved templates start as inactive. Activate them from <span className="font-semibold text-gray-700">Manage Priority</span>.
      </p>
    </div>
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
    <div className="px-4 py-3.5 border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900">Template Settings</h3>
      <p className="text-[11px] text-gray-400 mt-0.5">Configure name, cohorts, and layout</p>
    </div>
    <div className="p-4 space-y-5 flex-1 overflow-y-auto">
      <div>
        <FieldLabel required>Template Name</FieldLabel>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Premium Whitefield Home"
          className={inputClass}
        />
      </div>

      <div>
        <FieldLabel>Description</FieldLabel>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of who this targets..."
          rows={2}
          className={`${inputClass} resize-none`}
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
