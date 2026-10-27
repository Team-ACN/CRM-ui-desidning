import React, { useState } from 'react';
import {
  Search,
  X,
  Filter,
  Plus,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  StickyNote,
  PhoneCall,
  Phone,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
} from 'lucide-react';
import { MultiFilterSelect, FilterSelect } from '../Edge/FilterControls';
import AddLegalLeadPanel from './AddLegalLeadPanel';
import { summarize } from '../../utils/filters';
import {
  getLegalDocRecords,
  updateRequestStatus,
  setAgentLegalStatus,
  addClientConnection,
  effectiveStage,
  currentStatus,
  REQUEST_STATUS_OPTIONS,
  STATUS_STYLES,
  QUALIFY_STAGE_STATUSES,
  CONNECTION_STATUS_OPTIONS,
  SERVICE_NAME_OPTIONS,
  KAM_OPTIONS,
  optionLabel,
} from '../../data/mockLegalDoc';
import { CONNECT_TOPIC_OPTIONS } from '../../data/mockAgents';
import LegalLeadSection from '../shared/LegalLeadSection';
import AgentIdentityCard from '../shared/AgentIdentityCard';
import SegmentedToggle from '../shared/SegmentedToggle';
import WhatsAppLogo from '../shared/WhatsAppLogo';
import CallbackCalendarAndTimePicker from '../shared/CallbackCalendarAndTimePicker';
import { toBusinessSlot } from '../shared/callbackSlots';

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name (A-Z)' },
];

function formatPhone(raw) {
  if (!raw) return raw;
  const match = raw.match(/^(\+\d{2})(\d{5})(\d{5})$/);
  return match ? `${match[1]} ${match[2]} ${match[3]}` : raw;
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

const SERVICE_NAME_OPTIONS_SORTED = [...SERVICE_NAME_OPTIONS].sort((a, b) => a.label.localeCompare(b.label));

const serviceLabel = (name) => SERVICE_NAME_OPTIONS.find((s) => s.value === name)?.label || name;

// Every client on a request carries its own connections — flatten across all of them (newest
// first) for the Connect History timeline.
function allConnectionsFor(request) {
  return request.clients
    .flatMap((c) => c.connections || [])
    .sort((a, b) => b.time - a.time);
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

function servicesOf(request) {
  return request.clients.flatMap((c) => c.services);
}

const POC_TYPE_OPTIONS = [
  { value: 'agent', label: 'Agent' },
  { value: 'client', label: 'Client' },
];

const POC_BADGE_STYLES = {
  agent: 'bg-blue-50 text-blue-700 border border-blue-100',
  client: 'bg-violet-50 text-violet-700 border border-violet-100',
};

function agentClientOf(request) {
  return request.clients.find((c) => c.pocType === 'agent') || null;
}

// "Agent" + "Client (4)" as two badges — a count instead of listing every client
// individually, so the table stays scannable; real names live in the side panel.
function pocBadges(request) {
  const agent = agentClientOf(request);
  const clientCount = request.clients.filter((c) => c.pocType === 'client' && c.services.length > 0).length;
  const badges = [];
  if (agent && agent.services.length > 0) badges.push({ key: 'agent', label: 'Agent' });
  if (clientCount > 0) badges.push({ key: 'client', label: `Client (${clientCount})` });
  return badges;
}

function hasPocType(request, type) {
  if (type === 'agent') {
    const agent = agentClientOf(request);
    return !!agent && agent.services.length > 0;
  }
  return request.clients.some((c) => c.pocType === 'client' && c.services.length > 0);
}

function qualifiedAt(request) {
  const entry = (request.statusLog || []).find((s) => QUALIFY_STAGE_STATUSES.includes(s.status));
  return entry ? entry.time : request.createdAt;
}

const LegalDocQualifyPage = () => {
  const [, setVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [kamFilter, setKamFilter] = useState([]);
  const [serviceFilter, setServiceFilter] = useState([]);
  const [pocTypeFilter, setPocTypeFilter] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [copiedKey, setCopiedKey] = useState(null);
  const [selected, setSelected] = useState(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
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

  const allQualified = [];
  getLegalDocRecords().forEach((r) => {
    (r.legalAndLoan.legalRequests || [])
      .filter((req) => effectiveStage(req) === 'qualify')
      .forEach((req) =>
        allQualified.push({
          agentId: r.agentId,
          agentName: r.agentName,
          contact: r.contact,
          kam: r.kam,
          agentStatus: r.legalAndLoan.status,
          agentNotes: r.legalAndLoan.notes,
          ...req,
          // req.status is the full status log — keep it under statusLog for qualifiedAt, and
          // flatten status itself to the current stage string so every existing `.status` read
          // in this file (filters, badges) keeps working unchanged.
          statusLog: req.status,
          status: currentStatus(req),
        })
      );
  });

  const matchesSearch = (l) => {
    const serviceText = servicesOf(l).map((s) => serviceLabel(s.name)).join(' ');
    return `${l.agentId} ${l.agentName} ${serviceText}`.toLowerCase().includes(search.toLowerCase());
  };
  const matchesStatus = (l) => statusFilter.length === 0 || statusFilter.includes(l.status);
  const matchesKam = (l) => kamFilter.length === 0 || kamFilter.includes(l.kam);
  const matchesService = (l) => serviceFilter.length === 0 || servicesOf(l).some((s) => serviceFilter.includes(s.name));
  const matchesPocType = (l) => pocTypeFilter.length === 0 || pocTypeFilter.some((t) => hasPocType(l, t));

  function countOptions(dim, options, getValues) {
    return options.map((o) => ({
      ...o,
      count: allQualified.filter(
        (l) =>
          matchesSearch(l) &&
          (dim === 'status' || matchesStatus(l)) &&
          (dim === 'kam' || matchesKam(l)) &&
          (dim === 'service' || matchesService(l)) &&
          (dim === 'pocType' || matchesPocType(l)) &&
          getValues(l).includes(o.value)
      ).length,
    }));
  }

  const rows = allQualified.filter(
    (l) => matchesSearch(l) && matchesStatus(l) && matchesKam(l) && matchesService(l) && matchesPocType(l)
  );
  const activeFilterCount = statusFilter.length + kamFilter.length + serviceFilter.length + pocTypeFilter.length;

  const activeFilters = [
    statusFilter.length > 0 && {
      key: 'status',
      label: `Status: ${summarize(statusFilter, REQUEST_STATUS_OPTIONS, '')}`,
      clear: () => setStatusFilter([]),
    },
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
  ].filter(Boolean);

  function clearAllFilters() {
    setStatusFilter([]);
    setKamFilter([]);
    setServiceFilter([]);
    setPocTypeFilter([]);
  }

  const filterKey = JSON.stringify([search, statusFilter, kamFilter, serviceFilter, pocTypeFilter, sortBy]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const sortedRows = [...rows].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.createdAt - b.createdAt;
      case 'name':
        return a.agentName.localeCompare(b.agentName);
      case 'newest':
      default:
        return b.createdAt - a.createdAt;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = sortedRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedLead = selected ? allQualified.find((l) => l.agentId === selected.agentId && l.id === selected.id) : null;

  function openPanel(lead) {
    setSelected({ agentId: lead.agentId, id: lead.id });
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

  // One shared connect timeline for the whole request, same as the Agent Connect panel and the
  // Leads page — logged against the first client/POC on the request, no picker shown.
  function submitLogCall(lead) {
    const callbackAt = callForm.status === 'call_back' && callbackDate && callbackTime ? new Date(`${callbackDate}T${callbackTime}`).getTime() : null;
    addClientConnection(lead.agentId, lead.id, 0, { ...callForm, user: lead.qualifiedBy || lead.kam, callbackAt });
    setCallForm({ connectMedium: 'on call', direction: 'outbound', status: 'connected', notes: '', topics: ['services'] });
    setCallbackDate('');
    setCallbackTime('');
    bump();
  }

  function handleCopy(key, value) {
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    });
  }

  // Generic status transition — handles "Move to Service", "Mark Lost" and "Reopen" alike,
  // since a request lost from Qualify still needs a way forward from right here.
  function handleStatusChange(lead, status, notes = '') {
    updateRequestStatus(lead.agentId, lead.id, status, { notes, user: lead.qualifiedBy || lead.kam });
    bump();
    if (selected?.agentId === lead.agentId && selected?.id === lead.id) closePanel();
  }

  return (
    <div className="flex flex-col bg-neutral-50 h-full text-[13px]">
      <header className="h-16 flex items-center px-6 bg-white justify-between shrink-0 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-500">Legal & Doc</span>
          <span className="text-neutral-300">/</span>
          <h1 className="font-bold text-neutral-900">Qualify</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-neutral-400 px-3 py-1 bg-neutral-100 rounded-full">{rows.length} Qualified</span>
          <button
            type="button"
            onClick={() => setAddLeadOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-[13px] transition-colors"
          >
            <Plus size={14} /> Add Qualified Lead
          </button>
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
              label="Status"
              allLabel="All Status"
              allCount={allQualified.filter((l) => matchesSearch(l) && matchesKam(l) && matchesService(l) && matchesPocType(l)).length}
              value={statusFilter}
              onChange={setStatusFilter}
              options={countOptions(
                'status',
                REQUEST_STATUS_OPTIONS.filter((o) => QUALIFY_STAGE_STATUSES.includes(o.value) || o.value === 'lost'),
                (l) => [l.status]
              )}
            />
            <MultiFilterSelect
              label="KAM"
              allLabel="All KAMs"
              allCount={allQualified.filter((l) => matchesSearch(l) && matchesStatus(l) && matchesService(l) && matchesPocType(l)).length}
              value={kamFilter}
              onChange={setKamFilter}
              options={countOptions('kam', KAM_OPTIONS, (l) => [l.kam])}
            />
            <MultiFilterSelect
              label="Service"
              allLabel="All Services"
              allCount={allQualified.filter((l) => matchesSearch(l) && matchesStatus(l) && matchesKam(l) && matchesPocType(l)).length}
              value={serviceFilter}
              onChange={setServiceFilter}
              options={countOptions('service', SERVICE_NAME_OPTIONS_SORTED, (l) => servicesOf(l).map((s) => s.name))}
              maxHeightClass="max-h-[36rem]"
            />
            <MultiFilterSelect
              label="POC"
              allLabel="Agent & Client"
              allCount={allQualified.filter((l) => matchesSearch(l) && matchesStatus(l) && matchesKam(l) && matchesService(l)).length}
              value={pocTypeFilter}
              onChange={setPocTypeFilter}
              options={countOptions('pocType', POC_TYPE_OPTIONS, (l) => POC_TYPE_OPTIONS.map((o) => o.value).filter((t) => hasPocType(l, t)))}
            />
            <FilterSelect label="Sort" value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} defaultValue="newest" />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto bg-white">
        <table className="text-left text-[13px] text-neutral-600 whitespace-nowrap min-w-[1200px] w-full">
          <thead className="bg-white text-[11px] font-medium uppercase tracking-wider text-neutral-500 sticky top-0 z-10 shadow-[0_1px_0_0_#e7e5e4]">
            <tr>
              <th className="pl-6 pr-4 py-4">Req ID</th>
              <th className="px-4 py-4">CPID</th>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Number</th>
              <th className="px-4 py-4">KAM</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">No. of Services</th>
              <th className="px-4 py-4">POC</th>
              <th className="pl-4 pr-6 py-4">Service Name</th>
              <th className="sticky right-0 z-10 bg-white px-4 py-4 text-center border-l border-neutral-300 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
                <MessageSquare size={13} className="inline text-neutral-300" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paged.map((lead) => {
              const key = `${lead.agentId}-${lead.id}`;
              const services = servicesOf(lead);
              const agentClient = agentClientOf(lead);
              const agentServices = agentClient ? agentClient.services : [];
              return (
                <tr key={key} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="pl-6 pr-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">{lead.id}</span>
                      <span className="text-neutral-400 text-[11px]">{formatDate(lead.createdAt) || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-500">{lead.agentId}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-900">{lead.agentName}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {lead.contact ? (
                      <div className="flex items-center gap-1.5">
                        <span>{formatPhone(lead.contact)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(key, lead.contact);
                          }}
                          title="Copy number"
                          className="p-1 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                        >
                          {copiedKey === key ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{lead.kam || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[lead.status] || 'bg-neutral-100 text-neutral-600'}`}>
                      {optionLabel(REQUEST_STATUS_OPTIONS, lead.status)}
                    </span>
                    <span className="text-neutral-400 text-[11px] ml-1.5">{relativeTime(qualifiedAt(lead)) || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {services.length === 0 ? (
                      <span className="text-neutral-400">—</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[12px] font-medium">
                        {services.length} service{services.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {pocBadges(lead).length === 0
                        ? <span className="text-neutral-400">—</span>
                        : pocBadges(lead).map((b) => (
                            <span key={b.key} className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${POC_BADGE_STYLES[b.key]}`}>
                              {b.label}
                            </span>
                          ))}
                    </div>
                  </td>
                  <td className="pl-4 pr-6 py-3 text-neutral-600">
                    {agentServices.length === 0 ? <span className="text-neutral-400">—</span> : agentServices.map((s) => serviceLabel(s.name)).join(', ')}
                  </td>
                  <td className="sticky right-0 bg-white group-hover:bg-neutral-50 text-center px-4 py-3 border-l border-l-neutral-300 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
                    <button
                      type="button"
                      onClick={() => openPanel(lead)}
                      title="Open details"
                      className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-16 text-center text-neutral-400">
                  No qualified requests match these filters.
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
            Page {currentPage} of {totalPages} · {rows.length} qualified
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

      {/* Side panel — same shell as the Leads page side panel, so a request looks and behaves
          identically whichever stage it's opened from. The only difference is the CTA: Leads
          offers Qualify/Drop, this offers Move to Service/Mark Lost (handled inside
          LegalLeadSection based on the request's current stage). */}
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
                  const notes = (selectedLead.agentNotes || []).filter((n) => n.text);
                  const entry = notes.length ? notes[notes.length - 1] : null;
                  if (!entry) return null;
                  return (
                    <div className="pt-3 border-t border-neutral-100">
                      <p className="text-neutral-500 text-[13px]">{entry.text}</p>
                      <span className="text-neutral-400 text-[11px]">
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
                  <span className="text-neutral-700">{formatDate(qualifiedAt(selectedLead)) || '—'}</span>
                  <span className="text-neutral-400">Request ID</span>
                  <span className="text-neutral-700 font-mono">{selectedLead.id}</span>
                  <span className="text-neutral-400">Request Date</span>
                  <span className="text-neutral-700">{formatDate(selectedLead.createdAt) || '—'}</span>
                  <span className="text-neutral-400">Source</span>
                  <span className="text-neutral-700 capitalize">{selectedLead.source}</span>
                </div>
              </div>

              {/* Agent services + per-client boxes + stage-advance action — same shared
                  component as the Leads page side panel, so a request's legal requirements
                  look and behave identically whichever stage it's edited from. */}
              <LegalLeadSection
                agentId={selectedLead.agentId}
                requestId={selectedLead.id}
                kam={selectedLead.kam}
                onQualified={() => {
                  bump();
                  closePanel();
                }}
                onDrop={() => handleStatusChange(selectedLead, 'lost')}
                onReopen={() => handleStatusChange(selectedLead, 'lead')}
              />

              {/* Call Log — pixel-matched to the Agent Connect panel's Log a Connect + Connect
                  History: always-open form, Connected/RNR/Call Back outcome buttons, topic
                  pills, "With notes only" filter, icon-badged history and a rollup summary.
                  One shared timeline for the whole request, logged against the first
                  client/POC on it — no picker shown. */}
              {(() => {
                const allEntries = allConnectionsFor(selectedLead);
                const visibleEntries = onlyWithNotes ? allEntries.filter((e) => e.notes) : allEntries;

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
                        {CONNECT_TOPIC_OPTIONS.map((o) => {
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
                        onClick={() => submitLogCall(selectedLead)}
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
                          <StickyNote size={11} /> {onlyWithNotes ? 'Calls with notes' : 'All calls'}
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

                      {allEntries.filter((e) => e.notes).length > 0 && (
                        <div className="border border-neutral-200 rounded-2xl divide-y divide-neutral-100 mt-3">
                          {allEntries
                            .filter((e) => e.notes)
                            .map((entry, i) => (
                              <div key={i} className="p-5">
                                <p className="text-neutral-600 text-[13px] leading-relaxed">{entry.notes}</p>
                                <span className="text-neutral-400 text-[11px]">
                                  {relativeTime(entry.time) || '—'} by {entry.user || '—'}
                                </span>
                              </div>
                            ))}
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

      {addLeadOpen && (
        <AddLegalLeadPanel
          stage="qualify"
          onClose={() => setAddLeadOpen(false)}
          onCreated={bump}
        />
      )}
    </div>
  );
};

export default LegalDocQualifyPage;
