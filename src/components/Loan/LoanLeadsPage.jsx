import React, { useState } from 'react';
import { Copy, Check, Plus, MessageSquare } from 'lucide-react';
import {
  mockLoanLeads,
  LOAN_LEAD_STATUS_STYLES,
  LOAN_LEAD_STATUS_OPTIONS,
  LOAN_REFERRAL_SOURCE_OPTIONS,
  LOAN_REFERRAL_SOURCE_STYLES,
  LOAN_KAM_OPTIONS,
  setLoanLeadKam,
} from '../../data/mockLoan';
import LoanPageHeader from './LoanPageHeader';
import LoanSearchFilterBar from './LoanSearchFilterBar';
import LoanTableShell from './LoanTableShell';
import AddLoanLeadPanel from './AddLoanLeadPanel';
import LoanLeadPanel from './LoanLeadPanel';
import LoanInlineKamSelect from './LoanInlineKamSelect';

const PAGE_SIZE = 20;

function relativeTime(ts) {
  if (!ts) return null;
  const diffDays = Math.floor((Date.now() - ts) / 86400000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}

// Same outcome labels/colors the Agent & Lead Connect panels use for a logged connect.
function connectionMeta(value) {
  if (value === 'connected') return { label: 'Connected', cls: 'bg-emerald-100 text-emerald-700' };
  if (value === 'call back') return { label: 'Call Back', cls: 'bg-amber-100 text-amber-700' };
  if (typeof value === 'string' && value.startsWith('rnr')) {
    return { label: `RNR ${value.replace('rnr', '')}`, cls: 'bg-red-100 text-red-700' };
  }
  return null;
}

const LoanLeadsPage = () => {
  const [, setVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [referralSourceFilter, setReferralSourceFilter] = useState([]);
  const [kamFilter, setKamFilter] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);

  const bump = () => setVersion((v) => v + 1);

  function handleCopy(id, value) {
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((k) => (k === id ? null : k)), 1500);
    });
  }

  function handleKamChange(id, kam) {
    setLoanLeadKam(id, kam);
    bump();
  }

  const matchesSearch = (l) => `${l.leadId} ${l.name} ${l.number}`.toLowerCase().includes(search.toLowerCase());
  const matchesStatus = (l) => statusFilter.length === 0 || statusFilter.includes(l.status);
  const matchesReferralSource = (l) => referralSourceFilter.length === 0 || referralSourceFilter.includes(l.referralSource);
  const matchesKam = (l) => kamFilter.length === 0 || kamFilter.includes(l.kam);

  // Each dimension's counts reflect the other active filters (but not its own), same cross-filter
  // counting the Legal Doc pages use.
  function countOptions(dim, values, getValue) {
    return values.map((v) => ({
      value: v,
      label: v,
      count: mockLoanLeads.filter(
        (l) =>
          matchesSearch(l) &&
          (dim === 'status' || matchesStatus(l)) &&
          (dim === 'referralSource' || matchesReferralSource(l)) &&
          (dim === 'kam' || matchesKam(l)) &&
          getValue(l) === v
      ).length,
    }));
  }

  const rows = mockLoanLeads.filter((l) => matchesSearch(l) && matchesStatus(l) && matchesReferralSource(l) && matchesKam(l));

  // Reset to page 1 whenever the filter/search set changes, same pattern the Agents page uses.
  const filterKey = JSON.stringify([search, statusFilter, referralSourceFilter, kamFilter]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const filters = [
    { key: 'status', label: 'Status', allLabel: 'All Status', value: statusFilter, onChange: setStatusFilter, options: countOptions('status', LOAN_LEAD_STATUS_OPTIONS, (l) => l.status) },
    {
      key: 'referralSource',
      label: 'Source',
      allLabel: 'All Sources',
      value: referralSourceFilter,
      onChange: setReferralSourceFilter,
      options: countOptions('referralSource', LOAN_REFERRAL_SOURCE_OPTIONS, (l) => l.referralSource),
    },
    { key: 'kam', label: 'KAM', allLabel: 'All KAMs', value: kamFilter, onChange: setKamFilter, options: countOptions('kam', LOAN_KAM_OPTIONS, (l) => l.kam) },
  ];

  const headerRow = (
    <tr>
      <th className="pl-6 pr-4 py-4">Lead ID</th>
      <th className="px-4 py-4">Name</th>
      <th className="px-4 py-4">Number</th>
      <th className="px-4 py-4">Status</th>
      <th className="px-4 py-4">KAM</th>
      <th className="px-4 py-4">Connection</th>
      <th className="px-4 py-4">Source</th>
      <th className="pl-4 pr-2 py-4">Referrer</th>
      <th className="pl-2 pr-6 py-4">Referrer Mobile</th>
      <th className="sticky right-0 z-10 bg-white px-4 py-4 text-center border-l border-neutral-300 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
        <MessageSquare size={13} className="inline text-neutral-300" />
      </th>
    </tr>
  );

  return (
    <div className="flex flex-col bg-neutral-50 h-full text-[13px]">
      <LoanPageHeader title="Leads" countLabel={`${rows.length} Leads`} actionLabel="Add Lead" ActionIcon={Plus} onAction={() => setAddLeadOpen(true)} />

      <LoanSearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search lead ID, name or number..."
        filters={filters}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
      />

      <LoanTableShell
        minWidthPx={1950}
        headerRow={headerRow}
        colSpan={11}
        emptyMessage="No leads found."
        setPage={setPage}
        totalPages={totalPages}
        currentPage={currentPage}
        totalCount={rows.length}
        entityLabel="leads"
      >
        {paged.map((l) => {
          const connMeta = connectionMeta(l.lastConnection?.status);
          return (
            <tr key={l.id} className="hover:bg-neutral-50/50 transition-colors group">
              <td className="pl-6 pr-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">{l.leadId}</span>
                  <span className="text-neutral-400 text-[11px]">{l.date}</span>
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-neutral-900">{l.name}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span>{l.number}</span>
                  <button
                    onClick={() => handleCopy(l.id, l.number)}
                    title="Copy number"
                    className="p-1 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                  >
                    {copiedId === l.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${LOAN_LEAD_STATUS_STYLES[l.status] || 'bg-neutral-100 text-neutral-600'}`}>
                  {l.status}
                </span>
                <span className="text-neutral-400 text-[11px] ml-1.5">{relativeTime(l.statusTime) || '—'}</span>
              </td>
              <td className="px-4 py-3">
                <LoanInlineKamSelect value={l.kam} options={LOAN_KAM_OPTIONS} onChange={(kam) => handleKamChange(l.id, kam)} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {connMeta ? (
                  <>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${connMeta.cls}`}>{connMeta.label}</span>
                    <span className="text-neutral-400 text-[11px] ml-1.5">{relativeTime(l.lastConnection.time) || '—'}</span>
                  </>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${LOAN_REFERRAL_SOURCE_STYLES[l.referralSource] || 'bg-neutral-50 text-neutral-600 border border-neutral-200'}`}
                >
                  {l.referralSource}
                </span>
              </td>
              <td className="pl-4 pr-2 py-3">{l.referralName}</td>
              <td className="pl-2 pr-6 py-3 text-neutral-400">{l.referralNumber}</td>
              <td className="sticky right-0 bg-white group-hover:bg-neutral-50 text-center px-4 py-3 border-l border-l-neutral-300 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
                <button
                  type="button"
                  onClick={() => setSelectedLead(l)}
                  title="Open lead"
                  className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <MessageSquare size={16} />
                </button>
              </td>
            </tr>
          );
        })}
      </LoanTableShell>

      {selectedLead && (
        <LoanLeadPanel
          lead={mockLoanLeads.find((l) => l.id === selectedLead.id) || selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdated={bump}
        />
      )}

      {addLeadOpen && <AddLoanLeadPanel onClose={() => setAddLeadOpen(false)} onCreated={bump} />}
    </div>
  );
};

export default LoanLeadsPage;
