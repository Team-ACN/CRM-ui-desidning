import React, { useState } from 'react';
import { X, Search, Plus, Users, User, FileText, Check, Copy, Upload } from 'lucide-react';
import LegalSearchSelect from '../shared/LegalSearchSelect';
import AgentIdentityCard from '../shared/AgentIdentityCard';
import SegmentedToggle from '../shared/SegmentedToggle';
import {
  addLeadRequest,
  addClient,
  addServiceToClient,
  getLegalDocRecord,
  setAgentLegalStatus,
  updateRequestStatus,
  KAM_OPTIONS,
  SERVICE_NAME_OPTIONS,
} from '../../data/mockLegalDoc';
import { findAgentByPhone } from '../../data/mockAgents';
import { findLeadByPhone, addLead } from '../../data/mockLeads';
import { digitsOf } from '../../utils/phone';

const LEGAL_LEAD_SOURCE = 'legal lead';
// The person manually adding leads through this panel — tagged as the main Leads directory's
// source for a lead created here, so it's distinguishable from 'direct'/'organic' intake there.
const MANUAL_ADD_SOURCE = 'Swarnim';

const inputCls =
  'w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-neutral-400 transition-all';
const labelCls = 'text-[12px] text-neutral-500 font-medium mb-1 block';

// "9845011287" -> "98450 11287" (matches the mask already used for client phone fields in
// AgentConnectPanel, so typing a number here feels the same everywhere in the app).
function maskPhoneInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

// "+919845011287" -> "+91 98450 11287" (same grouping AgentConnectPanel/LegalDocLeadsPage use).
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

// Pushes a resolved identity (an existing agent, an existing lead, or a brand-new one — created
// here if `matchedAgent`/`matchedLead` are both empty) into the Legal Doc pipeline as a Lead-stage
// request. Shared by the single-add flow (which pre-creates a new lead before this runs) and the
// bulk importer (which creates it inline, row by row).
function createLegalLead({ matchedAgent, matchedLead, name = '', digits, kam, source = MANUAL_ADD_SOURCE, services, clients }) {
  let recordId;
  let recordName;
  let recordContact;

  if (matchedAgent) {
    recordId = matchedAgent.agentId;
    recordName = matchedAgent.name;
    recordContact = matchedAgent.contact;
  } else if (matchedLead) {
    recordId = matchedLead.leadId;
    recordName = matchedLead.name && matchedLead.name !== '-' ? matchedLead.name : name.trim() || matchedLead.leadId;
    recordContact = matchedLead.contact;
  } else {
    const newLead = addLead({ name: name.trim(), contact: `+91${digits}`, kam, source });
    recordId = newLead.leadId;
    recordName = newLead.name;
    recordContact = newLead.contact;
  }

  // addLeadRequest always needs a serviceName to create the request's first service slot — when
  // nothing was actually picked, pass a placeholder and let the `services.length === 0` branch
  // below immediately clear it back out, leaving a real zero-service request.
  const firstServiceName = services[0]?.name || clients[0]?.services?.[0]?.name || SERVICE_NAME_OPTIONS[0].value;

  const req = addLeadRequest({
    agentId: recordId,
    agentName: recordName,
    contact: recordContact,
    kam,
    source: LEGAL_LEAD_SOURCE,
    serviceName: firstServiceName,
  });

  const primaryIdx = req.clients?.findIndex((c) => c.pocType === 'agent') ?? 0;
  if (services.length > 0) {
    if (services[0]?.qty > 1) req.clients[primaryIdx].services[0].qty = services[0].qty;
    for (let i = 1; i < services.length; i++) {
      const s = services[i];
      req.clients[primaryIdx].services.push({ name: s.name, qty: s.qty || 1, chargeableAmount: null, documents: [], status: 'negotiation' });
    }
  } else {
    req.clients[primaryIdx].services = [];
  }

  clients.forEach((c) => {
    if (!c.name?.trim() && (c.services || []).length === 0) return;
    const updated = addClient(recordId, req.id, { pocType: 'client', name: (c.name || '').trim(), phone: (c.phone || '').trim() });
    const newIdx = updated.clients.length - 1;
    (c.services || []).forEach((s) => {
      for (let q = 0; q < (s.qty || 1); q++) addServiceToClient(recordId, req.id, newIdx, s.name);
    });
  });

  return { recordId, recordName, requestId: req.id };
}

function emptyClient() {
  return { name: '', phone: '', services: [] };
}

// Mirrors the slide-in panel wrapper used by AgentConnectPanel/LeadConnectPanel exactly, so this
// opens and feels the same as every other side panel in the app. `stage` controls which Legal Doc
// stage a created request lands in — 'lead' (the default, used by the Leads page) or 'qualify'
// (used by the Qualify page, which pushes every created request straight past the lead stage).
const AddLegalLeadPanel = ({ onClose, onCreated, stage = 'lead' }) => {
  const isQualify = stage === 'qualify';
  const stageNounSingular = isQualify ? 'Qualified Lead' : 'Lead';
  const stageNounPlural = isQualify ? 'Qualified Leads' : 'Leads';
  const addCardLabel = isQualify ? 'Add Qualified Lead' : 'Add Legal Lead';

  const [mode, setMode] = useState('single');

  // --- Single-add state ---
  const [phone, setPhone] = useState('');
  const [newLeadName, setNewLeadName] = useState('');
  const [createdNewLead, setCreatedNewLead] = useState(null);
  const [, setRecordVersion] = useState(0);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [created, setCreated] = useState(false);

  const digits = digitsOf(phone);
  const matchedAgent = digits.length === 10 ? findAgentByPhone(phone) : null;
  const matchedLead = digits.length === 10 && !matchedAgent ? findLeadByPhone(phone) : null;
  const effectiveLead = matchedLead || createdNewLead;
  const kam = matchedAgent?.kam || effectiveLead?.kam || KAM_OPTIONS[0].value;
  const identityReady = digits.length === 10 && (!!matchedAgent || !!effectiveLead);
  const canSubmit = identityReady && !created;

  function handlePhoneChange(value) {
    setPhone(value);
    setCreatedNewLead(null);
  }

  function handleConfirmNewLead() {
    if (digits.length !== 10) return;
    const newLead = addLead({ name: newLeadName.trim(), contact: `+91${digits}`, kam, source: MANUAL_ADD_SOURCE });
    setCreatedNewLead(newLead);
  }

  const agentRecord = matchedAgent ? getLegalDocRecord(matchedAgent.agentId) : null;
  const agentNotes = (agentRecord?.legalAndLoan?.notes || []).filter((n) => n.text);
  const latestAgentNote = agentNotes.length ? agentNotes[agentNotes.length - 1] : null;

  function handleUpdateAgentStatus(newStatus, noteText) {
    if (!matchedAgent) return;
    setAgentLegalStatus(
      matchedAgent.agentId,
      { agentName: matchedAgent.name, contact: matchedAgent.contact, kam: matchedAgent.kam },
      newStatus,
      kam,
      noteText
    );
    setRecordVersion((v) => v + 1);
  }

  function handleAddService(serviceName) {
    setServices((prev) => {
      const exists = prev.find((s) => s.name === serviceName);
      if (exists) return prev.map((s) => (s.name === serviceName ? { ...s, qty: s.qty + 1 } : s));
      return [...prev, { name: serviceName, qty: 1 }];
    });
  }
  function handleIncrementService(serviceName) {
    setServices((prev) => prev.map((s) => (s.name === serviceName ? { ...s, qty: s.qty + 1 } : s)));
  }
  function handleDecrementService(serviceName) {
    setServices((prev) => prev.map((s) => (s.name === serviceName ? { ...s, qty: s.qty - 1 } : s)).filter((s) => s.qty > 0));
  }

  function updateClientField(idx, field, value) {
    setClients((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  }
  function removeClient(idx) {
    setClients((prev) => prev.filter((_, i) => i !== idx));
  }
  function handleAddClientService(idx, serviceName) {
    setClients((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        const exists = (c.services || []).find((s) => s.name === serviceName);
        const next = exists
          ? c.services.map((s) => (s.name === serviceName ? { ...s, qty: s.qty + 1 } : s))
          : [...(c.services || []), { name: serviceName, qty: 1 }];
        return { ...c, services: next };
      })
    );
  }
  function handleIncrementClientService(idx, serviceName) {
    setClients((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, services: c.services.map((s) => (s.name === serviceName ? { ...s, qty: s.qty + 1 } : s)) } : c))
    );
  }
  function handleDecrementClientService(idx, serviceName) {
    setClients((prev) =>
      prev.map((c, i) =>
        i === idx ? { ...c, services: c.services.map((s) => (s.name === serviceName ? { ...s, qty: s.qty - 1 } : s)).filter((s) => s.qty > 0) } : c
      )
    );
  }

  function handleAddLegalLead() {
    if (!canSubmit) return;
    const result = createLegalLead({ matchedAgent, matchedLead: effectiveLead, kam, services, clients });
    if (isQualify && result) {
      updateRequestStatus(result.recordId, result.requestId, 'qualify', { notes: 'Added directly as a qualified lead', user: kam });
    }
    setCreated(true);
    onCreated?.();
    setTimeout(() => onClose?.(), 900);
  }

  // --- Multiple (bulk) state ---
  const [bulkText, setBulkText] = useState('');
  const [previewRows, setPreviewRows] = useState(null);
  const [copied, setCopied] = useState(false);

  function handleCopyTemplate() {
    // One example row per outcome — matches an existing agent, matches an existing lead, and a
    // fresh number that creates a brand-new lead — so pasting this straight back in shows all
    // three behaviors right away.
    const template = [
      'Mobile Number\tName\tService\tSource',
      '9845019980\tRamesh Gowda\tEC\tMarketing',
      '9999999993\tDB Lead\tRegistration, EC\tReferral',
      '9123456780\tNew Example Lead\tEC\tWebsite',
    ].join('\n');
    navigator.clipboard?.writeText(template).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBulkText(String(reader.result || ''));
    reader.readAsText(file);
    e.target.value = '';
  }

  function parseBulkText(text) {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return [];
    let rows = lines.map((line) => (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.trim()));
    if (rows[0][0]?.toLowerCase().includes('mobile')) rows = rows.slice(1);
    return rows.map((cols) => ({ phone: cols[0] || '', name: cols[1] || '', service: cols[2] || '', source: cols[3] || '' }));
  }

  function evaluateRow(row) {
    const rowDigits = digitsOf(row.phone);
    if (rowDigits.length !== 10) return { ...row, status: 'error', message: 'Invalid phone number' };

    const serviceNames = row.service
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const serviceValues = [];
    for (const name of serviceNames) {
      const option = SERVICE_NAME_OPTIONS.find((o) => o.label.toLowerCase() === name.toLowerCase() || o.value === name);
      if (!option) return { ...row, status: 'error', message: `Unknown service "${name}"` };
      serviceValues.push(option.value);
    }
    if (serviceValues.length === 0) return { ...row, status: 'error', message: 'No service given' };

    const agent = findAgentByPhone(row.phone);
    const lead = !agent ? findLeadByPhone(row.phone) : null;
    const kamValue = agent?.kam || lead?.kam || KAM_OPTIONS[0].value;

    return {
      ...row,
      digits: rowDigits,
      serviceValues,
      kamValue,
      matchedAgent: agent,
      matchedLead: lead,
      status: agent ? 'agent' : lead ? 'lead' : 'new',
    };
  }

  function handlePreview() {
    const rows = parseBulkText(bulkText).map(evaluateRow);
    setPreviewRows(rows);
  }

  function handleImportAll() {
    if (!previewRows) return;
    const valid = previewRows.filter((r) => r.status !== 'error');
    valid.forEach((row) => {
      const result = createLegalLead({
        matchedAgent: row.matchedAgent,
        matchedLead: row.matchedLead,
        name: row.name,
        digits: row.digits,
        kam: row.kamValue,
        source: row.source.trim() || undefined,
        services: row.serviceValues.map((name) => ({ name, qty: 1 })),
        clients: [],
      });
      if (isQualify && result) {
        updateRequestStatus(result.recordId, result.requestId, 'qualify', { notes: 'Added directly as a qualified lead', user: row.kamValue });
      }
    });
    onCreated?.();
    onClose?.();
  }

  const statusChipCls = {
    agent: 'bg-blue-50 text-blue-700',
    lead: 'bg-neutral-200 text-neutral-700',
    new: 'bg-emerald-50 text-emerald-700',
    error: 'bg-red-50 text-red-700',
  };
  function statusChipText(r) {
    if (r.status === 'agent') return `Agent · ${r.matchedAgent.agentId}`;
    if (r.status === 'lead') return `Lead · ${r.matchedLead.leadId}`;
    if (r.status === 'new') return 'New';
    return 'Error';
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-white h-full w-2/5 min-w-[460px] shadow-2xl flex flex-col [&_button]:focus:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-neutral-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 h-16 flex items-center justify-between px-4 bg-white border-b border-neutral-100">
          <h2 className="text-[16px] font-bold text-neutral-900">Add {stageNounSingular}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {digits.length === 0 && (
            <SegmentedToggle
              options={[
                { value: 'single', label: 'Single' },
                { value: 'multiple', label: 'Multiple' },
              ]}
              value={mode}
              onChange={setMode}
              ariaLabel="Add mode"
            />
          )}

          {mode === 'single' ? (
            <>
              {!identityReady && (
                <div>
                  <label className={labelCls}>Mobile Number</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => handlePhoneChange(maskPhoneInput(e.target.value))}
                      placeholder="98450 11287"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>
              )}

              {digits.length === 10 && !matchedAgent && !effectiveLead && (
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input
                      type="text"
                      value={newLeadName}
                      onChange={(e) => setNewLeadName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirmNewLead()}
                      placeholder="Lead's name"
                      className={inputCls}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmNewLead}
                    className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-[13px] font-medium transition-colors"
                  >
                    Add New Lead
                  </button>
                </div>
              )}

              {identityReady && (
                <button
                  type="button"
                  onClick={() => handlePhoneChange('')}
                  className="text-[12px] text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  Change number
                </button>
              )}

              {digits.length === 10 && matchedAgent && (
                <AgentIdentityCard
                  name={matchedAgent.name}
                  agentId={matchedAgent.agentId}
                  contact={formatPhone(matchedAgent.contact)}
                  kam={matchedAgent.kam}
                  status={agentRecord?.legalAndLoan?.status || 'maybe'}
                  onUpdateStatus={handleUpdateAgentStatus}
                >
                  {latestAgentNote && (
                    <div className="pt-3 border-t border-neutral-100">
                      <p className="text-neutral-500 text-[13px]">{latestAgentNote.text}</p>
                      <span className="text-neutral-400 text-[11px]">
                        {relativeTime(latestAgentNote.time) || '—'} by {latestAgentNote.user || '—'}
                      </span>
                    </div>
                  )}
                </AgentIdentityCard>
              )}

              {digits.length === 10 && !matchedAgent && effectiveLead && (
                <AgentIdentityCard
                  name={effectiveLead.name !== '-' ? effectiveLead.name : effectiveLead.leadId}
                  agentId={effectiveLead.leadId}
                  contact={formatPhone(effectiveLead.contact)}
                  kam={effectiveLead.kam}
                />
              )}

              {identityReady && (
                <div className="border border-neutral-200 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-neutral-900">
                    <FileText size={14} className="text-neutral-400" />
                    <span>{addCardLabel}</span>
                  </div>

                  <div className="border border-neutral-200 rounded-2xl bg-white p-4">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-600 mb-2">
                      <User size={13} className="text-neutral-400" />
                      <span>Agent</span>
                    </div>
                    <LegalSearchSelect
                      items={services}
                      onAdd={handleAddService}
                      onIncrement={handleIncrementService}
                      onDecrement={handleDecrementService}
                      placeholder="Add legal requirement..."
                    />
                  </div>

                  <div className="space-y-3">
                    {clients.map((c, i) => (
                      <div key={i} className="border border-neutral-200 rounded-2xl bg-white p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-600">
                            <Users size={13} className="text-neutral-400" />
                            <span>Client {i + 1}</span>
                          </div>
                          <button type="button" onClick={() => removeClient(i)} className="p-1 text-neutral-300 hover:text-neutral-600 rounded transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Client name"
                            value={c.name}
                            onChange={(e) => updateClientField(i, 'name', e.target.value)}
                            className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 outline-none transition-all"
                          />
                          <input
                            type="text"
                            placeholder="Phone number"
                            value={c.phone}
                            onChange={(e) => updateClientField(i, 'phone', maskPhoneInput(e.target.value))}
                            className="w-full bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 outline-none transition-all"
                          />
                        </div>
                        <LegalSearchSelect
                          items={c.services || []}
                          onAdd={(sName) => handleAddClientService(i, sName)}
                          onIncrement={(sName) => handleIncrementClientService(i, sName)}
                          onDecrement={(sName) => handleDecrementClientService(i, sName)}
                          placeholder={`+ Add legal for ${c.name || 'client'}...`}
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setClients((prev) => [...prev, emptyClient()])}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-800 text-[13px] w-full justify-center transition-colors"
                    >
                      <Plus size={13} /> Add client
                    </button>
                  </div>

                  <div className="pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handleAddLegalLead}
                      disabled={!canSubmit}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                    >
                      {created ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span>{stageNounSingular} Added</span>
                        </>
                      ) : (
                        <span>{addCardLabel}</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="border border-neutral-200 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[13px] font-medium transition-colors"
                >
                  {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy sheet format'}
                </button>
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-[13px] font-medium transition-colors cursor-pointer">
                  <Upload size={13} />
                  Upload CSV
                  <input type="file" accept=".csv,text/csv,text/plain" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div>
                <label className={labelCls}>Mobile Number, Name, Service, Source</label>
                <textarea
                  value={bulkText}
                  onChange={(e) => {
                    setBulkText(e.target.value);
                    setPreviewRows(null);
                  }}
                  placeholder={'9845011287\tRamesh Gowda\tE-Khata (BBMP), EC\tMarketing'}
                  rows={6}
                  className={`${inputCls} font-mono text-[12px]`}
                />
              </div>

              <button
                type="button"
                onClick={handlePreview}
                disabled={!bulkText.trim()}
                className="w-full py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 rounded-xl font-medium text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Preview
              </button>

              {previewRows && (
                <div className="space-y-3">
                  <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                    {previewRows.map((r, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 px-3 py-2 text-[12px]">
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-900 truncate">
                            {r.phone} {r.name && `· ${r.name}`}
                          </p>
                          {r.status === 'error' && <p className="text-red-500 truncate">{r.message}</p>}
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusChipCls[r.status]}`}>
                          {statusChipText(r)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleImportAll}
                    disabled={previewRows.every((r) => r.status === 'error')}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Add {previewRows.filter((r) => r.status !== 'error').length} {stageNounPlural}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddLegalLeadPanel;
