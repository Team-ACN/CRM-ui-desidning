import React, { useState } from 'react';
import {
  Search,
  X,
  Filter,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  ArrowRight,
  Ban,
  RotateCcw,
  FileText,
  FileCheck,
  Receipt,
  IndianRupee,
  Send,
  Paperclip,
  PackageCheck,
  PlusCircle,
} from 'lucide-react';
import { MultiFilterSelect, FilterSelect } from '../Edge/FilterControls';
import AgentIdentityCard from '../shared/AgentIdentityCard';
import AddLeadRecordModal from '../shared/AddLeadRecordModal';
import { summarize } from '../../utils/filters';
import {
  getLegalDocRecords,
  updateRequestStatus,
  setAgentLegalStatus,
  setSalesPoc,
  addDocumentToService,
  toggleDocumentReceived,
  removeDocumentFromService,
  attachDocumentFile,
  addLeadRequest,
  setServiceChargeableAmount,
  effectiveStage,
  currentStatus,
  REQUEST_STATUS_OPTIONS,
  STATUS_STYLES,
  SERVICE_STAGE_STATUSES,
  NEXT_STATUS_MAP,
  SERVICE_NAME_OPTIONS,
  SOURCE_OPTIONS,
  KAM_OPTIONS,
  optionLabel,
} from '../../data/mockLegalDoc';

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

const serviceLabel = (name) => SERVICE_NAME_OPTIONS.find((s) => s.value === name)?.label || name;

function clientLabel(client) {
  if (client.pocType === 'agent') return 'Agent (self)';
  return client.name || 'Unnamed client';
}

const POC_TYPE_OPTIONS = [
  { value: 'agent', label: 'Agent' },
  { value: 'client', label: 'Client' },
];

// How far along document collection is for a single service — this is the tracking the
// Service stage runs on: "2/4 collected" tells you at a glance what's left on that one
// service before it can move to Documents Collected / Invoice Sent.
function docsProgressForService(service) {
  const docs = service.documents || [];
  return { received: docs.filter((d) => d.received).length, total: docs.length };
}

const emptyNewService = {
  agentId: '',
  agentName: '',
  contact: '',
  kam: KAM_OPTIONS[0].value,
  serviceName: SERVICE_NAME_OPTIONS[0].value,
  amount: '',
  source: SOURCE_OPTIONS[0].value,
};

const AddDocumentInput = ({ onAdd }) => {
  const [value, setValue] = useState('');
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && value.trim()) {
          onAdd(value.trim());
          setValue('');
        }
      }}
      placeholder="+ Add a document requirement, press Enter..."
      className="w-full border border-neutral-200 rounded-md px-2.5 py-1.5 text-[12px] outline-none focus:border-neutral-400 mt-1.5"
    />
  );
};

const LegalDocServicePage = () => {
  const [, setVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [kamFilter, setKamFilter] = useState([]);
  const [serviceFilter, setServiceFilter] = useState([]);
  const [pocTypeFilter, setPocTypeFilter] = useState([]);
  const [salesPocFilter, setSalesPocFilter] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [copiedKey, setCopiedKey] = useState(null);
  const [selected, setSelected] = useState(null);
  const [actionNote, setActionNote] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [newService, setNewService] = useState(emptyNewService);

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
          // req.status is the full status log — keep it under statusLog for the Status History
          // list, and flatten status itself to the current stage string so every existing
          // `.status` read in this file (filters, badges, NEXT_STATUS_MAP lookups) keeps working.
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
          serviceName: s.name,
          service: s,
        });
      });
    });
  });

  const matchesSearch = (row) =>
    `${row.agentId} ${row.agentName} ${serviceLabel(row.serviceName)}`.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = (row) => statusFilter.length === 0 || statusFilter.includes(row.status);
  const matchesKam = (row) => kamFilter.length === 0 || kamFilter.includes(row.kam);
  const matchesService = (row) => serviceFilter.length === 0 || serviceFilter.includes(row.serviceName);
  const matchesPocType = (row) => pocTypeFilter.length === 0 || pocTypeFilter.includes(row.pocType);
  const matchesSalesPoc = (row) => salesPocFilter.length === 0 || salesPocFilter.includes(row.salesPoc);

  function countOptions(dim, options, getValues) {
    return options.map((o) => ({
      ...o,
      count: allServiceRows.filter(
        (row) =>
          matchesSearch(row) &&
          (dim === 'status' || matchesStatus(row)) &&
          (dim === 'kam' || matchesKam(row)) &&
          (dim === 'service' || matchesService(row)) &&
          (dim === 'pocType' || matchesPocType(row)) &&
          (dim === 'salesPoc' || matchesSalesPoc(row)) &&
          getValues(row).includes(o.value)
      ).length,
    }));
  }

  const rows = allServiceRows.filter(
    (row) => matchesSearch(row) && matchesStatus(row) && matchesKam(row) && matchesService(row) && matchesPocType(row) && matchesSalesPoc(row)
  );
  const activeFilterCount =
    statusFilter.length + kamFilter.length + serviceFilter.length + pocTypeFilter.length + salesPocFilter.length;

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
    salesPocFilter.length > 0 && {
      key: 'salesPoc',
      label: `Sales POC: ${summarize(salesPocFilter, KAM_OPTIONS, '')}`,
      clear: () => setSalesPocFilter([]),
    },
  ].filter(Boolean);

  function clearAllFilters() {
    setStatusFilter([]);
    setKamFilter([]);
    setServiceFilter([]);
    setPocTypeFilter([]);
    setSalesPocFilter([]);
  }

  const filterKey = JSON.stringify([search, statusFilter, kamFilter, serviceFilter, pocTypeFilter, salesPocFilter, sortBy]);
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

  function openPanel(lead) {
    setSelected({ agentId: lead.agentId, id: lead.id });
    setActionNote('');
  }

  function closePanel() {
    setSelected(null);
    setActionNote('');
  }

  // Legal Status (good/maybe/bad) is one value per agent, shared with the Agent Connect panel —
  // editing it here updates it everywhere, same as editing it there.
  function handleUpdateAgentLegalStatus(lead, newStatus) {
    setAgentLegalStatus(lead.agentId, { agentName: lead.agentName, contact: lead.contact, kam: lead.kam }, newStatus, lead.kam);
    bump();
  }

  function handleCopy(key, value) {
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    });
  }

  function handleStatusChange(lead, status, notes = '') {
    updateRequestStatus(lead.agentId, lead.id, status, { notes, user: lead.salesPoc || lead.kam });
    bump();
    if (selected?.agentId === lead.agentId && selected?.id === lead.id) closePanel();
  }

  function handleAssignSalesPoc(lead, user) {
    setSalesPoc(lead.agentId, lead.id, user);
    bump();
  }

  // Lets a KAM add a service need straight into the Service stage — the price has to be set
  // here at creation, since the panel no longer allows editing a service after the fact.
  function submitNewService(e) {
    e.preventDefault();
    if (!newService.agentId || !newService.agentName) return;
    const request = addLeadRequest(newService);
    if (newService.amount) {
      setServiceChargeableAmount(newService.agentId, request.id, 0, newService.serviceName, Number(newService.amount));
    }
    updateRequestStatus(newService.agentId, request.id, 'service', {
      notes: 'Added directly to Service',
      user: newService.kam,
    });
    setSalesPoc(newService.agentId, request.id, newService.kam);
    setNewService(emptyNewService);
    setAddOpen(false);
    bump();
  }

  const ACTION_META = {
    documents_collected: { label: 'Docs Collected', icon: FileCheck, primary: true },
    invoice_sent: { label: 'Send Invoice', icon: Receipt, primary: true },
    payment_received: { label: 'Payment Received', icon: IndianRupee, primary: true },
    service_forwarded: { label: 'Forward Service', icon: Send, primary: true },
    service_delivered: { label: 'Mark Delivered', icon: PackageCheck, primary: true },
    lost: { label: 'Mark Lost', icon: Ban, primary: false },
  };
  const defaultActionMeta = (target) => ({ label: `Reopen (${optionLabel(REQUEST_STATUS_OPTIONS, target)})`, icon: RotateCcw, primary: true });

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
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <PlusCircle size={16} /> Add Service
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
              allCount={allServiceRows.filter((row) => matchesSearch(row) && matchesKam(row) && matchesService(row) && matchesPocType(row) && matchesSalesPoc(row)).length}
              value={statusFilter}
              onChange={setStatusFilter}
              options={countOptions(
                'status',
                REQUEST_STATUS_OPTIONS.filter((o) => SERVICE_STAGE_STATUSES.includes(o.value) || o.value === 'lost'),
                (row) => [row.status]
              )}
            />
            <MultiFilterSelect
              label="KAM"
              allLabel="All KAMs"
              allCount={allServiceRows.filter((row) => matchesSearch(row) && matchesStatus(row) && matchesService(row) && matchesPocType(row) && matchesSalesPoc(row)).length}
              value={kamFilter}
              onChange={setKamFilter}
              options={countOptions('kam', KAM_OPTIONS, (row) => [row.kam])}
            />
            <MultiFilterSelect
              label="Service"
              allLabel="All Services"
              allCount={allServiceRows.filter((row) => matchesSearch(row) && matchesStatus(row) && matchesKam(row) && matchesPocType(row) && matchesSalesPoc(row)).length}
              value={serviceFilter}
              onChange={setServiceFilter}
              options={countOptions('service', SERVICE_NAME_OPTIONS, (row) => [row.serviceName])}
            />
            <MultiFilterSelect
              label="POC"
              allLabel="Agent & Client"
              allCount={allServiceRows.filter((row) => matchesSearch(row) && matchesStatus(row) && matchesKam(row) && matchesService(row) && matchesSalesPoc(row)).length}
              value={pocTypeFilter}
              onChange={setPocTypeFilter}
              options={countOptions('pocType', POC_TYPE_OPTIONS, (row) => [row.pocType])}
            />
            <MultiFilterSelect
              label="Sales POC"
              allLabel="All POCs"
              allCount={allServiceRows.filter((row) => matchesSearch(row) && matchesStatus(row) && matchesKam(row) && matchesService(row) && matchesPocType(row)).length}
              value={salesPocFilter}
              onChange={setSalesPocFilter}
              options={countOptions('salesPoc', KAM_OPTIONS, (row) => [row.salesPoc])}
            />
            <FilterSelect label="Sort" value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} defaultValue="newest" />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto bg-white">
        <table className="text-left text-[13px] text-neutral-600 whitespace-nowrap min-w-[1350px] w-full">
          <thead className="bg-white text-[11px] font-medium uppercase tracking-wider text-neutral-500 sticky top-0 z-10 shadow-[0_1px_0_0_#e7e5e4]">
            <tr>
              <th className="pl-6 pr-4 py-4">POC</th>
              <th className="px-4 py-4">POC Name</th>
              <th className="px-4 py-4">POC Number</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Service Name</th>
              <th className="px-4 py-4">Negotiable Price</th>
              <th className="px-4 py-4">Document Status</th>
              <th className="px-4 py-4">CP ID</th>
              <th className="px-4 py-4">Agent Name</th>
              <th className="pl-4 pr-6 py-4">Agent Number</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paged.map((row) => {
              const { received, total } = docsProgressForService(row.service);
              const amount = row.service.chargeableAmount;
              return (
                <tr
                  key={row.key}
                  onClick={() => openPanel({ agentId: row.agentId, id: row.requestId })}
                  className="hover:bg-neutral-50/50 transition-colors group cursor-pointer"
                >
                  <td className="pl-6 pr-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        row.pocType === 'agent' ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
                      }`}
                    >
                      {row.pocType === 'agent' ? 'Agent' : 'Client'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{row.pocName}</td>
                  <td className="px-4 py-3 text-neutral-500">{row.pocPhone ? formatPhone(row.pocPhone) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[row.status] || 'bg-neutral-100 text-neutral-600'}`}>
                      {optionLabel(REQUEST_STATUS_OPTIONS, row.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-700 font-medium">{serviceLabel(row.serviceName)}</td>
                  <td className="px-4 py-3 text-neutral-600">{amount ? `₹${amount.toLocaleString('en-IN')}` : '—'}</td>
                  <td className="px-4 py-3">
                    {total === 0 ? (
                      <span className="text-neutral-400">—</span>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[12px] font-medium ${
                          received === total ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {received}/{total} collected
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-neutral-500">{row.agentId}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-900">{row.agentName}</td>
                  <td className="pl-4 pr-6 py-3 text-neutral-500">
                    {row.contact ? (
                      <div className="flex items-center gap-1.5">
                        <span>{formatPhone(row.contact)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(row.key, row.contact);
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
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-16 text-center text-neutral-400">
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

      {/* Side panel — same shell as Qualify/Agent Connect (avatar header, single scroll
          region, sticky action bar). Document tracking lives under each client's services,
          since that's what actually drives the status progression here. */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={closePanel}>
          <div
            className="bg-white h-full w-2/5 min-w-[460px] shadow-2xl flex flex-col [&_button]:focus:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-neutral-300"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="shrink-0 flex items-center justify-end px-5 py-3 bg-white border-b border-neutral-100">
              <button onClick={closePanel} className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                <X size={17} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Agent Details — same identity card used across the Agent Connect panel and
                  every Legal Doc side panel */}
              <AgentIdentityCard
                name={selectedLead.agentName}
                agentId={selectedLead.agentId}
                contact={selectedLead.contact ? formatPhone(selectedLead.contact) : '—'}
                kam={selectedLead.kam}
                status={selectedLead.agentStatus || 'maybe'}
                onUpdateStatus={(newStatus) => handleUpdateAgentLegalStatus(selectedLead, newStatus)}
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

              <div className="border border-neutral-200 rounded-2xl p-5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Sales POC</div>
                <select
                  value={selectedLead.salesPoc || ''}
                  onChange={(e) => handleAssignSalesPoc(selectedLead, e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-3 py-1.5 text-[13px] bg-white"
                >
                  <option value="" disabled>Assign a POC...</option>
                  {KAM_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {selectedLead.clients.map((client, ci) => (
                <div key={ci} className="border border-neutral-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={14} className="text-neutral-400" />
                    <span className="font-medium text-neutral-800 text-[13px]">{clientLabel(client)}</span>
                    {client.phone && (
                      <>
                        <span className="text-neutral-300">·</span>
                        <span className="text-neutral-400 text-[12px]">{formatPhone(client.phone)}</span>
                      </>
                    )}
                  </div>
                  {/* Fixed once in Service stage — the service was locked in back at Qualify,
                      so this is read-only here, no add/remove/qty controls. */}
                  {client.services.length === 0 ? (
                    <p className="text-neutral-400 text-[13px]">No services yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {client.services.map((s) => (
                        <span
                          key={s.name}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-neutral-900 text-[13px] font-medium"
                        >
                          {serviceLabel(s.name)}
                          {(s.qty || 1) > 1 ? ` ×${s.qty}` : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {client.services.map((s) => {
                    const docs = s.documents || [];
                    return (
                      <div key={s.name} className="mt-3 pt-3 border-t border-neutral-100">
                        <div className="text-[12px] font-medium text-neutral-700 mb-1.5">
                          {serviceLabel(s.name)} documents
                          {docs.length > 0 && (
                            <span className="text-neutral-400 font-normal"> · {docs.filter((d) => d.received).length}/{docs.length}</span>
                          )}
                        </div>
                        {docs.length === 0 ? (
                          <p className="text-neutral-400 text-[12px]">No documents added yet.</p>
                        ) : (
                          <div className="space-y-1">
                            {docs.map((d, di) => {
                              const inputId = `doc-upload-${ci}-${s.name}-${di}`;
                              return (
                                <div key={di} className="flex items-center gap-2 text-[12.5px]">
                                  <input
                                    type="checkbox"
                                    checked={!!d.received}
                                    onChange={() => {
                                      toggleDocumentReceived(selectedLead.agentId, selectedLead.id, ci, s.name, di);
                                      bump();
                                    }}
                                    className="accent-neutral-900"
                                  />
                                  <span className={d.received ? 'line-through text-neutral-400' : 'text-neutral-700'}>{d.name}</span>
                                  <div className="ml-auto flex items-center gap-2">
                                    {d.fileUrl && (
                                      <a
                                        href={d.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline text-[11px] truncate max-w-[90px]"
                                      >
                                        {d.fileName}
                                      </a>
                                    )}
                                    <input
                                      type="file"
                                      id={inputId}
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const fileUrl = URL.createObjectURL(file);
                                        attachDocumentFile(selectedLead.agentId, selectedLead.id, ci, s.name, di, {
                                          fileName: file.name,
                                          fileUrl,
                                        });
                                        bump();
                                        e.target.value = '';
                                      }}
                                    />
                                    <label
                                      htmlFor={inputId}
                                      title={d.fileUrl ? 'Replace uploaded file' : 'Upload file'}
                                      className="text-neutral-300 hover:text-neutral-700 cursor-pointer"
                                    >
                                      <Paperclip size={12} />
                                    </label>
                                    <button
                                      onClick={() => {
                                        removeDocumentFromService(selectedLead.agentId, selectedLead.id, ci, s.name, di);
                                        bump();
                                      }}
                                      className="text-neutral-300 hover:text-red-500"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <AddDocumentInput
                          onAdd={(name) => {
                            addDocumentToService(selectedLead.agentId, selectedLead.id, ci, s.name, name);
                            bump();
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">Status History</div>
                <div className="space-y-2">
                  {[...(selectedLead.statusLog || [])].reverse().map((entry, i) => (
                    <div key={i} className="border border-neutral-200 rounded-2xl p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[entry.status] || 'bg-neutral-100 text-neutral-600'}`}>
                          {optionLabel(REQUEST_STATUS_OPTIONS, entry.status)}
                        </span>
                        <span className="text-neutral-400 text-[12px] whitespace-nowrap">{relativeTime(entry.time) || '—'}</span>
                      </div>
                      {entry.notes && <p className="text-neutral-600 text-[13px] mt-1.5">{entry.notes}</p>}
                    </div>
                  ))}
                  {(selectedLead.statusLog || []).length === 0 && (
                    <p className="text-neutral-400 text-[13px] border border-dashed border-neutral-200 rounded-2xl p-4 text-center">
                      No status history yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-neutral-100 px-5 py-3 space-y-2 bg-white">
              <input
                type="text"
                placeholder="Reason (optional)..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                className="w-full border border-neutral-200 rounded-xl px-3 py-1.5 text-[13px] outline-none focus:border-neutral-400"
              />
              {(() => {
                const targets = NEXT_STATUS_MAP[selectedLead.status] || [];
                if (targets.length === 0) {
                  return (
                    <div className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-[13px]">
                      <Check size={13} /> {optionLabel(REQUEST_STATUS_OPTIONS, selectedLead.status)} — Completed
                    </div>
                  );
                }
                // One clear primary action at a time — "lost" (or anything else non-primary)
                // stays available but as a quiet text link, not a competing button.
                const primaryTarget = targets.find((t) => (ACTION_META[t] || defaultActionMeta(t)).primary);
                const secondaryTargets = targets.filter((t) => t !== primaryTarget);
                const primaryMeta = primaryTarget && (ACTION_META[primaryTarget] || defaultActionMeta(primaryTarget));
                const PrimaryIcon = primaryMeta?.icon;
                return (
                  <>
                    {primaryTarget && (
                      <button
                        onClick={() => handleStatusChange(selectedLead, primaryTarget, actionNote)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 text-[13px] transition-colors"
                      >
                        {primaryMeta.label} <PrimaryIcon size={13} />
                      </button>
                    )}
                    {secondaryTargets.length > 0 && (
                      <div className="flex items-center justify-center gap-4 pt-0.5">
                        {secondaryTargets.map((target) => {
                          const meta = ACTION_META[target] || defaultActionMeta(target);
                          return (
                            <button
                              key={target}
                              onClick={() => handleStatusChange(selectedLead, target, actionNote)}
                              className="text-[12px] font-medium text-neutral-400 hover:text-red-500 transition-colors"
                            >
                              {meta.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Add-directly-to-Service modal — the price must be set here, since it can't be
          edited later from the panel. */}
      <AddLeadRecordModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Service"
        submitLabel="Add Service"
        formState={newService}
        onChange={setNewService}
        onSubmit={submitNewService}
        withPrice
      />
    </div>
  );
};

export default LegalDocServicePage;
