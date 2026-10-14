import React, { useState } from 'react';
import { Plus, Users, User, X, Check } from 'lucide-react';
import LegalSearchSelect from './LegalSearchSelect';
import {
  getLegalDocRecord,
  addClient,
  updateClient,
  removeClient,
  addServiceToClient,
  removeServiceFromClient,
  updateRequestStatus,
  currentStatus,
} from '../../data/mockLegalDoc';

// Live-masks a phone input as it's typed: digits only, capped at 10, 5-5 grouped.
function maskPhoneInput(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

// Agent-services box + per-client boxes (always editable, no edit-mode toggle) + add-client
// flow + a "Qualify the Lead" CTA — all driven off an EXISTING request (agentId + requestId).
// Shared by the Agent Connect panel and the Legal Doc Leads page side panel so a lead's legal
// requirements look and behave identically no matter where they're opened from.
const LegalLeadSection = ({ agentId, requestId, kam = '—', onQualified, onDrop, showQualifyButton = true }) => {
  const [, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientServices, setNewClientServices] = useState([]);
  const [qualified, setQualified] = useState(false);

  const record = getLegalDocRecord(agentId);
  const request = record?.legalAndLoan?.legalRequests?.find((r) => r.id === requestId);

  if (!request) return null;

  const agentIdx = request.clients.findIndex((c) => c.pocType === 'agent');
  const agentClient = agentIdx !== -1 ? request.clients[agentIdx] : null;
  const otherClients = request.clients
    .map((c, idx) => ({ ...c, originalIndex: idx }))
    .filter((c) => c.pocType === 'client');

  const agentServicesCount = (agentClient?.services || []).reduce((sum, s) => sum + (s.qty || 1), 0);
  const clientServicesCount = otherClients.reduce(
    (sum, c) => sum + (c.services || []).reduce((sAcc, s) => sAcc + (s.qty || 1), 0),
    0
  );
  const totalRequirementsCount = agentServicesCount + clientServicesCount;
  const isLeadStage = currentStatus(request) === 'lead';

  const handleAddAgentService = (name) => {
    addServiceToClient(agentId, requestId, agentIdx !== -1 ? agentIdx : 0, name);
    bump();
  };

  const handleDecrementAgentService = (name) => {
    removeServiceFromClient(agentId, requestId, agentIdx !== -1 ? agentIdx : 0, name);
    bump();
  };

  const handleConfirmAddClient = () => {
    if (!newClientName.trim()) return;
    const updated = addClient(agentId, requestId, {
      pocType: 'client',
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
    });
    if (updated && newClientServices.length > 0) {
      const newIdx = updated.clients.length - 1;
      newClientServices.forEach((s) => {
        for (let q = 0; q < (s.qty || 1); q++) addServiceToClient(agentId, requestId, newIdx, s.name);
      });
    }
    setNewClientName('');
    setNewClientPhone('');
    setNewClientServices([]);
    bump();
  };

  const applyClientEdit = (clientIdx, patch) => {
    updateClient(agentId, requestId, clientIdx, patch);
    bump();
  };

  const handleRemoveClient = (clientIdx) => {
    removeClient(agentId, requestId, clientIdx);
    bump();
  };

  const handleAddClientService = (clientIdx, name) => {
    addServiceToClient(agentId, requestId, clientIdx, name);
    bump();
  };

  const handleDecrementClientService = (clientIdx, name) => {
    removeServiceFromClient(agentId, requestId, clientIdx, name);
    bump();
  };

  const handleQualify = () => {
    // If a client was typed in without clicking '+ Add client', commit it first.
    if (newClientName.trim()) handleConfirmAddClient();
    updateRequestStatus(agentId, requestId, 'qualify', { notes: 'Qualified', user: kam });
    setIsAddingClient(false);
    bump();
    setQualified(true);
    onQualified && onQualified();
    setTimeout(() => setQualified(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Agent */}
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
          items={(agentClient?.services || []).map((s) => ({ name: s.name, qty: s.qty || 1 }))}
          onAdd={handleAddAgentService}
          onIncrement={handleAddAgentService}
          onDecrement={handleDecrementAgentService}
          placeholder="+ Add another legal service..."
        />
      </div>

      {/* Clients */}
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
                    onIncrement={(sName) => handleAddClientService(c.originalIndex, sName)}
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
              onIncrement={(sName) =>
                setNewClientServices((prev) => prev.map((s) => (s.name === sName ? { ...s, qty: s.qty + 1 } : s)))
              }
              onDecrement={(sName) =>
                setNewClientServices((prev) =>
                  prev.map((s) => (s.name === sName ? { ...s, qty: s.qty - 1 } : s)).filter((s) => s.qty > 0)
                )
              }
              placeholder="Search legal needs for this client..."
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            // If a client is already being typed in, save it first — otherwise this click
            // would wipe that unsaved draft instead of starting a new one.
            if (newClientName.trim()) handleConfirmAddClient();
            setIsAddingClient(true);
          }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-800 text-[13px] w-full justify-center transition-colors"
        >
          <Plus size={13} /> Add client
        </button>
      </div>

      {showQualifyButton && isLeadStage && (
        <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
          <button
            type="button"
            onClick={handleQualify}
            disabled={totalRequirementsCount === 0}
            className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
          >
            {qualified ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>Lead Qualified</span>
              </>
            ) : (
              <span>Qualify the Lead</span>
            )}
          </button>
          {onDrop && (
            <button
              type="button"
              onClick={onDrop}
              className="flex-1 py-2.5 border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 rounded-xl font-medium text-[13px] transition-colors"
            >
              Drop Lead
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LegalLeadSection;
