import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Drawer, Button, SegmentedControl, Chip, useToast } from './index';
import {
  getCohort,
  createCohort,
  updateCohort,
  optionUserCount,
  MOCK_DIRECTORY,
  COHORT_AREAS,
  COHORT_PLAN_TYPES,
  COHORT_RESALE_RENTAL,
  COHORT_PRICING,
} from '../../data/mockCms';

function directoryEntry(cpid) {
  return MOCK_DIRECTORY.find((d) => d.cpid === cpid) || { cpid, name: cpid };
}

const emptyRules = { areas: [], planTypes: [], resaleRental: null, pricing: [] };

const CohortDrawer = ({ id, onClose, onChanged }) => {
  const isNew = !id;
  const existing = id ? getCohort(id) : null;
  const toast = useToast();

  const [name, setName] = useState(existing?.name || '');
  const [cohortMode, setCohortMode] = useState(() => {
    if (!existing) return 'rules';
    const r = existing.rules || {};
    const hasNoRules = (r.areas || []).length === 0 && (r.planTypes || []).length === 0 && !r.resaleRental && (r.pricing || []).length === 0;
    return hasNoRules && (existing.manualCpids || []).length > 0 ? 'manual' : 'rules';
  });
  const [rules, setRules] = useState(existing?.rules || emptyRules);
  const [manualCpids, setManualCpids] = useState(existing?.manualCpids || []);
  const [userAddMode, setUserAddMode] = useState('search');
  const [userQuery, setUserQuery] = useState('');
  const [pasteText, setPasteText] = useState('');

  function addManualCpid(cpid) {
    setManualCpids((cur) => (cur.includes(cpid) ? cur : [...cur, cpid]));
  }

  function syncPastedCpids() {
    const pasted = pasteText
      .split(/[\n,\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    if (pasted.length) setManualCpids((cur) => [...new Set([...cur, ...pasted])]);
    setPasteText('');
  }

  const pendingPastedCpids = pasteText.split(/[\n,\s]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
  const totalUserCount = new Set([...manualCpids, ...pendingPastedCpids]).size;

  const userResults = userQuery.trim()
    ? MOCK_DIRECTORY.filter(
        (d) => !manualCpids.includes(d.cpid) && (d.name.toLowerCase().includes(userQuery.trim().toLowerCase()) || d.phone.includes(userQuery.trim()))
      ).slice(0, 6)
    : [];

  function toggleMulti(group, value) {
    setRules((r) => ({
      ...r,
      [group]: r[group].includes(value) ? r[group].filter((v) => v !== value) : [...r[group], value],
    }));
  }

  function handleSave() {
    const pasted = pasteText.split(/[\n,\s]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
    const finalCpids = pasted.length ? [...new Set([...manualCpids, ...pasted])] : manualCpids;
    const finalRules = cohortMode === 'manual' ? emptyRules : rules;
    if (isNew) {
      createCohort({ name: name.trim() || 'Untitled cohort', rules: finalRules, manualCpids: finalCpids });
      toast(`Saved · Live now`);
    } else {
      updateCohort(id, { name: name.trim() || existing.name, rules: finalRules, manualCpids: finalCpids });
      toast(`Saved · Live now`);
    }
    onChanged();
    onClose();
  }

  return (
    <Drawer
      title={isNew ? 'New cohort' : name}
      onClose={onClose}
      footer={
        <Button variant="primary" className="w-full" onClick={handleSave}>
          {isNew ? 'Create' : 'Save'}
          {totalUserCount > 0 ? ` (${totalUserCount})` : ''}
        </Button>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-label mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Premium East"
            className="w-full h-9 px-3 rounded-[10px] bg-neutral-100 text-[14px] text-label placeholder:text-tertiary border border-transparent outline-none transition-colors focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl
            size="sm"
            options={[
              { value: 'rules', label: 'Rules' },
              { value: 'manual', label: 'Manual' },
            ]}
            value={cohortMode}
            onChange={setCohortMode}
          />
        </div>

        {cohortMode === 'rules' && (
          <>
            <RuleGroup groupKey="areas" label="Area of operation" options={COHORT_AREAS} selected={rules.areas} onToggle={(v) => toggleMulti('areas', v)} />
            <RuleGroup groupKey="planTypes" label="Plan type" options={COHORT_PLAN_TYPES} selected={rules.planTypes} onToggle={(v) => toggleMulti('planTypes', v)} />
            <RuleGroup
              groupKey="resaleRental"
              label="Resale / Rental"
              options={COHORT_RESALE_RENTAL}
              selected={[rules.resaleRental]}
              onToggle={(v) => setRules((r) => ({ ...r, resaleRental: v }))}
            />
            <RuleGroup groupKey="pricing" label="Pricing behaviour" options={COHORT_PRICING} selected={rules.pricing} onToggle={(v) => toggleMulti('pricing', v)} />
          </>
        )}

        {cohortMode === 'manual' && (
          <div className="space-y-3">
            <p className="text-[13px] font-medium text-label">Specific users</p>
            <SegmentedControl
              size="sm"
              options={[
                { value: 'search', label: 'Select' },
                { value: 'manual', label: 'Manual' },
              ]}
              value={userAddMode}
              onChange={setUserAddMode}
            />

            {manualCpids.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {manualCpids.map((cpid) => (
                  <Chip key={cpid} label={directoryEntry(cpid).name} onRemove={() => setManualCpids((cur) => cur.filter((c) => c !== cpid))} />
                ))}
              </div>
            )}

            {userAddMode === 'search' ? (
              <div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none" />
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Search by name or number..."
                    className="w-full h-9 pl-9 pr-3 rounded-[10px] bg-neutral-100 text-[14px] text-label placeholder:text-tertiary border border-transparent outline-none transition-colors focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
                  />
                </div>

                {userResults.length > 0 && (
                  <div className="mt-2 border border-separator rounded-xl overflow-hidden divide-y divide-separator max-h-48 overflow-y-auto">
                    {userResults.map((d) => (
                      <button
                        key={d.cpid}
                        type="button"
                        onClick={() => {
                          addManualCpid(d.cpid);
                          setUserQuery('');
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-neutral-50/40 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-label truncate">{d.name}</p>
                          <p className="text-[12px] text-secondary">{d.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  onBlur={syncPastedCpids}
                  placeholder="Paste CPIDs — e.g. CPC123, CPC456..."
                  rows={3}
                  className="w-full min-h-[72px] py-2 px-3 rounded-[10px] bg-neutral-100 text-[14px] text-label placeholder:text-tertiary border border-transparent outline-none transition-colors focus:bg-white focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100 resize-none"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
};

function RuleGroup({ groupKey, label, options, selected, onToggle }) {
  return (
    <div>
      <p className="text-[13px] font-medium text-label mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <Chip key={opt} label={`${opt} (${optionUserCount(groupKey, opt).toLocaleString('en-IN')})`} selected={selected.includes(opt)} onClick={() => onToggle(opt)} />
        ))}
      </div>
    </div>
  );
}

export default CohortDrawer;
