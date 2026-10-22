import React, { useState } from 'react';
import { Clock, Copy, Check } from 'lucide-react';
import { mockAgents, getAllPendingCallbacks, CONNECT_TOPIC_OPTIONS } from '../../data/mockAgents';
import AgentConnectPanel from '../Agents/AgentConnectPanel';

// "+919845011287" -> "+91 98450 11287" (3-5-5 grouping), matching the Legal Doc tables.
function formatPhone(raw) {
  if (!raw) return raw;
  const match = raw.match(/^(\+\d{2})(\d{5})(\d{5})$/);
  return match ? `${match[1]} ${match[2]} ${match[3]}` : raw;
}

// "services" reads as "Legal" here, same relabel used across the Legal & Doc pages.
const topicLabel = (value) => (value === 'services' ? 'Legal' : CONNECT_TOPIC_OPTIONS.find((t) => t.value === value)?.label || value);

const TOPIC_COLORS = {
  inventory: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  enquiry: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  mashal_ai: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  primary: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  services: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  loan: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};
const topicColor = (value) => TOPIC_COLORS[value] || { bg: 'bg-neutral-100', text: 'text-neutral-500', border: 'border-neutral-200' };

// The logged-in KAM — matches kamList's "(You)" entry in mockHome.js. This page only ever
// shows this KAM's own callbacks, not everyone's.
const MY_KAM_ID = 'samarth';

// Callback times are always on the hour — 4:00, 5:00, never 4:40 — so round to the nearest
// LOCAL hour before formatting (rounding the raw UTC ms instead would land on :30 for IST,
// since its offset isn't a whole number of hours).
function roundToHour(ts) {
  const d = new Date(ts);
  if (d.getMinutes() >= 30) d.setHours(d.getHours() + 1);
  d.setMinutes(0, 0, 0);
  return d.getTime();
}

function formatCallbackAt(ts) {
  if (!ts) return '—';
  return new Date(roundToHour(ts)).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function isOverdue(ts) {
  return ts <= Date.now();
}

// A dashboard of my own pending callbacks — yellow while still upcoming, red once overdue.
// Each card is the click target (opens the agent's Connect panel, same as the Agents page);
// resolving the callback happens from inside that panel, not here.
const LegalDocHomePage = () => {
  const [, setVersion] = useState(0);
  const [connectAgent, setConnectAgent] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const bump = () => setVersion((v) => v + 1);

  const callbacks = getAllPendingCallbacks(MY_KAM_ID);

  const openAgent = (agentId) => {
    const agent = mockAgents.find((a) => a.agentId === agentId);
    if (agent) setConnectAgent(agent);
  };

  function handleCopy(key, value) {
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    });
  }

  return (
    <div className="flex flex-col bg-neutral-50 min-h-screen text-[13px]">
      <header className="h-16 flex items-center px-6 bg-white shrink-0 border-b border-neutral-100">
        <h1 className="font-bold text-neutral-900">Home</h1>
      </header>

      <div className="p-6 pt-8">
      <h2 className="font-semibold text-neutral-900 mb-3">Your callbacks</h2>
      {/* My callbacks — a single horizontally-scrolling row. Same card language as the
          Agent Connect panel's own cards: border-neutral-200, rounded-2xl, no shadow. */}
      {callbacks.length === 0 ? (
        <div className="max-w-xs bg-white border border-neutral-200 rounded-2xl p-6 text-center text-neutral-400">
          <Clock size={20} className="mx-auto mb-1.5 text-neutral-300" />
          <p>No callbacks scheduled.</p>
        </div>
      ) : (
        <div className="flex flex-nowrap items-stretch gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {callbacks.map((cb) => {
            const overdue = isOverdue(cb.at);
            const key = `${cb.agentId}-${cb.kamId}`;
            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                onClick={() => openAgent(cb.agentId)}
                onKeyDown={(e) => e.key === 'Enter' && openAgent(cb.agentId)}
                className="w-72 shrink-0 bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-300 transition-colors cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                    <p className="text-[13px] font-semibold text-neutral-800 truncate">{cb.agentName}</p>
                    {cb.contact && (
                      <div className="shrink-0 flex items-center gap-1 text-neutral-500">
                        <span className="text-[11.5px]">{formatPhone(cb.contact)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(key, formatPhone(cb.contact));
                          }}
                          title="Copy number"
                          className="p-1 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                        >
                          {copiedKey === key ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3 min-h-[22px] items-center">
                    {cb.topics?.length > 0 ? (
                      cb.topics.map((t) => {
                        const c = topicColor(t);
                        return (
                          <span key={t} className={`px-2 py-0.5 rounded-full border text-[10.5px] font-medium ${c.bg} ${c.text} ${c.border}`}>
                            {topicLabel(t)}
                          </span>
                        );
                      })
                    ) : (
                      <span className="invisible text-[10.5px] py-0.5">&nbsp;</span>
                    )}
                  </div>

                  <p className="text-[12.5px] text-neutral-500 leading-5 line-clamp-2 h-10 mt-2.5 mb-3">
                    {cb.note || '\u00A0'}
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <span
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                      overdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <Clock size={11} /> {formatCallbackAt(cb.at)}
                  </span>
                  <span className="text-[11px] text-neutral-400 truncate">{cb.kamName}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {connectAgent && (
        <AgentConnectPanel
          agent={connectAgent}
          onClose={() => {
            setConnectAgent(null);
            bump();
          }}
        />
      )}
    </div>
  );
};

export default LegalDocHomePage;
