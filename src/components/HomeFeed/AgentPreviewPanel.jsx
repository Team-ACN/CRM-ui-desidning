import React, { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { cardClass, fieldClass, labelClass } from '../cms-ui';
import { mockPreviewAgents, mockPreviewSlots } from '../../data/mockHomeFeed';

// Banners/ads after this section position, per CMS slot rules (they don't count toward the 10).
const slotsAfter = (position) =>
  mockPreviewSlots.filter((s) => s.afterSection === position || (s.everyN && position % s.everyN === 0));

const SlotRow = ({ label }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-fill text-[12px] text-secondary">
    <Megaphone size={13} strokeWidth={1.75} /> {label}
  </div>
);

const SectionRow = ({ position, row, enabled }) => (
  <div className={`flex items-start gap-4 px-4 py-3 ${enabled ? '' : 'opacity-40'}`}>
    <span className="w-6 text-[13px] font-medium text-tertiary tabular-nums pt-0.5">{position}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[15px] font-semibold text-label">{row.title}</p>
      <p className="text-[13px] text-secondary">{row.context}</p>
      <p className="text-[12px] text-tertiary mt-1">
        #{row.type} · {row.anchor} · {row.rule}{!enabled && ' · type switched off'}
      </p>
    </div>
    <span className="text-[13px] tabular-nums text-secondary">{row.score == null ? 'fill' : row.score.toFixed(2)}</span>
  </div>
);

const AgentPreviewPanel = ({ sectionTypes }) => {
  const [agentId, setAgentId] = useState(mockPreviewAgents[0].id);
  const agent = mockPreviewAgents.find((a) => a.id === agentId);
  const isEnabled = (typeId) => sectionTypes.find((t) => t.id === typeId)?.enabled ?? false;

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="w-72">
          <label className={labelClass} htmlFor="preview-agent">Preview as agent</label>
          <select id="preview-agent" value={agentId} onChange={(e) => setAgentId(e.target.value)} className={fieldClass}>
            {mockPreviewAgents.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.id}</option>)}
          </select>
        </div>
        <p className="text-[13px] text-secondary pb-2">{agent.summary} · {agent.feed.length} sections</p>
      </div>
      <div className={`${cardClass} py-2 space-y-1`}>
        {agent.feed.map((row, i) => (
          <React.Fragment key={`${row.type}-${i}`}>
            <SectionRow position={i + 1} row={row} enabled={isEnabled(row.type)} />
            {slotsAfter(i + 1).map((s) => (
              <div key={s.label} className="px-4"><SlotRow label={s.label} /></div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AgentPreviewPanel;
