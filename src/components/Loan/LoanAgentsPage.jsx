import React, { useState } from 'react';
import { Copy, Check, MessageSquare, Plus } from 'lucide-react';
import {
  mockLoanAgents,
  LOAN_AGENT_STATUS_STYLES,
  LOAN_AGENT_STATUS_OPTIONS,
  LOAN_AGENT_QUALITY_STYLES,
  LOAN_AGENT_QUALITY_OPTIONS,
  LOAN_KAM_OPTIONS,
  LOAN_SOURCE_OPTIONS,
} from '../../data/mockLoan';
import LoanPageHeader from './LoanPageHeader';
import LoanSearchFilterBar from './LoanSearchFilterBar';
import LoanTableShell from './LoanTableShell';
import LoanAgentPanel from './LoanAgentPanel';
import AddLoanAgentPanel from './AddLoanAgentPanel';

const PAGE_SIZE = 20;

// Status filter options exclude "Lead Shared" — once an agent's lead has been shared it moves to
// the Leads page, so it no longer needs to clutter this list.
const AGENT_STATUS_FILTER_OPTIONS = LOAN_AGENT_STATUS_OPTIONS.filter((s) => s !== 'Lead Shared');

function relativeTime(ts) {
  if (!ts) return null;
  const diffDays = Math.floor((Date.now() - ts) / 86400000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}

// First of the Home Loan module's three pages — same header/search/table shell as the Legal &
// Doc pages, so the Loan section feels like part of the same family.
const LoanAgentsPage = () => {
  const [, setVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [agentStatusFilter, setAgentStatusFilter] = useState([]);
  const [kamFilter, setKamFilter] = useState([]);
  const [sourceFilter, setSourceFilter] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [addAgentOpen, setAddAgentOpen] = useState(false);

  const bump = () => setVersion((v) => v + 1);

  const baseAgents = mockLoanAgents.filter((a) => a.status !== 'Lead Shared');
  const matchesSearch = (a) => `${a.cpid} ${a.name} ${a.number}`.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = (a) => statusFilter.length === 0 || statusFilter.includes(a.status);
  const matchesAgentStatus = (a) => agentStatusFilter.length === 0 || agentStatusFilter.includes(a.agentStatus);
  const matchesKam = (a) => kamFilter.length === 0 || kamFilter.includes(a.kam);
  const matchesSource = (a) => sourceFilter.length === 0 || sourceFilter.includes(a.source);

  // Each dimension's counts reflect the other active filters (but not its own), so picking a
  // value never zeroes out its own dropdown — same cross-filter counting the Legal Doc pages use.
  function countOptions(dim, values, getValue) {
    return values.map((v) => ({
      value: v,
      label: v,
      count: baseAgents.filter(
        (a) =>
          matchesSearch(a) &&
          (dim === 'status' || matchesStatus(a)) &&
          (dim === 'agentStatus' || matchesAgentStatus(a)) &&
          (dim === 'kam' || matchesKam(a)) &&
          (dim === 'source' || matchesSource(a)) &&
          getValue(a) === v
      ).length,
    }));
  }

  const rows = baseAgents.filter(
    (a) => matchesSearch(a) && matchesStatus(a) && matchesAgentStatus(a) && matchesKam(a) && matchesSource(a)
  );

  // Reset to page 1 whenever the filter/search set changes, same pattern LegalDocLeadsPage uses.
  const filterKey = JSON.stringify([search, statusFilter, agentStatusFilter, kamFilter, sourceFilter]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleCopy(id, value) {
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((k) => (k === id ? null : k)), 1500);
    });
  }

  const filters = [
    { key: 'status', label: 'Status', allLabel: 'All Status', value: statusFilter, onChange: setStatusFilter, options: countOptions('status', AGENT_STATUS_FILTER_OPTIONS, (a) => a.status) },
    {
      key: 'agentStatus',
      label: 'Agent Status',
      allLabel: 'All',
      value: agentStatusFilter,
      onChange: setAgentStatusFilter,
      options: countOptions('agentStatus', LOAN_AGENT_QUALITY_OPTIONS, (a) => a.agentStatus),
    },
    { key: 'kam', label: 'KAM', allLabel: 'All KAMs', value: kamFilter, onChange: setKamFilter, options: countOptions('kam', LOAN_KAM_OPTIONS, (a) => a.kam) },
    { key: 'source', label: 'Source', allLabel: 'All Sources', value: sourceFilter, onChange: setSourceFilter, options: countOptions('source', LOAN_SOURCE_OPTIONS, (a) => a.source) },
  ];

  const headerRow = (
    <tr>
      <th className="pl-6 pr-4 py-4">ID</th>
      <th className="px-4 py-4">CPID</th>
      <th className="px-4 py-4">Name</th>
      <th className="px-4 py-4">Number</th>
      <th className="px-4 py-4">Agent Status</th>
      <th className="px-4 py-4">KAM</th>
      <th className="px-4 py-4">Status</th>
      <th className="pl-4 pr-6 py-4">Source</th>
      <th className="sticky right-0 z-10 bg-white px-4 py-4 text-center border-l border-neutral-300 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
        <MessageSquare size={13} className="inline text-neutral-300" />
      </th>
    </tr>
  );

  return (
    <div className="flex flex-col bg-neutral-50 h-full text-[13px]">
      <LoanPageHeader title="Agents" countLabel={`${rows.length} Agents`} actionLabel="Add Agent" ActionIcon={Plus} onAction={() => setAddAgentOpen(true)} />

      <LoanSearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search CPID, name or number..."
        filters={filters}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
      />

      <LoanTableShell
        minWidthPx={1250}
        headerRow={headerRow}
        colSpan={9}
        emptyMessage="No agents found."
        setPage={setPage}
        totalPages={totalPages}
        currentPage={currentPage}
        totalCount={rows.length}
        entityLabel="agents"
      >
        {paged.map((a) => (
          <tr key={a.id} className="hover:bg-neutral-50/50 transition-colors group">
            <td className="pl-6 pr-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">{String(a.id).padStart(2, '0')}</span>
                <span className="text-neutral-400 text-[11px]">{a.time}</span>
              </div>
            </td>
            <td className="px-4 py-3 font-mono text-neutral-500">{a.cpid}</td>
            <td className="px-4 py-3 font-semibold text-neutral-900">{a.name}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span>{a.number}</span>
                <button
                  onClick={() => handleCopy(a.id, a.number)}
                  title="Copy number"
                  className="p-1 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                >
                  {copiedId === a.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${LOAN_AGENT_QUALITY_STYLES[a.agentStatus] || 'bg-neutral-100 text-neutral-600'}`}>
                {a.agentStatus}
              </span>
              <span className="text-neutral-400 text-[11px] ml-1.5">{relativeTime(a.agentStatusTime) || '—'}</span>
            </td>
            <td className="px-4 py-3 text-neutral-700">{a.kam}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${LOAN_AGENT_STATUS_STYLES[a.status] || 'bg-neutral-100 text-neutral-600'}`}>
                {a.status}
              </span>
              <span className="text-neutral-400 text-[11px] ml-1.5">{relativeTime(a.statusTime) || '—'}</span>
            </td>
            <td className="pl-4 pr-6 py-3">{a.source}</td>
            <td className="sticky right-0 bg-white group-hover:bg-neutral-50 text-center px-4 py-3 border-l border-l-neutral-300 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
              <button
                type="button"
                onClick={() => setSelectedAgent(a)}
                title="Open agent"
                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <MessageSquare size={16} />
              </button>
            </td>
          </tr>
        ))}
      </LoanTableShell>

      {selectedAgent && (
        <LoanAgentPanel
          agent={mockLoanAgents.find((a) => a.id === selectedAgent.id) || selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onUpdated={bump}
        />
      )}

      {addAgentOpen && <AddLoanAgentPanel onClose={() => setAddAgentOpen(false)} onCreated={bump} />}
    </div>
  );
};

export default LoanAgentsPage;
