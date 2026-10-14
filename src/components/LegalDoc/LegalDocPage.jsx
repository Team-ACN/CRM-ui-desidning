import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Phone, CheckCircle2, Circle } from 'lucide-react';
import {
  getLegalDocRecord,
  AGENT_STATUS_OPTIONS,
  SERVICE_STATUS_OPTIONS,
  CONNECTION_STATUS_OPTIONS,
  SERVICE_NAME_OPTIONS,
  REQUEST_STATUS_OPTIONS,
  POC_TYPE_OPTIONS,
  currentStatus,
  optionLabel,
} from '../../data/mockLegalDoc';

const serviceLabel = (name) =>
  SERVICE_NAME_OPTIONS.find((s) => s.value === name)?.label || name;

function clientLabel(client) {
  if (client.pocType === 'agent') return 'Agent (self)';
  return client.name || 'Unnamed client';
}

const LegalDocPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = getLegalDocRecord(id);

  if (!record) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/legal-doc')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={16} /> Back to Legal & Doc
        </button>
        <p className="text-gray-500">No record found for agent "{id}".</p>
      </div>
    );
  }

  const { legalAndLoan, agentName } = record;

  return (
    <div className="pb-8 bg-gray-50 min-h-screen">
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/legal-doc')}
          className="text-gray-400 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="text-xs text-gray-400">Legal & Doc / {id}</div>
          <h1 className="text-lg font-bold text-gray-900">{agentName}</h1>
        </div>
        <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {optionLabel(AGENT_STATUS_OPTIONS, legalAndLoan.status)}
        </span>
      </header>

      <div className="px-6 mt-6 space-y-6">
        {/* Notes — each can optionally tag a good/maybe/bad status change */}
        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Notes</h2>
          <div className="space-y-2">
            {(legalAndLoan.notes || []).map((n, i) => (
              <div key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 text-xs whitespace-nowrap mt-0.5">
                  {n.time ? new Date(n.time).toLocaleDateString() : '—'}
                </span>
                {n.status && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                    {optionLabel(AGENT_STATUS_OPTIONS, n.status)}
                  </span>
                )}
                <span>{n.text}</span>
                <span className="ml-auto text-xs text-gray-400">{n.user}</span>
              </div>
            ))}
            {(legalAndLoan.notes || []).length === 0 && (
              <p className="text-sm text-gray-400">No notes yet.</p>
            )}
          </div>
        </section>

        {/* Requests */}
        {(legalAndLoan.legalRequests || []).map((req) => (
          <section key={req.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Request {req.id}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {optionLabel(REQUEST_STATUS_OPTIONS, currentStatus(req))}
              </span>
              <span className="text-xs text-gray-400">source: {req.source}</span>
              <span className="ml-auto text-xs text-gray-400">
                lead by {req.leadBy || '—'}
                {req.qualifiedBy && <> · qualified by {req.qualifiedBy}</>}
                {req.salesPoc && <> · sales POC {req.salesPoc}</>}
              </span>
            </div>

            {/* Clients — each POC has their own call log, services, invoice */}
            {req.clients.map((client, ci) => (
              <div key={ci} className="border border-gray-100 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {optionLabel(POC_TYPE_OPTIONS, client.pocType)}
                  </span>
                  <span className="font-medium text-sm text-gray-900">{clientLabel(client)}</span>
                  {client.phone && <span className="text-xs text-gray-400">{client.phone}</span>}
                  {client.invoiceId && (
                    <span className="ml-auto text-sm text-gray-700">Invoice {client.invoiceId}</span>
                  )}
                </div>

                {/* Call log */}
                {client.connections.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-gray-400 mb-1">Call log</div>
                    <div className="space-y-1">
                      {client.connections.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          <span>{optionLabel(CONNECTION_STATUS_OPTIONS, c.status)}</span>
                          <span className="text-gray-400">({c.position})</span>
                          {c.notes && <span className="text-gray-400">· {c.notes}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services */}
                {client.services.map((s, si) => (
                  <div key={si} className="border border-gray-100 rounded-lg p-2 mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={16} className="text-emerald-700" />
                      <span className="font-medium text-sm text-gray-900">{serviceLabel(s.name)}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        {optionLabel(SERVICE_STATUS_OPTIONS, s.status)}
                      </span>
                      {s.chargeableAmount != null && (
                        <span className="ml-auto text-sm text-gray-700">
                          ₹{s.chargeableAmount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.documents.map((d, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600"
                        >
                          {d.received ? (
                            <CheckCircle2 size={12} className="text-emerald-600" />
                          ) : (
                            <Circle size={12} className="text-gray-300" />
                          )}
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
};

export default LegalDocPage;
