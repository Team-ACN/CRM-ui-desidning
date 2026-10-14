import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  PhoneCall,
  FileText,
  StickyNote,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  User,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CONNECT_TOPIC_OPTIONS, addConnectHistoryEntry } from '../../data/mockAgents';
import LegalSearchSelect from '../shared/LegalSearchSelect';
import LegalLeadSection from '../shared/LegalLeadSection';
import AgentIdentityCard from '../shared/AgentIdentityCard';
import SegmentedToggle from '../shared/SegmentedToggle';
import WhatsAppLogo from '../shared/WhatsAppLogo';
import {
  SERVICE_NAME_OPTIONS,
  KAM_OPTIONS,
  getLegalDocRecord,
  setAgentLegalStatus,
  addLeadRequest,
  addClient,
  addServiceToClient,
  updateRequestStatus,
  currentStatus,
} from '../../data/mockLegalDoc';

const ICON_SIZE = 14;
const DEFAULT_LEAD_SOURCE = 'app';

// Hourly time slots from 10 AM to 8 PM
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
  { value: '20:00', label: '8 PM' },
];

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

function formatCallbackAt(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Live-masks a phone input as it's typed: digits only, capped at 10, 5-5 grouped.
function maskPhoneInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

// Clean two-column calendar & 10 AM to 8 PM times
// Same quick-pick pattern as the Edge post editor's "Published At" picker — a row of date
// cards (Today, Tmw, next few days, or a custom date) and a row of hour chips (or a custom
// time), instead of a full month-grid calendar. Click-to-select only, no typing, no headings.
function CallbackCalendarAndTimePicker({ callbackDate, callbackTime, onSelectDate, onSelectTime }) {
  const [viewDate, setViewDate] = useState(() => (callbackDate ? new Date(`${callbackDate}T00:00:00`) : new Date()));

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const now = useMemo(() => new Date(), []);
  const currentHour = now.getHours();
  const todayStr = useMemo(() => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  }, [today]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  // Drop the trailing 8 PM slot so the remaining 10 slots fill a clean 2-column, 5-row grid
  // next to the calendar — no odd one left over on its own.
  const gridTimeSlots = TIME_SLOTS.slice(0, -1);

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
        {/* Calendar */}
        <div className="pr-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-neutral-800">{monthName}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={14} />
              </button>
            </div>
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
              const pad = (n) => String(n).padStart(2, '0');
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

        {/* Time */}
        <div className="pl-4">
          <div className="grid grid-cols-2 gap-1.5">
            {gridTimeSlots.map((t) => {
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

const AgentConnectPanel = ({ agent, onClose }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState(agent?.connectHistory || []);
  const [nextCallbacksMap, setNextCallbacksMap] = useState(agent?.nextCallbacks || {});

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

  // Lead version bump to trigger reactive re-read of mock in-memory records
  const [leadVersion, setLeadVersion] = useState(0);
  const existingLeadRecord = getLegalDocRecord(agent?.agentId);

  // ONLY pick a request that is still in the lead stage. Once qualified, it moves to the
  // Qualify stage and is no longer a pending lead here!
  const leadStageRequest = (existingLeadRecord?.legalAndLoan?.legalRequests || []).find(
    (r) => currentStatus(r) === 'lead'
  ) || null;

  const hasLeadStageRequest = !!leadStageRequest;

  // Legal Status — derived straight from the live record (no local state to keep in sync):
  // handleUpdateLegalStatus writes the mock data then bumps leadVersion to force a re-render.
  const legalStatus = existingLeadRecord?.legalAndLoan?.status || 'maybe';

  const handleUpdateLegalStatus = (newStatus) => {
    const kam = KAM_OPTIONS.some((k) => k.value === agent?.kam) ? agent.kam : KAM_OPTIONS[0].value;
    setAgentLegalStatus(agent.agentId, { agentName: agent.name, contact: agent.contact || '', kam }, newStatus, kam);
    setLeadVersion((v) => v + 1);
  };

  // Toggle for legal lead section (collapsed by default)
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);

  // Draft state for drafting a new lead
  const [draftServices, setDraftServices] = useState([]);
  const [draftClients, setDraftClients] = useState([]);

  // States for adding a new client
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientServices, setNewClientServices] = useState([]);

  const rnrNumber = nextRnrNumber(history);

  const toggleTopic = (value) => {
    setTopics((t) => (t.includes(value) ? t.filter((x) => x !== value) : [...t, value]));
  };

  // Agent client & other clients list from leadStageRequest
  const agentClientIndex = leadStageRequest?.clients?.findIndex((c) => c.pocType === 'agent') ?? -1;
  const agentClient = agentClientIndex !== -1 ? leadStageRequest?.clients?.[agentClientIndex] : null;
  const otherClients = hasLeadStageRequest
    ? (leadStageRequest?.clients || [])
      .map((c, idx) => ({ ...c, originalIndex: idx }))
      .filter((c) => c.pocType === 'client')
    : draftClients.map((c, idx) => ({ ...c, originalIndex: idx }));

  const agentServicesCount = hasLeadStageRequest
    ? (agentClient?.services || []).reduce((acc, s) => acc + (s.qty || 1), 0)
    : draftServices.reduce((acc, s) => acc + (s.qty || 1), 0);

  const clientServicesCount = otherClients.reduce(
    (acc, c) => acc + (c.services || []).reduce((sAcc, s) => sAcc + (s.qty || 1), 0),
    0
  );
  const totalRequirementsCount = agentServicesCount + clientServicesCount;

  // Dropping a lead marks it lost right from here — same shared status transition the Legal
  // Doc Leads page uses, so it's reflected everywhere a lost-from-lead-stage request shows up.
  const handleDropLead = () => {
    const kam = KAM_OPTIONS.some((k) => k.value === agent?.kam) ? agent.kam : KAM_OPTIONS[0].value;
    updateRequestStatus(agent.agentId, leadStageRequest.id, 'lost', { notes: 'Dropped from Agent Connect', user: kam });
    setLeadVersion((v) => v + 1);
  };

  // Qualify the lead CTA handler — only reached in draft mode (no request yet); once a lead
  // stage request exists, LegalLeadSection owns qualifying it directly.
  const handleQualifyLead = () => {
    const kam = KAM_OPTIONS.some((k) => k.value === agent?.kam) ? agent.kam : KAM_OPTIONS[0].value;

    if (draftServices.length === 0 && draftClients.length === 0 && newClientServices.length === 0) return;
    const firstServiceName =
      draftServices[0]?.name || draftClients[0]?.services?.[0]?.name || SERVICE_NAME_OPTIONS[0].value;
    const req = addLeadRequest({
      agentId: agent.agentId,
      agentName: agent.name,
      contact: agent.contact || '',
      kam,
      source: DEFAULT_LEAD_SOURCE,
      serviceName: firstServiceName,
    });

    const agIdx = req.clients?.findIndex((c) => c.pocType === 'agent') ?? 0;
    if (draftServices.length > 0) {
      if (draftServices[0]?.qty > 1) {
        req.clients[agIdx].services[0].qty = draftServices[0].qty;
      }
      for (let i = 1; i < draftServices.length; i++) {
        const ds = draftServices[i];
        req.clients[agIdx].services.push({
          name: ds.name,
          qty: ds.qty || 1,
          chargeableAmount: null,
          documents: [],
          status: 'negotiation',
        });
      }
    } else {
      req.clients[agIdx].services = [];
    }

    // Add all draft clients
    draftClients.forEach((dc) => {
      const updated = addClient(agent.agentId, req.id, {
        pocType: 'client',
        name: dc.name,
        phone: dc.phone,
      });
      const newIdx = updated.clients.length - 1;
      (dc.services || []).forEach((s) => {
        for (let q = 0; q < (s.qty || 1); q++) {
          addServiceToClient(agent.agentId, req.id, newIdx, s.name);
        }
      });
    });

    if (newClientName.trim()) {
      const updated = addClient(agent.agentId, req.id, {
        pocType: 'client',
        name: newClientName.trim(),
        phone: newClientPhone.trim(),
      });
      const newIdx = updated.clients.length - 1;
      newClientServices.forEach((s) => {
        for (let q = 0; q < (s.qty || 1); q++) {
          addServiceToClient(agent.agentId, req.id, newIdx, s.name);
        }
      });
    }

    updateRequestStatus(agent.agentId, req.id, 'qualify', {
      notes: 'Qualified via Agent Connect panel',
      user: kam,
    });

    // Reset all drafting and client adding states
    setDraftServices([]);
    setDraftClients([]);
    setIsAddingClient(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientServices([]);

    // Collapse section immediately so the lead disappears from the active view
    setLeadOpen(false);
    setLeadSaved(true);
    setLeadVersion((v) => v + 1);
    setTimeout(() => setLeadSaved(false), 3000);
  };

  // Agent services handlers — draft mode only (no request yet)
  const handleAddAgentService = (serviceName) => {
    setDraftServices((prev) => {
      const exists = prev.find((s) => s.name === serviceName);
      if (exists) return prev.map((s) => (s.name === serviceName ? { ...s, qty: s.qty + 1 } : s));
      return [...prev, { name: serviceName, qty: 1 }];
    });
  };

  const handleIncrementAgentService = (serviceName) => {
    setDraftServices((prev) => prev.map((s) => (s.name === serviceName ? { ...s, qty: s.qty + 1 } : s)));
  };

  const handleDecrementAgentService = (serviceName) => {
    setDraftServices((prev) =>
      prev.map((s) => (s.name === serviceName ? { ...s, qty: s.qty - 1 } : s)).filter((s) => s.qty > 0)
    );
  };

  // Client addition handler — draft mode only
  const handleConfirmAddClient = () => {
    if (!newClientName.trim()) return;
    setDraftClients((prev) => [
      ...prev,
      {
        pocType: 'client',
        name: newClientName.trim(),
        phone: newClientPhone.trim(),
        services: newClientServices.length > 0 ? [...newClientServices] : [],
      },
    ]);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientServices([]);
    setLeadVersion((v) => v + 1);
  };

  // Client inline editing — draft mode only; edits apply live as you type
  const applyClientEdit = (clientIdx, patch) => {
    setDraftClients((prev) => prev.map((c, idx) => (idx === clientIdx ? { ...c, ...patch } : c)));
    setLeadVersion((v) => v + 1);
  };

  const handleRemoveClient = (clientIdx) => {
    setDraftClients((prev) => prev.filter((_, idx) => idx !== clientIdx));
    setLeadVersion((v) => v + 1);
  };

  const handleAddClientService = (clientIdx, serviceName) => {
    setDraftClients((prev) =>
      prev.map((c, idx) => {
        if (idx !== clientIdx) return c;
        const exists = (c.services || []).find((s) => s.name === serviceName);
        const services = exists
          ? c.services.map((s) => (s.name === serviceName ? { ...s, qty: (s.qty || 1) + 1 } : s))
          : [...(c.services || []), { name: serviceName, qty: 1 }];
        return { ...c, services };
      })
    );
    setLeadVersion((v) => v + 1);
  };

  const handleIncrementClientService = (clientIdx, serviceName) => {
    handleAddClientService(clientIdx, serviceName);
  };

  const handleDecrementClientService = (clientIdx, serviceName) => {
    setDraftClients((prev) =>
      prev.map((c, idx) => {
        if (idx !== clientIdx) return c;
        const services = (c.services || [])
          .map((s) => (s.name === serviceName ? { ...s, qty: (s.qty || 1) - 1 } : s))
          .filter((s) => s.qty > 0);
        return { ...c, services };
      })
    );
    setLeadVersion((v) => v + 1);
  };

  // Outcome selection: single click or double click unselects an active item
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
    const kamId = (agent.kam || 'kam').toLowerCase();
    const entry = addConnectHistoryEntry(agent.agentId, {
      kamId,
      kamName: agent.kam || '—',
      direction,
      connectMedium: medium,
      connection: connectionValue,
      note,
      topics,
      callbackAt,
    });
    setHistory((h) => [...h, entry]);
    if (callbackAt) setNextCallbacksMap((m) => ({ ...m, [kamId]: { at: callbackAt, entryId: entry.id } }));
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

  const visibleHistory = onlyWithNotes ? history.filter((h) => h.note && h.note.trim()) : history;

  // A quick scannable rollup at the bottom of the history — not another connect card, just
  // the handful of facts a KAM would otherwise have to count by scrolling for.
  const connectedCount = history.filter((h) => h.connection === 'connected').length;
  const rnrCount = history.filter((h) => typeof h.connection === 'string' && h.connection.startsWith('rnr')).length;
  const callBackCount = history.filter((h) => h.connection === 'call back').length;
  const lastEntry = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white h-full w-2/5 min-w-[460px] shadow-2xl flex flex-col [&_button]:focus:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-neutral-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — identity details now live in the Agent Details section below, so this stays
            a slim bar with just the close action. */}
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

        {/* Pending callback banner — pinned above the scroll region (not just first-in-list) so
            it stays visible no matter where the KAM has scrolled to. Reads cleanly whether
            there's one callback or several. */}
        {pendingCallbacks.length > 0 && (
          <div className="shrink-0 px-5 py-3 bg-amber-50 space-y-1.5">
            {pendingCallbacks.length === 1 ? (
              <div className="flex items-center gap-2 text-[13px] font-medium text-amber-900">
                <Clock size={ICON_SIZE} className="text-amber-500 shrink-0" />
                <span>
                  Callback scheduled for {formatCallbackAt(pendingCallbacks[0].at)} — {pendingCallbacks[0].kamName}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-amber-900">
                  <Clock size={ICON_SIZE} className="text-amber-500 shrink-0" />
                  <span>{pendingCallbacks.length} callbacks scheduled</span>
                </div>
                <div className="pl-[22px] space-y-1">
                  {pendingCallbacks.map((cb) => (
                    <div key={cb.kamId} className="text-[12.5px] text-amber-800">
                      {formatCallbackAt(cb.at)} — {cb.kamName}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Single scroll region */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Agent Details — identity + legal status together, first thing in the panel */}
          <AgentIdentityCard
            name={agent?.name}
            agentId={agent?.agentId}
            contact={agent?.contact}
            kam={agent?.kam}
            status={legalStatus}
            onUpdateStatus={handleUpdateLegalStatus}
          >
            {(() => {
              const notes = existingLeadRecord?.legalAndLoan?.notes || [];
              const entry = notes.length ? notes[notes.length - 1] : null;
              if (!entry || !entry.text) return null;
              return (
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <p className="text-neutral-500 text-[13px]">{entry.text}</p>
                  <span className="text-neutral-400 text-[11px] whitespace-nowrap">
                    {relativeTime(entry.time) || '—'} by {entry.user || '—'}
                  </span>
                </div>
              );
            })()}
          </AgentIdentityCard>

          {/* Legal Lead (Only shown for leads in LEAD stage) */}
          <div className="border border-neutral-200 rounded-2xl p-5 space-y-4">
            <button type="button" onClick={() => setLeadOpen((v) => !v)} className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
                <FileText size={ICON_SIZE} className="text-neutral-400" />
                <span>{hasLeadStageRequest ? 'Legal Lead' : 'Add Legal Lead'}</span>
                {hasLeadStageRequest && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">Lead Stage</span>
                )}
                {totalRequirementsCount > 0 && (
                  <span className="text-[12px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {totalRequirementsCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {leadSaved && (
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={11} /> Lead Qualified
                  </span>
                )}
                {leadOpen ? <ChevronUp size={14} className="text-neutral-400" /> : <ChevronDown size={14} className="text-neutral-400" />}
              </div>
            </button>

            {leadOpen && hasLeadStageRequest && (
              <LegalLeadSection
                agentId={agent.agentId}
                requestId={leadStageRequest.id}
                kam={agent?.kam}
                onQualified={() => {
                  setLeadOpen(false);
                  setLeadSaved(true);
                  setLeadVersion((v) => v + 1);
                  setTimeout(() => setLeadSaved(false), 3000);
                }}
                onDrop={handleDropLead}
              />
            )}

            {/* No request yet — draft a new lead locally; it's only created once "Qualify the
                Lead" is clicked, via handleQualifyLead below. */}
            {leadOpen && !hasLeadStageRequest && (
              <div className="space-y-4">
                <div className="border border-neutral-200 rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-600">
                      <User size={13} className="text-neutral-400" />
                      <span>Agent</span>
                    </div>
                    {agentServicesCount > 0 && (
                      <span className="text-[12px] text-neutral-500">
                        {agentServicesCount === 1 ? '1 service' : `${agentServicesCount} services`}
                      </span>
                    )}
                  </div>
                  <LegalSearchSelect
                    items={draftServices}
                    onAdd={handleAddAgentService}
                    onIncrement={handleIncrementAgentService}
                    onDecrement={handleDecrementAgentService}
                    placeholder="Add legal requirement for agent..."
                  />
                </div>

                <div className="space-y-3">
                  {otherClients.length > 0 && (
                    <div className="space-y-3">
                      {otherClients.map((c, i) => {
                        const serviceCount = (c.services || []).reduce((sum, s) => sum + (s.qty || 1), 0);
                        return (
                          <div key={c.originalIndex} className="border border-neutral-200 rounded-2xl bg-white p-4 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-600">
                                <Users size={13} className="text-neutral-400" />
                                <span>Client {i + 1}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {serviceCount > 0 && (
                                  <span className="text-[12px] text-neutral-500">
                                    {serviceCount === 1 ? '1 service' : `${serviceCount} services`}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveClient(c.originalIndex)}
                                  className="p-1 text-neutral-300 hover:text-neutral-600 rounded transition-colors"
                                  title="Remove client"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Client name"
                                value={c.name || ''}
                                onChange={(e) => applyClientEdit(c.originalIndex, { name: e.target.value })}
                                className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 outline-none transition-all"
                              />
                              <input
                                type="text"
                                placeholder="Phone number"
                                value={c.phone || ''}
                                onChange={(e) => applyClientEdit(c.originalIndex, { phone: maskPhoneInput(e.target.value) })}
                                className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 outline-none transition-all"
                              />
                            </div>

                            <LegalSearchSelect
                              items={(c.services || []).map((s) => ({ name: s.name, qty: s.qty || 1 }))}
                              onAdd={(sName) => handleAddClientService(c.originalIndex, sName)}
                              onIncrement={(sName) => handleIncrementClientService(c.originalIndex, sName)}
                              onDecrement={(sName) => handleDecrementClientService(c.originalIndex, sName)}
                              placeholder={`+ Add legal for ${c.name || 'client'}...`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isAddingClient && (
                    <div className="border border-neutral-200 rounded-2xl bg-white p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-600">
                          <Users size={13} className="text-neutral-400" />
                          <span>Client {otherClients.length + 1}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingClient(false);
                            setNewClientName('');
                            setNewClientPhone('');
                            setNewClientServices([]);
                          }}
                          className="p-1 text-neutral-300 hover:text-neutral-600 rounded transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Client name"
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleConfirmAddClient()}
                          className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 outline-none transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Phone number"
                          value={newClientPhone}
                          onChange={(e) => setNewClientPhone(maskPhoneInput(e.target.value))}
                          onKeyDown={(e) => e.key === 'Enter' && handleConfirmAddClient()}
                          className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 outline-none transition-all"
                        />
                      </div>

                      <LegalSearchSelect
                        items={newClientServices}
                        onAdd={(sName) => {
                          setNewClientServices((prev) => {
                            const exists = prev.find((s) => s.name === sName);
                            if (exists) return prev.map((s) => (s.name === sName ? { ...s, qty: s.qty + 1 } : s));
                            return [...prev, { name: sName, qty: 1 }];
                          });
                        }}
                        onIncrement={(sName) => {
                          setNewClientServices((prev) => prev.map((s) => (s.name === sName ? { ...s, qty: s.qty + 1 } : s)));
                        }}
                        onDecrement={(sName) => {
                          setNewClientServices((prev) =>
                            prev.map((s) => (s.name === sName ? { ...s, qty: s.qty - 1 } : s)).filter((s) => s.qty > 0)
                          );
                        }}
                        placeholder="Search legal needs for this client..."
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      // If a client is already being typed in, save it first — otherwise this
                      // click would wipe that unsaved draft instead of starting a new one.
                      if (newClientName.trim()) {
                        handleConfirmAddClient();
                      }
                      setIsAddingClient(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-800 text-[13px] w-full justify-center transition-colors"
                  >
                    <Plus size={13} /> Add client
                  </button>
                </div>

                <div className="pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={handleQualifyLead}
                    disabled={totalRequirementsCount === 0}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                  >
                    {leadSaved ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span>Lead Qualified</span>
                      </>
                    ) : (
                      <span>Qualify the Lead</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

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
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${selectedOutcome === 'connected'
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
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${selectedOutcome === 'rnr'
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
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${selectedOutcome === 'call back'
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
                    className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${isSelected
                      ? `${c.bg} ${c.text} ${c.border} font-semibold`
                      : 'bg-white text-neutral-500 border-neutral-200 font-medium hover:bg-neutral-100'
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
                <StickyNote size={11} /> With notes only
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

            {/* Rollup — just the facts, not another connect-outcome card, so everything's
                visible at a glance without scrolling back through each entry. */}
            {history.length > 0 && (
              <div className="border border-neutral-200 rounded-2xl p-5 mt-3">
                <ul className="space-y-1.5 text-[13px] text-neutral-700 list-disc list-inside marker:text-neutral-700 marker:text-base">
                  <li>{history.length} connect{history.length !== 1 ? 's' : ''} logged</li>
                  <li>
                    {connectedCount} connected · {rnrCount} RNR · {callBackCount} call back
                  </li>
                  {lastEntry && (
                    <li>
                      Last connect {relativeTime(lastEntry.timestamp)} by {lastEntry.kamName}
                    </li>
                  )}
                  {pendingCallbacks.length > 0 && (
                    <li>
                      {pendingCallbacks.length} callback{pendingCallbacks.length !== 1 ? 's' : ''} pending
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentConnectPanel;
