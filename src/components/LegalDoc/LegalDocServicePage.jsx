import React, { useState } from 'react';
import {
  Search,
  X,
  Filter,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Ban,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  StickyNote,
  PhoneCall,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { MultiFilterSelect, FilterSelect } from '../Edge/FilterControls';
import AgentIdentityCard from '../shared/AgentIdentityCard';
import LegalSearchSelect from '../shared/LegalSearchSelect';
import SegmentedToggle from '../shared/SegmentedToggle';
import WhatsAppLogo from '../shared/WhatsAppLogo';
import CallbackCalendarAndTimePicker from '../shared/CallbackCalendarAndTimePicker';
import { toBusinessSlot } from '../shared/callbackSlots';
import { CONNECT_TOPIC_OPTIONS } from '../../data/mockAgents';
import { summarize } from '../../utils/filters';
import {
  getLegalDocRecords,
  setAgentLegalStatus,
  addClientConnection,
  addServiceToClient,
  toggleServiceDocumentsReceived,
  toggleServiceAdvanceReceived,
  toggleServiceLost,
  setServiceVaultId,
  setClientInvoiceId,
  effectiveStage,
  currentStatus,
  REQUEST_STATUS_OPTIONS,
  STATUS_STYLES,
  SERVICE_STAGE_STATUSES,
  SERVICE_NAME_OPTIONS,
  KAM_OPTIONS,
  CONNECTION_STATUS_OPTIONS,
  optionLabel,
} from '../../data/mockLegalDoc';

// Same palette the Leads/Qualify Connect History uses, condensed to a single table badge.
const CONNECTION_STATUS_STYLES = {
  connected: 'bg-emerald-100 text-emerald-700',
  call_back: 'bg-amber-100 text-amber-700',
  rnr: 'bg-red-100 text-red-700',
  not_reachable: 'bg-neutral-100 text-neutral-500',
  switched_off: 'bg-neutral-100 text-neutral-500',
};

function lastConnectionForClient(client) {
  const conns = client?.connections || [];
  if (conns.length === 0) return null;
  return conns.reduce((latest, c) => (c.time > latest.time ? c : latest));
}

// Same flattening as the Leads/Qualify Call Log — every client's connections, newest first.
function allConnectionsFor(request) {
  return request.clients.flatMap((c) => c.connections || []).sort((a, b) => b.time - a.time);
}

function connectionStatusMeta(value) {
  if (value === 'connected') return { Icon: CheckCircle2, iconClass: 'text-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-600' };
  if (value === 'call_back') return { Icon: Clock, iconClass: 'text-amber-500', badgeClass: 'bg-amber-50 text-amber-600' };
  return { Icon: XCircle, iconClass: 'text-red-500', badgeClass: 'bg-red-50 text-red-600' };
}

// "services" reads as "Legal" here — same relabel the Agent Connect panel uses, since this is
// the Legal & Doc module and that's the topic that's actually relevant on this page.
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

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name (A-Z)' },
];

// Agent contacts already carry a country code ("+919845011287"); client POC numbers are
// entered locally without one ("98450 11287"), so this normalizes both to "+91 98450 11287".
function formatPhone(raw) {
  if (!raw) return raw;
  const digits = raw.replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  if (local.length !== 10) return raw;
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

function relativeTime(ts) {
  if (!ts) return null;
  const diffDays = Math.floor((Date.now() - ts) / 86400000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}

function formatDate(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

// Time the request entered the Service stage — the table's Status Time column shows this.
function serviceAt(request) {
  const entry = (request.statusLog || []).find((s) => SERVICE_STAGE_STATUSES.includes(s.status));
  return entry ? entry.time : request.createdAt;
}

function boolBadge(value, trueClass = 'bg-emerald-100 text-emerald-700', falseClass = 'bg-neutral-100 text-neutral-500') {
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${value ? trueClass : falseClass}`}>{value ? 'True' : 'False'}</span>;
}

const serviceLabel = (name) => SERVICE_NAME_OPTIONS.find((s) => s.value === name)?.label || name;

function clientLabel(client) {
  if (client.pocType === 'agent') return 'Agent (self)';
  return client.name || 'Unnamed client';
}

const POC_TYPE_OPTIONS = [
  { value: 'agent', label: 'Agent' },
  { value: 'client', label: 'Client' },
];

const LOST_FILTER_OPTIONS = [
  { value: 'true', label: 'True' },
  { value: 'false', label: 'False' },
];

// Client-level Invoice ID — one per client, shared across every service listed below it, so it
// gets its own small field + Save instead of being repeated inside each service's accordion.
const InvoiceIdField = ({ client, onSave }) => {
  const [value, setValue] = useState(client.invoiceId || '');
  const [saved, setSaved] = useState(false);
  const hasChanges = value.trim() !== (client.invoiceId || '');

  const handleSave = () => {
    if (!hasChanges) return;
    onSave(value.trim() || null);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="border border-neutral-200 rounded-2xl p-4">
      <div className="text-[11px] text-neutral-400 mb-1">Invoice ID</div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add invoice ID..."
          className="flex-1 border border-neutral-200 rounded-xl px-3 py-1.5 text-[13px] font-mono outline-none focus:border-neutral-400"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[13px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-neutral-900"
        >
          {saved ? <Check size={14} /> : 'Save'}
        </button>
      </div>
    </div>
  );
};

// Flat list — one row per service: name + Lost toggle on top, Service ID · Docs received
// toggle · Advance received toggle underneath, no per-row expand/Save. Edits are buffered
// locally and committed together by the single Save button at the bottom (Lost toggles
// immediately — it's a status change, not a draft field). Own local state (reset by the `key`
// the caller puts on it, one per client) so edits don't leak between clients.
const ServicesEditor = ({ services, onSaveVaultId, onToggleDocsReceived, onToggleAdvanceReceived, onToggleLost, onAddServiceByName }) => {
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(
      services.map((s) => [s.name, { vaultId: s.vaultServiceId || '', documentsReceived: !!s.documentsReceived, advanceReceived: !!s.advanceReceived }])
    )
  );
  const [saved, setSaved] = useState(false);

  const hasChanges = services.some((s) => {
    const d = draft[s.name];
    return (
      d &&
      (d.vaultId.trim() !== (s.vaultServiceId || '') || d.documentsReceived !== !!s.documentsReceived || d.advanceReceived !== !!s.advanceReceived)
    );
  });

  // A service added via the inline search bar below isn't in `draft` yet (it's seeded once on
  // mount) — fall back to its own current values so toggling/typing on it doesn't drop the other
  // fields of its draft entry.
  const baseDraft = (name) => {
    const s = services.find((x) => x.name === name);
    return { vaultId: s?.vaultServiceId || '', documentsReceived: !!s?.documentsReceived, advanceReceived: !!s?.advanceReceived };
  };

  const toggleDraft = (name, field) => {
    setDraft((prev) => {
      const current = prev[name] || baseDraft(name);
      return { ...prev, [name]: { ...current, [field]: !current[field] } };
    });
  };

  const setVaultIdDraft = (name, value) => {
    setDraft((prev) => ({ ...prev, [name]: { ...(prev[name] || baseDraft(name)), vaultId: value } }));
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleSaveAll = () => {
    if (!hasChanges) return;
    services.forEach((s) => {
      const d = draft[s.name];
      if (!d) return;
      if (d.vaultId.trim() !== (s.vaultServiceId || '')) onSaveVaultId(s.name, d.vaultId.trim() || null);
      if (d.documentsReceived !== !!s.documentsReceived) onToggleDocsReceived(s.name);
      if (d.advanceReceived !== !!s.advanceReceived) onToggleAdvanceReceived(s.name);
    });
    flashSaved();
  };

  // Lost and Add Service both commit immediately (unlike the Docs/Advance/Service ID fields
  // above, which buffer into `draft`) — flash the Save button anyway so it's obvious the action
  // actually went through.
  const handleToggleLost = (name) => {
    onToggleLost(name);
    flashSaved();
  };

  const handleAddServiceByName = (name) => {
    onAddServiceByName(name);
    flashSaved();
  };

  const toggleClass = (active) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors whitespace-nowrap ${
      active ? 'bg-white border-neutral-900 text-neutral-900 font-semibold' : 'bg-neutral-100 border-transparent text-neutral-500 hover:bg-neutral-200'
    }`;

  return (
    <div className="space-y-2">
      <div className="border border-neutral-200 rounded-2xl divide-y divide-neutral-100">
        {services.map((s) => {
          const d = draft[s.name] || { vaultId: s.vaultServiceId || '', documentsReceived: !!s.documentsReceived, advanceReceived: !!s.advanceReceived };
          return (
            <div key={s.name} className={`px-4 py-3 space-y-2 ${s.lost ? 'bg-red-50/40' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="flex-1 min-w-0 truncate font-medium text-neutral-800 text-[13px]">
                  {serviceLabel(s.name)}
                  {(s.qty || 1) > 1 ? ` ×${s.qty}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleLost(s.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors shrink-0 ${
                    s.lost
                      ? 'bg-red-100 border-red-200 text-red-600 hover:bg-red-200'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  {s.lost ? (
                    <>
                      <RotateCcw size={13} /> Reopen
                    </>
                  ) : (
                    <>
                      <Ban size={13} /> Lost
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={d.vaultId}
                  onChange={(e) => setVaultIdDraft(s.name, e.target.value)}
                  placeholder="Service ID"
                  className="flex-1 min-w-0 border border-neutral-200 rounded-xl px-3 py-1.5 text-[12px] font-mono outline-none focus:border-neutral-400"
                />
                <button type="button" onClick={() => toggleDraft(s.name, 'documentsReceived')} className={toggleClass(d.documentsReceived)}>
                  Docs received
                </button>
                <button type="button" onClick={() => toggleDraft(s.name, 'advanceReceived')} className={toggleClass(d.advanceReceived)}>
                  Advance received
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Same inline search-to-add bar as the Leads/Qualify side panel — no modal, just type
          and pick a service to add it straight to this client. */}
      <LegalSearchSelect items={[]} onAdd={handleAddServiceByName} onIncrement={handleAddServiceByName} onDecrement={() => {}} placeholder="+ Add another service..." />

      <button
        type="button"
        onClick={handleSaveAll}
        disabled={!hasChanges && !saved}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[13px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-neutral-900"
      >
        {saved ? (
          <>
            <Check size={14} /> Saved
          </>
        ) : (
          'Save'
        )}
      </button>
    </div>
  );
};

const LegalDocServicePage = () => {
  const [, setVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [kamFilter, setKamFilter] = useState([]);
  const [serviceFilter, setServiceFilter] = useState([]);
  const [pocTypeFilter, setPocTypeFilter] = useState([]);
  const [salesPocFilter, setSalesPocFilter] = useState([]);
  const [lostFilter, setLostFilter] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [copiedKey, setCopiedKey] = useState(null);
  const [selected, setSelected] = useState(null);
  const [onlyWithNotes, setOnlyWithNotes] = useState(true);
  const [callForm, setCallForm] = useState({
    connectMedium: 'on call',
    direction: 'outbound',
    status: 'connected',
    notes: '',
    topics: ['services'],
  });
  const [callbackDate, setCallbackDate] = useState('');
  const [callbackTime, setCallbackTime] = useState('');

  const bump = () => setVersion((v) => v + 1);

  // One row per request (for the side panel, which edits a whole request at once)...
  const allInService = [];
  getLegalDocRecords().forEach((r) => {
    (r.legalAndLoan.legalRequests || [])
      .filter((req) => effectiveStage(req) === 'service')
      .forEach((req) =>
        allInService.push({
          agentId: r.agentId,
          agentName: r.agentName,
          contact: r.contact,
          kam: r.kam,
          agentStatus: r.legalAndLoan.status,
          agentNotes: r.legalAndLoan.notes,
          ...req,
          // req.status is the full status log — keep it under statusLog (serviceAt reads it),
          // and flatten status itself to the current stage string so every existing `.status`
          // read in this file (filters, badges) keeps working.
          statusLog: req.status,
          status: currentStatus(req),
        })
      );
  });

  // ...but flattened to one row per SERVICE for the table itself, since status, documents and
  // amount all actually live on the service, not the request — a request with 3 services needs
  // 3 rows, not one row hiding 3 comma-joined lists.
  const allServiceRows = [];
  allInService.forEach((req) => {
    req.clients.forEach((client, ci) => {
      client.services.forEach((s) => {
        allServiceRows.push({
          key: `${req.agentId}-${req.id}-${ci}-${s.name}`,
          agentId: req.agentId,
          agentName: req.agentName,
          contact: req.contact,
          kam: req.kam,
          requestId: req.id,
          status: req.status,
          statusLog: req.statusLog,
          salesPoc: req.salesPoc,
          createdAt: req.createdAt,
          clientIndex: ci,
          pocType: client.pocType,
          pocLabel: clientLabel(client),
          pocName: client.pocType === 'agent' ? req.agentName : client.name || 'Unnamed client',
          pocPhone: client.pocType === 'agent' ? req.contact : client.phone || '',
          lastConnection: lastConnectionForClient(client),
          invoiceId: client.invoiceId,
          serviceName: s.name,
          service: s,
        });
      });
    });
  });

  const matchesSearch = (row) =>
    `${row.agentId} ${row.agentName} ${serviceLabel(row.serviceName)}`.toLowerCase().includes(search.toLowerCase());
  const matchesKam = (row) => kamFilter.length === 0 || kamFilter.includes(row.kam);
  const matchesService = (row) => serviceFilter.length === 0 || serviceFilter.includes(row.serviceName);
  const matchesPocType = (row) => pocTypeFilter.length === 0 || pocTypeFilter.includes(row.pocType);
  const matchesSalesPoc = (row) => salesPocFilter.length === 0 || salesPocFilter.includes(row.salesPoc);
  const matchesLost = (row) => lostFilter.length === 0 || lostFilter.includes(row.service.lost ? 'true' : 'false');

  function countOptions(dim, options, getValues) {
    return options.map((o) => ({
      ...o,
      count: allServiceRows.filter(
        (row) =>
          matchesSearch(row) &&
          (dim === 'kam' || matchesKam(row)) &&
          (dim === 'service' || matchesService(row)) &&
          (dim === 'pocType' || matchesPocType(row)) &&
          (dim === 'salesPoc' || matchesSalesPoc(row)) &&
          (dim === 'lost' || matchesLost(row)) &&
          getValues(row).includes(o.value)
      ).length,
    }));
  }

  const rows = allServiceRows.filter(
    (row) => matchesSearch(row) && matchesKam(row) && matchesService(row) && matchesPocType(row) && matchesSalesPoc(row) && matchesLost(row)
  );
  const activeFilterCount =
    kamFilter.length + serviceFilter.length + pocTypeFilter.length + salesPocFilter.length + lostFilter.length;

  const activeFilters = [
    kamFilter.length > 0 && {
      key: 'kam',
      label: `KAM: ${summarize(kamFilter, KAM_OPTIONS, '')}`,
      clear: () => setKamFilter([]),
    },
    serviceFilter.length > 0 && {
      key: 'service',
      label: `Service: ${summarize(serviceFilter, SERVICE_NAME_OPTIONS, '')}`,
      clear: () => setServiceFilter([]),
    },
    pocTypeFilter.length > 0 && {
      key: 'pocType',
      label: `POC: ${summarize(pocTypeFilter, POC_TYPE_OPTIONS, '')}`,
      clear: () => setPocTypeFilter([]),
    },
    salesPocFilter.length > 0 && {
      key: 'salesPoc',
      label: `Sales POC: ${summarize(salesPocFilter, KAM_OPTIONS, '')}`,
      clear: () => setSalesPocFilter([]),
    },
    lostFilter.length > 0 && {
      key: 'lost',
      label: `Lost: ${summarize(lostFilter, LOST_FILTER_OPTIONS, '')}`,
      clear: () => setLostFilter([]),
    },
  ].filter(Boolean);

  function clearAllFilters() {
    setKamFilter([]);
    setServiceFilter([]);
    setPocTypeFilter([]);
    setSalesPocFilter([]);
    setLostFilter([]);
  }

  const filterKey = JSON.stringify([search, kamFilter, serviceFilter, pocTypeFilter, salesPocFilter, lostFilter, sortBy]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const sortedRows = [...rows].sort((a, b) => {
    let primary;
    switch (sortBy) {
      case 'oldest':
        primary = a.createdAt - b.createdAt;
        break;
      case 'name':
        primary = a.agentName.localeCompare(b.agentName);
        break;
      case 'newest':
      default:
        primary = b.createdAt - a.createdAt;
    }
    // Tie-break by service name so multiple services on the same request sit together
    // instead of being scattered across the sort.
    return primary !== 0 ? primary : a.serviceName.localeCompare(b.serviceName);
  });

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = sortedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedLead = selected ? allInService.find((l) => l.agentId === selected.agentId && l.id === selected.id) : null;
  const panelClient = selectedLead?.clients[selected?.clientIndex];

  // Opened from a table row — scoped to that client, not just the one service the row
  // represents, so the panel lists every service on that client.
  function openPanel(row) {
    setSelected({ agentId: row.agentId, id: row.requestId, clientIndex: row.clientIndex });
  }

  function closePanel() {
    setSelected(null);
  }

  // Legal Status (good/maybe/bad) is one value per agent, shared with the Agent Connect panel —
  // editing it here updates it everywhere, same as editing it there.
  function handleUpdateAgentLegalStatus(lead, newStatus, noteText) {
    setAgentLegalStatus(lead.agentId, { agentName: lead.agentName, contact: lead.contact, kam: lead.kam }, newStatus, lead.kam, noteText);
    bump();
  }

  function handleCopy(key, value) {
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    });
  }

  // Logged against the client the panel is actually open on — not always the first client like
  // the Leads/Qualify pages — so the table's per-row Connection Status column (which reads off
  // that specific client) actually updates for the row that was clicked.
  function submitLogCall(lead, clientIndex) {
    const callbackAt = callForm.status === 'call_back' && callbackDate && callbackTime ? new Date(`${callbackDate}T${callbackTime}`).getTime() : null;
    addClientConnection(lead.agentId, lead.id, clientIndex, { ...callForm, user: lead.salesPoc || lead.kam, callbackAt });
    setCallForm({ connectMedium: 'on call', direction: 'outbound', status: 'connected', notes: '', topics: ['services'] });
    setCallbackDate('');
    setCallbackTime('');
    bump();
  }

  function handleToggleDocumentsReceived(lead, clientIndex, serviceName) {
    toggleServiceDocumentsReceived(lead.agentId, lead.id, clientIndex, serviceName);
    bump();
  }

  function handleToggleAdvanceReceived(lead, clientIndex, serviceName) {
    toggleServiceAdvanceReceived(lead.agentId, lead.id, clientIndex, serviceName);
    bump();
  }

  function handleToggleLost(lead, clientIndex, serviceName) {
    toggleServiceLost(lead.agentId, lead.id, clientIndex, serviceName);
    bump();
  }

  function handleSetVaultId(lead, clientIndex, serviceName, vaultServiceId) {
    setServiceVaultId(lead.agentId, lead.id, clientIndex, serviceName, vaultServiceId);
    bump();
  }

  function handleAddServiceToClient(lead, clientIndex, serviceName) {
    addServiceToClient(lead.agentId, lead.id, clientIndex, serviceName);
    bump();
  }

  function handleSetInvoiceId(lead, clientIndex, invoiceId) {
    setClientInvoiceId(lead.agentId, lead.id, clientIndex, invoiceId);
    bump();
  }

  return (
    <div className="flex flex-col bg-neutral-50 h-full text-[13px]">
      <header className="h-16 flex items-center px-6 bg-white justify-between shrink-0 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-500">Legal & Doc</span>
          <span className="text-neutral-300">/</span>
          <h1 className="font-bold text-neutral-900">Service</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-neutral-400 px-3 py-1 bg-neutral-100 rounded-full">{rows.length} Services</span>
        </div>
      </header>

      {/* Filter bar */}
      <div className="px-6 py-3 bg-white border-b border-neutral-200 shrink-0">
        <div className="flex items-center flex-wrap gap-3">
          <div className="relative w-full max-w-[260px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agent, ID or service..."
              className="w-full bg-neutral-100 rounded-xl py-1.5 pl-8 pr-7 text-[13px] font-medium text-neutral-800 outline-none focus:bg-white focus:border-neutral-300 border border-transparent transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium border transition-colors shrink-0 ${
              showFilters ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <Filter size={13} /> Filters
            {activeFilterCount > 0 && (
              <span className={`px-1.5 rounded-full text-[11px] ${showFilters ? 'bg-white/20' : 'bg-neutral-100'}`}>{activeFilterCount}</span>
            )}
          </button>

          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-[13px] font-medium"
            >
              {f.label}
              <button onClick={f.clear} className="p-1 hover:bg-neutral-100 rounded-full transition-colors">
                <X size={13} />
              </button>
            </span>
          ))}
          {activeFilters.length > 1 && (
            <button onClick={clearAllFilters} className="text-[13px] font-medium text-neutral-400 hover:text-neutral-700">
              Clear all
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-5xl">
            <MultiFilterSelect
              label="KAM"
              allLabel="All KAMs"
              allCount={allServiceRows.filter((row) => matchesSearch(row) && matchesService(row) && matchesPocType(row) && matchesSalesPoc(row) && matchesLost(row)).length}
              value={kamFilter}
              onChange={setKamFilter}
              options={countOptions('kam', KAM_OPTIONS, (row) => [row.kam])}
            />
            <MultiFilterSelect
              label="Service"
              allLabel="All Services"
              allCount={allServiceRows.filter((row) => matchesSearch(row) && matchesKam(row) && matchesPocType(row) && matchesSalesPoc(row) && matchesLost(row)).length}
              value={serviceFilter}
              onChange={setServiceFilter}
              options={countOptions('service', SERVICE_NAME_OPTIONS, (row) => [row.serviceName])}
            />
            <MultiFilterSelect
              label="POC"
              allLabel="Agent & Client"
              allCount={allServiceRows.filter((row) => matchesSearch(row) && matchesKam(row) && matchesService(row) && matchesSalesPoc(row) && matchesLost(row)).length}
              value={pocTypeFilter}
              onChange={setPocTypeFilter}
              options={countOptions('pocType', POC_TYPE_OPTIONS, (row) => [row.pocType])}
            />
            <MultiFilterSelect
              label="Sales POC"
              allLabel="All POCs"
              allCount={allServiceRows.filter((row) => matchesSearch(row) && matchesKam(row) && matchesService(row) && matchesPocType(row) && matchesLost(row)).length}
              value={salesPocFilter}
              onChange={setSalesPocFilter}
              options={countOptions('salesPoc', KAM_OPTIONS, (row) => [row.salesPoc])}
            />
            <FilterSelect label="Sort" value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} defaultValue="newest" />
            <MultiFilterSelect
              label="Lost"
              allLabel="All"
              allCount={allServiceRows.filter((row) => matchesSearch(row) && matchesKam(row) && matchesService(row) && matchesPocType(row) && matchesSalesPoc(row)).length}
              value={lostFilter}
              onChange={setLostFilter}
              options={countOptions('lost', LOST_FILTER_OPTIONS, (row) => [row.service.lost ? 'true' : 'false'])}
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto bg-white">
        <table className="text-left text-[13px] text-neutral-600 whitespace-nowrap min-w-[1700px] w-full">
          <thead className="bg-white text-[11px] font-medium uppercase tracking-wider text-neutral-500 sticky top-0 z-10 shadow-[0_1px_0_0_#e7e5e4]">
            <tr>
              <th className="pl-6 pr-4 py-4">Req ID</th>
              <th className="px-4 py-4">Status Time</th>
              <th className="px-4 py-4">POC</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Number</th>
              <th className="px-4 py-4">Connection Status</th>
              <th className="px-4 py-4 min-w-[130px]">Invoice ID</th>
              <th className="px-4 py-4">Service Name</th>
              <th className="px-4 py-4">Service ID</th>
              <th className="px-4 py-4">Lost</th>
              <th className="px-4 py-4">Doc Received</th>
              <th className="px-4 py-4">Adv Received</th>
              <th className="px-4 py-4">Agent Name</th>
              <th className="px-4 py-4">Agent No</th>
              <th className="pl-4 pr-6 py-4">KAM</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => {
              // Req ID/Status Time/Agent Name/Agent No/KAM only ever vary by request, and
              // POC/Name/Number/Connection Status/Invoice ID only vary by client — rowSpan them
              // over every service row they'd otherwise repeat on, so a multi-service request or
              // client reads as one group instead of the same agent/client info printed on every
              // row. Groups are computed within the current page only.
              const prevRow = paged[i - 1];
              const isFirstOfRequest = !prevRow || prevRow.agentId !== row.agentId || prevRow.requestId !== row.requestId;
              const isFirstOfClient = isFirstOfRequest || prevRow.clientIndex !== row.clientIndex;

              let requestRowSpan = 0;
              if (isFirstOfRequest) {
                for (let j = i; j < paged.length && paged[j].agentId === row.agentId && paged[j].requestId === row.requestId; j++) requestRowSpan++;
              }
              let clientRowSpan = 0;
              if (isFirstOfClient) {
                for (
                  let j = i;
                  j < paged.length && paged[j].agentId === row.agentId && paged[j].requestId === row.requestId && paged[j].clientIndex === row.clientIndex;
                  j++
                )
                  clientRowSpan++;
              }

              return (
                <tr key={row.key} onClick={() => openPanel(row)} className="hover:bg-neutral-50/50 transition-colors group cursor-pointer align-top">
                  {isFirstOfRequest && (
                    <td rowSpan={requestRowSpan} className="pl-6 pr-4 py-3 border-b border-neutral-100">
                      <span className="font-mono text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">{row.requestId}</span>
                    </td>
                  )}
                  {isFirstOfRequest && (
                    <td rowSpan={requestRowSpan} className="px-4 py-3 text-neutral-400 border-b border-neutral-100">
                      {relativeTime(serviceAt(row)) || '—'}
                    </td>
                  )}
                  {isFirstOfClient && (
                    <td rowSpan={clientRowSpan} className="px-4 py-3 border-b border-neutral-100">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          row.pocType === 'agent' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
                        }`}
                      >
                        {row.pocType === 'agent' ? 'Agent' : 'Client'}
                      </span>
                    </td>
                  )}
                  {isFirstOfClient && (
                    <td rowSpan={clientRowSpan} className="px-4 py-3 font-semibold text-neutral-900 border-b border-neutral-100">
                      {row.pocName}
                    </td>
                  )}
                  {isFirstOfClient && (
                    <td rowSpan={clientRowSpan} className="px-4 py-3 text-neutral-500 border-b border-neutral-100">
                      {row.pocPhone ? (
                        <div className="flex items-center gap-1.5">
                          <span>{formatPhone(row.pocPhone)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(row.key, row.pocPhone);
                            }}
                            title="Copy number"
                            className="p-1 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                          >
                            {copiedKey === row.key ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  )}
                  {isFirstOfClient && (
                    <td rowSpan={clientRowSpan} className="px-4 py-3 whitespace-nowrap border-b border-neutral-100">
                      {row.lastConnection ? (
                        <>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              CONNECTION_STATUS_STYLES[row.lastConnection.status] || 'bg-neutral-100 text-neutral-500'
                            }`}
                          >
                            {optionLabel(CONNECTION_STATUS_OPTIONS, row.lastConnection.status)}
                          </span>
                          <span className="text-neutral-400 text-[11px] ml-1.5">{relativeTime(row.lastConnection.time) || '—'}</span>
                        </>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                  )}
                  {isFirstOfClient && (
                    <td rowSpan={clientRowSpan} className="px-4 py-3 font-mono text-neutral-500 border-b border-neutral-100">
                      {row.invoiceId || '—'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-neutral-700 font-medium border-b border-neutral-100">{serviceLabel(row.serviceName)}</td>
                  <td className="px-4 py-3 font-mono text-neutral-500 border-b border-neutral-100">{row.service.vaultServiceId || '—'}</td>
                  <td className="px-4 py-3 border-b border-neutral-100">
                    {row.service.lost && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700">Lost</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-neutral-100">{boolBadge(row.service.documentsReceived)}</td>
                  <td className="px-4 py-3 border-b border-neutral-100">{boolBadge(row.service.advanceReceived)}</td>
                  {isFirstOfRequest && (
                    <td rowSpan={requestRowSpan} className="px-4 py-3 text-neutral-700 border-b border-neutral-100">
                      {row.agentName}
                    </td>
                  )}
                  {isFirstOfRequest && (
                    <td rowSpan={requestRowSpan} className="px-4 py-3 text-neutral-500 border-b border-neutral-100">
                      {row.contact ? (
                        <div className="flex items-center gap-1.5">
                          <span>{formatPhone(row.contact)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(`${row.key}-agent`, row.contact);
                            }}
                            title="Copy number"
                            className="p-1 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                          >
                            {copiedKey === `${row.key}-agent` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  )}
                  {isFirstOfRequest && (
                    <td rowSpan={requestRowSpan} className="pl-4 pr-6 py-3 text-neutral-700 border-b border-neutral-100">
                      {row.kam}
                    </td>
                  )}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={15} className="px-6 py-16 text-center text-neutral-400">
                  No services in progress match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {rows.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-neutral-200 shrink-0">
          <span className="text-neutral-400">
            Page {currentPage} of {totalPages} · {rows.length} services
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Side panel — same shell as the Qualify page side panel, so a request looks and
          behaves identically whichever stage it's opened from. */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/30 z-40 flex justify-end" onClick={closePanel}>
          <div className="bg-white h-full w-2/5 min-w-[420px] shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <header className="h-16 flex items-center justify-end px-6 bg-white border-b border-neutral-100 sticky top-0 z-10">
              <button onClick={closePanel} className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl">
                <X size={18} />
              </button>
            </header>

            <div className="p-6 space-y-4">
              {/* Agent Details — same identity card used across the Agent Connect panel and
                  every Legal Doc side panel */}
              <AgentIdentityCard
                name={selectedLead.agentName}
                agentId={selectedLead.agentId}
                contact={selectedLead.contact ? formatPhone(selectedLead.contact) : '—'}
                kam={selectedLead.kam}
                status={selectedLead.agentStatus || 'maybe'}
                onUpdateStatus={(newStatus, noteText) => handleUpdateAgentLegalStatus(selectedLead, newStatus, noteText)}
              >
                {(() => {
                  const notes = selectedLead.agentNotes || [];
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

              <div className="border border-neutral-200 rounded-2xl p-4">
                <div className="grid grid-cols-2 gap-y-1.5 text-[13px] items-center">
                  <span className="text-neutral-400">Status</span>
                  <span
                    className={`inline-flex w-fit px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      STATUS_STYLES[selectedLead.status] || 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {optionLabel(REQUEST_STATUS_OPTIONS, selectedLead.status)}
                  </span>
                  <span className="text-neutral-400">Status Date</span>
                  <span className="text-neutral-700">{formatDate(serviceAt(selectedLead)) || '—'}</span>
                  <span className="text-neutral-400">Request ID</span>
                  <span className="text-neutral-700 font-mono">{selectedLead.id}</span>
                  <span className="text-neutral-400">Request Date</span>
                  <span className="text-neutral-700">{formatDate(selectedLead.createdAt) || '—'}</span>
                  <span className="text-neutral-400">Source</span>
                  <span className="text-neutral-700 capitalize">{selectedLead.source}</span>
                </div>
              </div>

              {panelClient && (
                <>
                  <div className="border border-neutral-200 rounded-2xl p-4">
                    <div className="grid grid-cols-2 gap-y-1.5 text-[13px] items-center">
                      <span className="text-neutral-400">POC</span>
                      <span>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            panelClient.pocType === 'agent' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
                          }`}
                        >
                          {panelClient.pocType === 'agent' ? 'Agent' : 'Client'}
                        </span>
                      </span>
                      <span className="text-neutral-400">Name</span>
                      <span className="text-neutral-700 font-medium">{clientLabel(panelClient)}</span>
                      <span className="text-neutral-400">Number</span>
                      {(() => {
                        const pocPhone = panelClient.pocType === 'agent' ? selectedLead.contact : panelClient.phone;
                        const phoneKey = `panel-${selected.clientIndex}`;
                        return pocPhone ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-700">{formatPhone(pocPhone)}</span>
                            <button
                              onClick={() => handleCopy(phoneKey, pocPhone)}
                              title="Copy number"
                              className="p-1 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                            >
                              {copiedKey === phoneKey ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-700">—</span>
                        );
                      })()}
                    </div>
                  </div>

                  <InvoiceIdField
                    key={`${selectedLead.agentId}-${selectedLead.id}-${selected.clientIndex}-invoice`}
                    client={panelClient}
                    onSave={(v) => handleSetInvoiceId(selectedLead, selected.clientIndex, v)}
                  />

                  {/* Every service on this client — Service ID, Docs/Advance toggles and a
                      Lost toggle per row, Add Service and a single Save for everything above it. */}
                  <ServicesEditor
                    key={`${selectedLead.agentId}-${selectedLead.id}-${selected.clientIndex}-services`}
                    services={panelClient.services}
                    onSaveVaultId={(name, v) => handleSetVaultId(selectedLead, selected.clientIndex, name, v)}
                    onToggleDocsReceived={(name) => handleToggleDocumentsReceived(selectedLead, selected.clientIndex, name)}
                    onToggleAdvanceReceived={(name) => handleToggleAdvanceReceived(selectedLead, selected.clientIndex, name)}
                    onToggleLost={(name) => handleToggleLost(selectedLead, selected.clientIndex, name)}
                    onAddServiceByName={(name) => handleAddServiceToClient(selectedLead, selected.clientIndex, name)}
                  />
                </>
              )}

              {/* Call Log — pixel-matched to the Leads/Qualify Log a Connect + Connect History:
                  always-open form, Connected/RNR/Call Back outcome buttons, topic pills, "With
                  notes only" filter, icon-badged history and a rollup summary. One shared
                  timeline for the whole request, logged against the first client/POC on it. */}
              {(() => {
                // Calling a client, not the agent — only Legal is a meaningful topic for them;
                // Inventory/Enquiry/Masal AI/Primary/Loan only make sense on a call with the agent.
                const visibleTopics = panelClient?.pocType === 'client' ? CONNECT_TOPIC_OPTIONS.filter((o) => o.value === 'services') : CONNECT_TOPIC_OPTIONS;

                const allEntries = allConnectionsFor(selectedLead);
                const visibleEntries = onlyWithNotes ? allEntries.filter((e) => e.notes) : allEntries;
                const connectedCount = allEntries.filter((e) => e.status === 'connected').length;
                const rnrCount = allEntries.filter((e) => e.status === 'rnr').length;
                const callBackCount = allEntries.filter((e) => e.status === 'call_back').length;
                const lastEntry = allEntries[0] || null;

                // "RNR 1", "RNR 2", ... in the order they actually happened (oldest first), a
                // streak that resets whenever a "Connected" lands in between — same as the
                // Agent Connect panel's RNR counter. The running count left over after the
                // loop is what the next RNR button should show.
                const rnrOrdinals = new Map();
                let rnrSeq = 0;
                [...allEntries].reverse().forEach((e) => {
                  if (e.status === 'connected') rnrSeq = 0;
                  else if (e.status === 'rnr') rnrOrdinals.set(e, ++rnrSeq);
                });
                const nextRnrNumber = rnrSeq + 1;

                return (
                  <>
                    <div className="border border-neutral-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <SegmentedToggle
                          value={callForm.connectMedium}
                          onChange={(v) => setCallForm((f) => ({ ...f, connectMedium: v }))}
                          ariaLabel="Connect Medium"
                          options={[
                            { value: 'on call', label: 'Call' },
                            { value: 'on whatsapp', label: 'WhatsApp' },
                          ]}
                        />
                        <SegmentedToggle
                          value={callForm.direction}
                          onChange={(v) => setCallForm((f) => ({ ...f, direction: v }))}
                          ariaLabel="Call Direction"
                          options={[
                            { value: 'outbound', label: 'Outbound', icon: <ArrowUpRight size={13.5} />, activeIcon: <ArrowUpRight size={13.5} /> },
                            { value: 'inbound', label: 'Inbound', icon: <ArrowDownLeft size={13.5} />, activeIcon: <ArrowDownLeft size={13.5} /> },
                          ]}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setCallForm((f) => ({ ...f, status: 'connected' }))}
                          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${
                            callForm.status === 'connected'
                              ? 'bg-white border-neutral-700 text-neutral-900 font-semibold'
                              : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>Connected</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCallForm((f) => ({ ...f, status: 'rnr' }))}
                          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${
                            callForm.status === 'rnr'
                              ? 'bg-white border-neutral-700 text-neutral-900 font-semibold'
                              : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <XCircle size={14} className="text-red-500" />
                          <span>RNR {nextRnrNumber}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCallForm((f) => ({ ...f, status: 'call_back' }));
                            if (!callbackDate) {
                              const slot = toBusinessSlot(new Date());
                              setCallbackDate(slot.dateValue);
                              setCallbackTime(slot.timeValue);
                            }
                          }}
                          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full border text-[13px] transition-colors ${
                            callForm.status === 'call_back'
                              ? 'bg-white border-neutral-700 text-neutral-900 font-semibold'
                              : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <Clock size={14} className="text-amber-500" />
                          <span>Call Back</span>
                        </button>
                      </div>

                      {callForm.status === 'call_back' && (
                        <CallbackCalendarAndTimePicker
                          callbackDate={callbackDate}
                          callbackTime={callbackTime}
                          onSelectDate={setCallbackDate}
                          onSelectTime={setCallbackTime}
                        />
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {visibleTopics.map((o) => {
                          const isSelected = callForm.topics.includes(o.value);
                          const c = topicColor(o.value);
                          return (
                            <button
                              key={o.value}
                              type="button"
                              onClick={() =>
                                setCallForm((f) => ({
                                  ...f,
                                  topics: f.topics.includes(o.value) ? f.topics.filter((x) => x !== o.value) : [...f.topics, o.value],
                                }))
                              }
                              className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                                isSelected ? `${c.bg} ${c.text} ${c.border} font-semibold` : 'bg-white text-neutral-500 border-neutral-200 font-medium hover:bg-neutral-100'
                              }`}
                            >
                              {topicLabel(o.value)}
                            </button>
                          );
                        })}
                      </div>

                      <textarea
                        placeholder="Need to remember something? Type it here..."
                        value={callForm.notes}
                        onChange={(e) => setCallForm((f) => ({ ...f, notes: e.target.value }))}
                        rows={3}
                        className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-neutral-400 resize-none"
                      />

                      <button
                        type="button"
                        onClick={() => submitLogCall(selectedLead, selected.clientIndex)}
                        disabled={callForm.status === 'call_back' && !(callbackDate && callbackTime)}
                        className="w-full py-2.5 bg-white hover:bg-neutral-50 border border-neutral-900 text-neutral-900 rounded-full font-semibold text-[13px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Save Connect Log
                      </button>
                    </div>

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

                      {visibleEntries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-10 text-neutral-400 border border-dashed border-neutral-200 rounded-2xl">
                          <PhoneCall size={20} className="mb-2 text-neutral-300" />
                          <p className="text-[13px]">{allEntries.length === 0 ? 'No connects logged yet.' : 'No connects with notes yet.'}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {visibleEntries.map((entry, i) => {
                            const meta = connectionStatusMeta(entry.status);
                            const hasBelow = entry.topics?.length > 0 || entry.notes;
                            return (
                              <div key={i} className="border border-neutral-200 rounded-2xl p-5">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${meta.badgeClass}`}>
                                      <meta.Icon size={18} />
                                    </span>
                                    <span className="text-[13px] font-semibold text-neutral-800">
                                      {entry.status === 'rnr' ? `RNR ${rnrOrdinals.get(entry)}` : optionLabel(CONNECTION_STATUS_OPTIONS, entry.status)}
                                    </span>

                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 shrink-0">
                                      {entry.connectMedium === 'on whatsapp' ? <WhatsAppLogo size={18} /> : <Phone size={15} />}
                                    </span>

                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 shrink-0">
                                      {entry.direction === 'inbound' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </span>
                                  </div>
                                  <span className="text-neutral-400 text-[12px] whitespace-nowrap">
                                    {relativeTime(entry.time) || '—'} by {entry.user || '—'}
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
                                    {entry.notes && <p className="text-neutral-600 text-[13px] leading-relaxed">{entry.notes}</p>}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {allEntries.length > 0 && (
                        <div className="border border-neutral-200 rounded-2xl p-5 mt-3">
                          <ul className="space-y-1.5 text-[13px] text-neutral-700 list-disc list-inside marker:text-neutral-700 marker:text-base">
                            <li>{allEntries.length} connect{allEntries.length !== 1 ? 's' : ''} logged</li>
                            <li>
                              {connectedCount} connected · {rnrCount} RNR · {callBackCount} call back
                            </li>
                            {lastEntry && (
                              <li>
                                Last connect {relativeTime(lastEntry.time)} by {lastEntry.user}
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalDocServicePage;
