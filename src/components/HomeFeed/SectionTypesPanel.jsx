import React from 'react';
import { Flag, Lock } from 'lucide-react';
import { ListGroup, ListRow, Switch } from '../cms-ui';
import { SECTION_FAMILIES, FILL_NEEDED_PCT, mockTypePerformance } from '../../data/mockHomeFeed';
import { canDisableType, isRetirementFlagged } from './headingRules';

const Badge = ({ tone, children }) => {
  const tones = {
    warning: 'bg-fill text-warning',
    danger: 'bg-danger-soft text-danger',
    neutral: 'bg-fill text-secondary',
  };
  return (
    <span className={`inline-flex items-center gap-1 h-5 px-2 rounded-full text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
};

const typeHint = (type, perf) => {
  if (type.status === 'Gated') return `Needs ${type.gateField} on ≥ 70% of listings · now ${type.fillRate}%`;
  if (!canDisableType(type.id, FILL_NEEDED_PCT)) return `Locked on: ${FILL_NEEDED_PCT}% of pages need fill (limit 1%)`;
  if (perf) return `CTR index ${perf.ctr.toFixed(2)} · ${perf.impressions.toLocaleString('en-IN')} impressions (14d)`;
  return 'No data yet';
};

const TypeRow = ({ type, onToggle }) => {
  const perf = mockTypePerformance[type.id];
  const flagged = isRetirementFlagged(perf);
  const locked = type.enabled && !canDisableType(type.id, FILL_NEEDED_PCT);

  return (
    <ListRow>
      <span className="w-8 shrink-0 text-[13px] font-medium text-tertiary tabular-nums">#{type.id}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[14px] font-medium text-label">{type.name}</p>
          {type.group && <Badge tone="neutral">{type.group}</Badge>}
          {type.status === 'Gated' && <Badge tone="warning">Gated</Badge>}
          {flagged && <Badge tone="danger"><Flag size={10} strokeWidth={2} /> Flagged for retirement</Badge>}
        </div>
        <p className="text-[12px] text-secondary mt-0.5">{typeHint(type, perf)}</p>
      </div>
      {locked && <Lock size={14} strokeWidth={1.75} className="text-tertiary" />}
      <Switch
        checked={type.enabled}
        onChange={() => onToggle(type.id)}
        disabled={type.status === 'Gated' || locked}
        label={`Toggle section #${type.id}`}
      />
    </ListRow>
  );
};

const SectionTypesPanel = ({ sectionTypes, onToggle }) => (
  <div className="space-y-6">
    <p className="text-[13px] text-secondary">
      The engine builds 10 sections per agent (max 12) from these types. Turning a type off removes it for every agent.
      Flagged types had CTR index below 0.5 for 14 days on ≥ 5,000 impressions — PM decides whether to switch them off.
    </p>
    {SECTION_FAMILIES.map((family) => (
      <ListGroup key={family.key} header={family.label}>
        {sectionTypes
          .filter((t) => t.family === family.key)
          .map((type) => <TypeRow key={type.id} type={type} onToggle={onToggle} />)}
      </ListGroup>
    ))}
  </div>
);

export default SectionTypesPanel;
