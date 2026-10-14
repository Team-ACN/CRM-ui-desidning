import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getLegalDocRecords,
  REQUEST_STATUS_OPTIONS,
  SERVICE_NAME_OPTIONS,
  effectiveStage,
  currentStatus,
  optionLabel,
} from '../../data/mockLegalDoc';

const STAGE_LABELS = { lead: 'Leads', qualify: 'Qualify', service: 'Service' };

const serviceLabel = (name) => SERVICE_NAME_OPTIONS.find((s) => s.value === name)?.label || name;

const summaryFor = (req) => {
  const services = req.clients.flatMap((c) => c.services);
  const names = services.map((s) => serviceLabel(s.name)).join(', ') || 'no services yet';
  return `${optionLabel(REQUEST_STATUS_OPTIONS, currentStatus(req))} — ${names}`;
};

const LegalDocListPage = () => {
  const navigate = useNavigate();
  const { stage } = useParams();

  const requests = useMemo(() => {
    const all = [];
    getLegalDocRecords().forEach((r) => {
      (r.legalAndLoan.legalRequests || []).forEach((req) => {
        all.push({ agentId: r.agentId, agentName: r.agentName, ...req });
      });
    });
    return all;
  }, []);

  const rows = requests.filter((req) => effectiveStage(req) === stage);

  return (
    <div className="pb-8 bg-gray-50 min-h-screen">
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center">
        <h1 className="text-xl font-bold text-gray-900">
          Legal & Doc — {STAGE_LABELS[stage] || stage}
        </h1>
      </header>

      <div className="px-6 mt-6">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Agent</th>
                <th className="px-4 py-3 font-medium">Request</th>
                <th className="px-4 py-3 font-medium">Summary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((req) => (
                <tr
                  key={`${req.agentId}-${req.id}`}
                  onClick={() => navigate(`/legal-doc/agent/${req.agentId}`)}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{req.agentName}</div>
                    <div className="text-xs text-gray-500">{req.agentId}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{req.id}</td>
                  <td className="px-4 py-3 text-gray-700">{summaryFor(req)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                    No requests in this stage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LegalDocListPage;
