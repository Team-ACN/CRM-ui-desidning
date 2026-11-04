import React, { useState } from 'react';
import { Copy, Check, MessageSquare } from 'lucide-react';
import {
  mockLoanCases,
  LOAN_CASE_STAGE_STYLES,
  LOAN_CASE_STAGE_OPTIONS,
  LOAN_REFERRAL_SOURCE_OPTIONS,
  LOAN_REFERRAL_SOURCE_STYLES,
} from '../../data/mockLoan';
import LoanPageHeader from './LoanPageHeader';
import LoanSearchFilterBar from './LoanSearchFilterBar';
import LoanTableShell from './LoanTableShell';
import LoanCasePanel from './LoanCasePanel';

const PAGE_SIZE = 20;

// "4500000" -> "₹45.00 L", "12500000" -> "₹1.25 Cr" — Indian lakh/crore shorthand.
function formatCurrency(amount) {
  if (!amount) return '—';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  return `₹${(amount / 100000).toFixed(2)} L`;
}

function relativeTime(ts) {
  if (!ts) return null;
  const diffDays = Math.floor((Date.now() - ts) / 86400000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}

// Match the connection outcome labels & colors used on the Lead and Agent pages.
function connectionMeta(value) {
  if (value === 'connected') return { label: 'Connected', cls: 'bg-emerald-100 text-emerald-700' };
  if (value === 'call back') return { label: 'Call Back', cls: 'bg-amber-100 text-amber-700' };
  if (typeof value === 'string' && value.startsWith('rnr')) {
    return { label: `RNR ${value.replace('rnr', '')}`, cls: 'bg-red-100 text-red-700' };
  }
  return null;
}

const LoanCasesPage = () => {
  const [, setVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState([]);
  const [referralSourceFilter, setReferralSourceFilter] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedCase, setSelectedCase] = useState(null);

  const bump = () => setVersion((v) => v + 1);

  function handleCopy(id, value) {
    if (!value || value === '—') return;
    navigator.clipboard?.writeText(value).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((k) => (k === id ? null : k)), 1500);
    });
  }

  const matchesSearch = (c) =>
    `${c.caseId} ${c.leadName} ${c.leadNumber} ${c.project} ${c.bankName || ''} ${c.lan || ''} ${c.referralName || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());

  const matchesStage = (c) => stageFilter.length === 0 || stageFilter.includes(c.stage);
  const matchesReferralSource = (c) => referralSourceFilter.length === 0 || referralSourceFilter.includes(c.referralSource);

  // Each dimension's counts reflect the other active filters (cross-filter counting).
  function countOptions(dim, values, getValue) {
    return values.map((v) => ({
      value: v,
      label: v,
      count: mockLoanCases.filter(
        (c) =>
          matchesSearch(c) &&
          (dim === 'stage' || matchesStage(c)) &&
          (dim === 'referralSource' || matchesReferralSource(c)) &&
          getValue(c) === v
      ).length,
    }));
  }

  const rows = mockLoanCases.filter((c) => matchesSearch(c) && matchesStage(c) && matchesReferralSource(c));

  // Reset to page 1 whenever the filter/search set changes.
  const filterKey = JSON.stringify([search, stageFilter, referralSourceFilter]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const filters = [
    {
      key: 'stage',
      label: 'Stage',
      allLabel: 'All Stages',
      value: stageFilter,
      onChange: setStageFilter,
      options: countOptions('stage', LOAN_CASE_STAGE_OPTIONS, (c) => c.stage),
    },
    {
      key: 'referralSource',
      label: 'Source',
      allLabel: 'All Sources',
      value: referralSourceFilter,
      onChange: setReferralSourceFilter,
      options: countOptions('referralSource', LOAN_REFERRAL_SOURCE_OPTIONS, (c) => c.referralSource),
    },
  ];

  const headerRow = (
    <tr>
      <th className="pl-6 pr-4 py-4 whitespace-nowrap">Case ID</th>
      <th className="px-4 py-4 whitespace-nowrap">Lead Name</th>
      <th className="px-4 py-4 whitespace-nowrap">Lead Number</th>
      <th className="px-4 py-4 whitespace-nowrap">Stage</th>
      <th className="px-4 py-4 whitespace-nowrap">Connection</th>
      <th className="px-4 py-4 whitespace-nowrap">Project</th>
      <th className="px-4 py-4 whitespace-nowrap">Bank Name</th>
      <th className="px-4 py-4 whitespace-nowrap">LAN</th>
      <th className="px-4 py-4 whitespace-nowrap">Sanctioned</th>
      <th className="px-4 py-4 whitespace-nowrap">Disbursed</th>
      <th className="px-4 py-4 whitespace-nowrap">Source</th>
      <th className="pl-4 pr-2 py-4 whitespace-nowrap">Referrer</th>
      <th className="pl-2 pr-6 py-4 whitespace-nowrap">Referrer Mobile</th>
      <th className="sticky right-0 z-10 bg-white px-4 py-4 text-center border-l border-neutral-300 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
        <MessageSquare size={13} className="inline text-neutral-300" />
      </th>
    </tr>
  );

  return (
    <div className="flex flex-col bg-neutral-50 h-full text-[13px]">
      <LoanPageHeader title="Cases" countLabel={`${rows.length} Cases`} />

      <LoanSearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search case ID, lead, project, bank or LAN..."
        filters={filters}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
      />

      <LoanTableShell
        minWidthPx={2100}
        headerRow={headerRow}
        colSpan={14}
        emptyMessage="No cases found."
        setPage={setPage}
        totalPages={totalPages}
        currentPage={currentPage}
        totalCount={rows.length}
        entityLabel="cases"
      >
        {paged.map((c) => {
          const connStatus = c.lastConnection?.status || c.connection;
          const connTime = c.lastConnection?.time || c.connectionTime;
          const connMeta = connectionMeta(connStatus);

          return (
            <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors group">
              {/* 1. Case ID + Date/Time */}
              <td className="pl-6 pr-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                    {c.caseId}
                  </span>
                  <span className="text-neutral-400 text-[11px]">{c.date}</span>
                </div>
              </td>

              {/* 2. Lead Name */}
              <td className="px-4 py-3 font-semibold text-neutral-900 whitespace-nowrap">
                {c.leadName}
              </td>

              {/* 3. Lead Number with copy button */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span>{c.leadNumber}</span>
                  <button
                    onClick={() => handleCopy(c.id, c.leadNumber)}
                    title="Copy number"
                    className="p-1 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 rounded transition-colors"
                  >
                    {copiedId === c.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              </td>

              {/* 4. Stage badge + relative time */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    LOAN_CASE_STAGE_STYLES[c.stage] || 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {c.stage}
                </span>
                <span className="text-neutral-400 text-[11px] ml-1.5">{relativeTime(c.stageTime) || '—'}</span>
              </td>

              {/* 5. Connection + Time (matching Lead page) */}
              <td className="px-4 py-3 whitespace-nowrap">
                {connMeta ? (
                  <>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${connMeta.cls}`}>
                      {connMeta.label}
                    </span>
                    <span className="text-neutral-400 text-[11px] ml-1.5">{relativeTime(connTime) || '—'}</span>
                  </>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </td>

              {/* 6. Project Name */}
              <td className="px-4 py-3 whitespace-nowrap text-neutral-800">{c.project}</td>

              {/* 7. Bank Name */}
              <td className="px-4 py-3 whitespace-nowrap text-neutral-800">{c.bankName}</td>

              {/* 9. LAN */}
              <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-neutral-500">
                {c.lan || '—'}
              </td>

              {/* 10. Sanctioned Amount */}
              <td className="px-4 py-3 whitespace-nowrap font-medium text-neutral-900">
                {formatCurrency(c.sanctionedAmount)}
              </td>

              {/* 11. Disbursed Amount */}
              <td className="px-4 py-3 whitespace-nowrap font-medium text-neutral-900">
                {formatCurrency(c.disbursedAmount)}
              </td>

              {/* 12. Source */}
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                    LOAN_REFERRAL_SOURCE_STYLES[c.referralSource] ||
                    'bg-neutral-50 text-neutral-600 border border-neutral-200'
                  }`}
                >
                  {c.referralSource}
                </span>
              </td>

              {/* 13. Referrer */}
              <td className="pl-4 pr-2 py-3 whitespace-nowrap text-neutral-800">
                {c.referralName || '—'}
              </td>

              {/* 14. Referrer Mobile */}
              <td className="pl-2 pr-6 py-3 whitespace-nowrap text-neutral-400">
                {c.referralNumber || '—'}
              </td>

              {/* 15. Sticky right message icon button to open sidebar */}
              <td className="sticky right-0 bg-white group-hover:bg-neutral-50 text-center px-4 py-3 border-l border-l-neutral-300 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
                <button
                  type="button"
                  onClick={() => setSelectedCase(c)}
                  title="Open case details"
                  className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <MessageSquare size={16} />
                </button>
              </td>
            </tr>
          );
        })}
      </LoanTableShell>

      {selectedCase && (
        <LoanCasePanel
          loanCase={mockLoanCases.find((c) => c.id === selectedCase.id) || selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdated={bump}
        />
      )}
    </div>
  );
};

export default LoanCasesPage;
