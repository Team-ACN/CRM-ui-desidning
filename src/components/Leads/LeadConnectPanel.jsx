import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  PhoneCall,
  StickyNote,
} from 'lucide-react';
import SegmentedToggle from '../shared/SegmentedToggle';
import WhatsAppLogo from '../shared/WhatsAppLogo';
import AgentIdentityCard from '../shared/AgentIdentityCard';
import VerifyAgentSection from './VerifyAgentSection';
import { addLeadConnectHistoryEntry, resolveLeadCallback } from '../../data/mockLeads';
import { CONNECT_TOPIC_OPTIONS } from '../../data/mockAgents';

const ICON_SIZE = 14;

const topicLabel = (value) => {
  if (value === 'services') return 'Legal';
  return CONNECT_TOPIC_OPTIONS.find((t) => t.value === value)?.label || value;
};

const TOPIC_COLORS = {
  inventory: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  enquiry: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  mashal_ai: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  primary: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  services: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  loan: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};
const topicColor = (value) => TOPIC_COLORS[value] || { bg: 'bg-neutral-100', text: 'text-neutral-500', border: 'border-neutral-200' };

function connectionMeta(value) {
  if (value === 'connected') return { label: 'Connected', icon: CheckCircle2, iconColor: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (value === 'call back') return { label: 'Call Back', icon: Clock, iconColor: 'text-amber-600', bg: 'bg-amber-50' };
  if (typeof value === 'string' && value.startsWith('rnr')) {
    return { label: `RNR ${value.replace('rnr', '')}`, icon: XCircle, iconColor: 'text-red-600', bg: 'bg-red-50' };
  }
  return { label: value || '—', icon: Clock, iconColor: 'text-neutral-400', bg: 'bg-neutral-100' };
}

function nextRnrNumber(history) {
  let count = 0;
  for (const h of history) {
    if (h.connection === 'connected') count = 0;
    else if (typeof h.connection === 'string' && h.connection.startsWith('rnr')) count += 1;
  }
  return count + 1;
}

function relativeTime(ts) {
  if (!ts) return '—';
  const diffMins = Math.round((Date.now() - ts) / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

// Callback times are always on the hour — round to the nearest LOCAL hour before formatting
// (rounding the raw UTC ms instead would land on :30 for IST, since its offset isn't a whole
// number of hours).
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

function toBusinessSlot(date) {
  const d = new Date(date);
  let h = d.getHours();
  if (h < 10) h = 10;
  if (h > 20) {
    d.setDate(d.getDate() + 1);
    h = 10;
  }
  const pad = (n) => String(n).padStart(2, '0');
  return {
    dateValue: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    timeValue: `${pad(h)}:00`,
  };
}

const TIME_SLOTS = [
  { value: '10:00', label: '10 AM' },
  { value: '11:00', label: '11 AM' },
  { value: '12:00', label: '12 PM' },
  { value: '13:00', label: '1 PM' },
  { value: '14:00', label: '2 PM' },
  { value: '15:00', label: '3 PM' },
  { value: '16:00', label: '4 PM' },
  { value: '17:00', label: '5 PM' },
  { value: '18:00', label: '6 PM' },
  { value: '19:00', label: '7 PM' },
];

// Clean two-column calendar & 10 AM to 7 PM times — same quick-pick pattern as the Agent
// Connect panel's "Call Back" picker, click-to-select only, no typing, no month-grid headings
// beyond the month name itself.
function CallbackCalendarAndTimePicker({ callbackDate, callbackTime, onSelectDate, onSelectTime }) {
  const [viewDate] = useState(() => (callbackDate ? new Date(`${callbackDate}T00:00:00`) : new Date()));

  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const now = new Date();
  const currentHour = now.getHours();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const formatSummary = () => {
    if (!callbackDate) return 'Select date and time';
    const parsed = new Date(`${callbackDate}T${callbackTime || '10:00'}`);
    const dateFormatted = parsed.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    const slot = TIME_SLOTS.find((s) => s.value === callbackTime);
    return callbackTime ? `${dateFormatted} at ${slot?.label || callbackTime}` : `${dateFormatted} (select time)`;
  };

  return (
    <div className="border border-neutral-200 rounded-2xl p-4">
      <div className="grid grid-cols-[2fr_1fr] divide-x divide-neutral-200">
        <div className="pr-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-neutral-800">{monthName}</span>
          </div>
          <div className="grid grid-cols-7 text-center mb-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
              <span key={idx} className="text-[10px] font-medium text-neutral-400">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {days.map((dayNum, i) => {
              if (dayNum === null) return <div key={`empty-${i}`} className="h-7" />;
              const dStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
              const thisDate = new Date(year, month, dayNum);
              thisDate.setHours(0, 0, 0, 0);
              const isPast = thisDate < today;
              const isSelected = callbackDate === dStr;
              return (
                <button
                  key={dStr}
                  type="button"
                  disabled={isPast}
                  onClick={() => onSelectDate(dStr)}
                  className={`h-7 w-full text-[12px] rounded-md border font-medium transition-colors flex items-center justify-center ${
                    isSelected
                      ? 'bg-white border-neutral-900 text-neutral-900 font-semibold'
                      : isPast
                        ? 'border-transparent text-neutral-300 cursor-not-allowed'
                        : 'border-transparent text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
        <div className="pl-4">
          <div className="grid grid-cols-2 gap-1.5">
            {TIME_SLOTS.map((t) => {
              const slotHour = parseInt(t.value.split(':')[0], 10);
              const isPastTime = callbackDate === todayStr && slotHour <= currentHour;
              const isSelected = callbackTime === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  disabled={isPastTime}
                  onClick={() => onSelectTime(t.value)}
                  className={`py-2 rounded-lg border text-[12px] font-medium text-center transition-colors ${
                    isSelected
                      ? 'bg-white border-neutral-900 text-neutral-900 font-semibold'
                      : isPastTime
                        ? 'bg-neutral-50 border-transparent text-neutral-300 cursor-not-allowed'
                        : 'bg-neutral-50 border-transparent text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[12px] text-neutral-500 pt-3 mt-3 border-t border-neutral-100">
        <span>Scheduled:</span>
        <span className="font-semibold text-neutral-900">{formatSummary()}</span>
      </div>
    </div>
  );
}

// Exact copy of the Agent Connect panel's shape — header, pending-callback banner, Log a
// Connect, Connect History, Notes digest — just pointed at a lead's own record instead of an
// agent's (no agent identity card / legal lead section, since leads don't have those).
const LeadConnectPanel = ({ lead, onClose, onLeadUpdated }) => {
  const [history, setHistory] = useState(lead?.connectHistory || []);
  const [nextCallbacksMap, setNextCallbacksMap] = useState(lead?.nextCallbacks || {});

  const [medium, setMedium] = useState('on call');
  const [direction, setDirection] = useState('outbound');
  const [topics, setTopics] = useState([]);
  const [note, setNote] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('');
  const [onlyWithNotes, setOnlyWithNotes] = useState(true);

  const noteRef = useRef(null);
  useEffect(() => {
    if (noteRef.current) {
      noteRef.current.style.height = 'auto';
      noteRef.current.style.height = `${noteRef.current.scrollHeight}px`;
    }
  }, [note]);

  const rnrNumber = nextRnrNumber(history);

  const toggleTopic = (value) => {
    setTopics((t) => (t.includes(value) ? t.filter((x) => x !== value) : [...t, value]));
  };

  const selectOutcome = (outcome) => {
    if (selectedOutcome === outcome) {
      setSelectedOutcome('');
      setCallbackDate('');
      setCallbackTime('');
      return;
    }
    setSelectedOutcome(outcome);
    if (outcome === 'call back' && !callbackDate) {
      const slot = toBusinessSlot(new Date());
      setCallbackDate(slot.dateValue);
      setCallbackTime(slot.timeValue);
    }
  };

  const canSaveConnect = selectedOutcome === 'call back' ? !!(callbackDate && callbackTime) : !!selectedOutcome;

  const handleSaveConnect = () => {
    if (!canSaveConnect) return;
    const connectionValue = selectedOutcome === 'rnr' ? `rnr${rnrNumber}` : selectedOutcome;
    const callbackAt = selectedOutcome === 'call back' ? new Date(`${callbackDate}T${callbackTime}`).getTime() : null;
    const kamId = (lead.kam || 'kam').toLowerCase();
    const entry = addLeadConnectHistoryEntry(lead.id, {
      kamId,
      kamName: lead.kam || '—',
      direction,
      connectMedium: medium,
      connection: connectionValue,
      note,
      topics,
      callbackAt,
    });
    setHistory((h) => [...h, entry]);
    if (callbackAt) setNextCallbacksMap((m) => ({ ...m, [kamId]: { at: callbackAt, entryId: entry.id } }));

    const connectStatus = connectionValue === 'connected' ? 'Connected' : connectionValue === 'call back' ? 'Call Back' : `RNR-${rnrNumber}`;
    onLeadUpdated?.({
      connectStatus,
      lastTried: 'Just now',
      lastConnect: connectionValue === 'connected' ? 'Just now' : lead.lastConnect,
    });

    setSelectedOutcome('');
    setTopics([]);
    setNote('');
    setCallbackDate('');
    setCallbackTime('');
  };

  const pendingCallbacks = Object.entries(nextCallbacksMap).map(([kamId, cb]) => {
    const sourceEntry = history.find((h) => h.id === cb.entryId);
    return { kamId, kamName: sourceEntry?.kamName || kamId, at: cb.at };
  });

  const handleResolveCallback = (kamId) => {
    resolveLeadCallback(lead.id, kamId);
    setNextCallbacksMap((m) => {
      const next = { ...m };
      delete next[kamId];
      return next;
    });
  };

  const visibleHistory = onlyWithNotes ? history.filter((h) => h.note && h.note.trim()) : history;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white h-full w-2/5 min-w-[460px] shadow-2xl flex flex-col [&_button]:focus:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-neutral-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — identity details live in the identity card below, so this stays a slim bar
            with just the close action, exactly like the Agent Connect panel's. */}
        <header className="shrink-0 flex items-center justify-end px-5 py-3 bg-white border-b border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </header>

        {/* Pending callback banner — pinned above the scroll region so it stays visible no
            matter where the KAM has scrolled to. */}
        {pendingCallbacks.length > 0 && (
          <div className="shrink-0 px-5 py-3 bg-amber-50 space-y-1.5">
            {pendingCallbacks.length > 1 && (
              <div className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
                <Clock size={ICON_SIZE} className="text-amber-500 shrink-0" />
                <span>{pendingCallbacks.length} callbacks scheduled</span>
              </div>
            )}
            {pendingCallbacks.map((cb) => {
              const overdue = isOverdue(cb.at);
              return (
                <div key={cb.kamId} className="flex items-center justify-between gap-2">
                  <div className={`flex items-center gap-2 text-[13px] font-medium ${overdue ? 'text-red-700' : 'text-amber-900'}`}>
                    <Clock size={ICON_SIZE} className={`shrink-0 ${overdue ? 'text-red-500' : 'text-amber-500'}`} />
                    <span>
                      {pendingCallbacks.length === 1 && 'Callback scheduled '}
                      {formatCallbackAt(cb.at)} — {cb.kamName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResolveCallback(cb.kamId)}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-white transition-colors ${
                      overdue ? 'border-red-200 text-red-700 hover:bg-red-100' : 'border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Done
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Single scroll region */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Lead Details — same identity card the Agent Connect panel uses, just without a
              status badge (leads don't have the agent's good/bad/maybe legal status). */}
          <AgentIdentityCard
            name={lead?.name && lead.name !== '-' ? lead.name : lead?.leadId}
            agentId={lead?.leadId}
            contact={lead?.contact}
            kam={lead?.kam}
          />

          {/* Verify Agent Information — converts this lead into a real agent record once a KAM
              has confirmed their details, same collapsible shape as the Agent panel's own
              "Legal Lead" section. */}
          <VerifyAgentSection lead={lead} />

          {/* Log a Connect */}
          <div className="border border-neutral-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <SegmentedToggle
                value={medium}
                onChange={setMedium}
                ariaLabel="Connect Medium"
                options={[
                  { value: 'on call', label: 'Call' },
                  { value: 'on whatsapp', label: 'WhatsApp' },
                ]}
              />
              <SegmentedToggle
                value={direction}
                onChange={setDirection}
                ariaLabel="Call Direction"
                options={[
                  { value: 'outbound', label: 'Outbound', icon: <ArrowUpRight size={13.5} />, activeIcon: <ArrowUpRight size={13.5} /> },
                  { value: 'inbound', label: 'Inbound', icon: <ArrowDownLeft size={13.5} />, activeIcon: <ArrowDownLeft size={13.5} /> },
                ]}
              />
            </div>

            {/* Outcome Selection Buttons with Double-Click or Single-Click Deselect */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => selectOutcome('connected')}
                onDoubleClick={() => {
                  setSelectedOutcome('');
                  setCallbackDate('');
                  setCallbackTime('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${
                  selectedOutcome === 'connected'
                    ? 'bg-white border-neutral-700 text-neutral-900 font-semibold'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
                title="Click or double click to unselect"
              >
                <CheckCircle2 size={ICON_SIZE} className="text-emerald-600" />
                <span>Connected</span>
              </button>
              <button
                type="button"
                onClick={() => selectOutcome('rnr')}
                onDoubleClick={() => {
                  setSelectedOutcome('');
                  setCallbackDate('');
                  setCallbackTime('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${
                  selectedOutcome === 'rnr'
                    ? 'bg-white border-neutral-700 text-neutral-900 font-semibold'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
                title="Click or double click to unselect"
              >
                <XCircle size={ICON_SIZE} className="text-red-500" />
                <span>RNR {rnrNumber}</span>
              </button>
              <button
                type="button"
                onClick={() => selectOutcome('call back')}
                onDoubleClick={() => {
                  setSelectedOutcome('');
                  setCallbackDate('');
                  setCallbackTime('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${
                  selectedOutcome === 'call back'
                    ? 'bg-white border-neutral-700 text-neutral-900 font-semibold'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
                title="Click or double click to unselect"
              >
                <Clock size={ICON_SIZE} className="text-amber-500" />
                <span>Call Back</span>
              </button>
            </div>

            {/* Quick-pick date + time for Call Back */}
            {selectedOutcome === 'call back' && (
              <CallbackCalendarAndTimePicker
                callbackDate={callbackDate}
                callbackTime={callbackTime}
                onSelectDate={setCallbackDate}
                onSelectTime={setCallbackTime}
              />
            )}

            <div className="border-t border-neutral-100" />

            {/* Topics Pills */}
            <div className="flex flex-wrap gap-1.5">
              {CONNECT_TOPIC_OPTIONS.map((o) => {
                const isSelected = topics.includes(o.value);
                const labelText = o.value === 'services' ? 'Legal' : o.label;
                const c = topicColor(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleTopic(o.value)}
                    onDoubleClick={() => setTopics((t) => t.filter((x) => x !== o.value))}
                    className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                      isSelected ? `${c.bg} ${c.text} ${c.border} font-semibold` : 'bg-white text-neutral-500 border-neutral-200 font-medium hover:bg-neutral-100'
                    }`}
                  >
                    {labelText}
                  </button>
                );
              })}
            </div>

            {/* Note Input — auto-expanding, since a KAM writes this after the call ends */}
            <textarea
              ref={noteRef}
              placeholder="Need to remember something? Type it here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-neutral-400 resize-none overflow-hidden"
            />

            {/* Save Connect Log Action */}
            <button
              type="button"
              onClick={handleSaveConnect}
              disabled={!canSaveConnect}
              className="w-full py-2.5 bg-white hover:bg-neutral-50 border border-neutral-900 text-neutral-900 rounded-full font-semibold text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Save Connect Log
            </button>
          </div>

          {/* Connect History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Connect History</span>
              <button
                type="button"
                onClick={() => setOnlyWithNotes((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors ${
                  onlyWithNotes
                    ? 'bg-white border-neutral-900 text-neutral-900 font-semibold'
                    : 'bg-neutral-100 border-transparent text-neutral-500 hover:bg-neutral-200'
                }`}
              >
                <StickyNote size={11} /> {onlyWithNotes ? 'Calls with notes' : 'All calls'}
              </button>
            </div>

            {visibleHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 text-neutral-400 border border-dashed border-neutral-200 rounded-2xl">
                <PhoneCall size={20} className="mb-2 text-neutral-300" />
                <p className="text-[13px]">{history.length === 0 ? 'No connects logged yet.' : 'No connects with notes yet.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...visibleHistory].reverse().map((entry) => {
                  const meta = connectionMeta(entry.connection);
                  const Icon = meta.icon;
                  const hasBelow = entry.topics?.length > 0 || entry.note || (entry.connection === 'call back' && entry.callbackAt);
                  return (
                    <div key={entry.id} className="border border-neutral-200 rounded-2xl p-5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${meta.bg} ${meta.iconColor}`}>
                            <Icon size={18} />
                          </span>
                          <span className="text-[13px] font-semibold text-neutral-800">{meta.label}</span>

                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 shrink-0">
                            {entry.connectMedium === 'on whatsapp' ? <WhatsAppLogo size={18} /> : <Phone size={15} />}
                          </span>

                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 shrink-0">
                            {entry.direction === 'inbound' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                          </span>
                        </div>
                        <span className="text-neutral-400 text-[12px] whitespace-nowrap">
                          {relativeTime(entry.timestamp)} by {entry.kamName}
                        </span>
                      </div>

                      {hasBelow && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-3">
                          {entry.topics?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {entry.topics.map((t) => {
                                const c = topicColor(t);
                                return (
                                  <span key={t} className={`px-2.5 py-1 rounded-full border text-[11px] font-medium ${c.bg} ${c.text} ${c.border}`}>
                                    {topicLabel(t)}
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {entry.note && <p className="text-neutral-600 text-[13px] leading-relaxed">{entry.note}</p>}

                          {entry.connection === 'call back' && entry.callbackAt && (
                            <p className="text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2 text-[12px] font-medium">
                              Callback at {formatCallbackAt(entry.callbackAt)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Notes digest — every past connect's note text, each with its own time + KAM name,
                so they're all visible at a glance without scrolling back through each card. */}
            {history.filter((e) => e.note).length > 0 && (
              <div className="border border-neutral-200 rounded-2xl divide-y divide-neutral-100 mt-3">
                {[...history]
                  .filter((e) => e.note)
                  .reverse()
                  .map((entry, i) => (
                    <div key={i} className="p-5">
                      <p className="text-neutral-600 text-[13px] leading-relaxed">{entry.note}</p>
                      <span className="text-neutral-400 text-[11px]">
                        {relativeTime(entry.timestamp) || '—'} by {entry.kamName || '—'}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadConnectPanel;
