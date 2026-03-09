import React from 'react';
import { X, Layers, Calendar, Users, Tag } from 'lucide-react';

const CohortViewModal = ({ isOpen, onClose, cohort, templates }) => {
  if (!isOpen || !cohort) return null;

  const linkedTemplates = templates.filter((t) => t.cohortId === cohort.id);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[520px] mx-4">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Layers size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{cohort.name}</h2>
              <p className="text-sm text-gray-500">{cohort.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 space-y-5">
          {/* Status & tags */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                cohort.status === 'Active'
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                  : 'text-gray-500 bg-gray-50 border-gray-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${cohort.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              {cohort.status}
            </span>
            {cohort.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold uppercase rounded tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Tag size={14} />
                <span className="text-[11px] font-medium uppercase tracking-wider">Type</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {cohort.tags.join(', ')}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Users size={14} />
                <span className="text-[11px] font-medium uppercase tracking-wider">Agents</span>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {cohort.agentCount || 0}
              </p>
            </div>
          </div>

          {/* Linked templates */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Linked Templates
            </h3>
            {linkedTemplates.length > 0 ? (
              <div className="space-y-2">
                {linkedTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">
                        Priority #{t.priority} • {t.widgets.length} widgets
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                        t.status === 'Live'
                          ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                          : 'text-gray-500 bg-gray-50 border-gray-200'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-3 text-center bg-gray-50 rounded-xl">
                No templates linked to this cohort
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CohortViewModal;
