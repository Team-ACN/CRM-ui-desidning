import React from 'react';
import { X, Smartphone, CheckCircle } from 'lucide-react';
import { mockCohorts, availableWidgets } from '../../data/mockCohorts';
import WidgetInner from './WidgetInner';

const TemplateViewModal = ({ isOpen, onClose, template, onMakeLive }) => {
  if (!isOpen || !template) return null;

  const targetCohorts = template.cohortIds?.map(id => mockCohorts.find(c => c.id === id)).filter(Boolean) || [];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[780px] mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">{template.name}</h2>
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                  template.status === 'Live'
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                    : template.status === 'Draft'
                    ? 'text-amber-600 bg-amber-50 border-amber-200'
                    : 'text-gray-500 bg-gray-50 border-gray-200'
                }`}
              >
                {template.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {targetCohorts.map(tc => tc.name).join(', ') || 'Unknown cohort(s)'} • Priority #{template.priority} • {template.widgets.length} widgets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-6">
          {/* Phone preview */}
          <div className="flex justify-center">
            <div className="w-[260px] min-h-[460px] bg-white rounded-[2rem] border-[3px] border-gray-800 shadow-lg flex flex-col shrink-0">
              {/* Notch */}
              <div className="flex justify-center pt-2.5 pb-1.5">
                <div className="w-16 h-4 bg-gray-900 rounded-full" />
              </div>

              {/* Status bar */}
              <div className="px-5 py-0.5 flex items-center justify-between text-[9px] text-gray-400">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* App header */}
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-900">
                  {template.pageType === 'PROPERTIES' ? 'ACN Properties' : 'ACN Home'}
                </p>
              </div>

              {/* Widgets */}
              <div className="flex-1 px-2.5 py-2 space-y-2 overflow-y-auto">
                {template.widgets.map((widget) => {
                  const wType = availableWidgets.find((w) => w.type === widget.type);
                  return (
                    <div key={widget.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border-b border-gray-100">
                        <span className="text-[10px]">{wType?.icon}</span>
                        <span className="text-[9px] font-semibold text-gray-700 uppercase tracking-wider">{wType?.label}</span>
                      </div>
                      <WidgetInner widget={widget} />
                    </div>
                  );
                })}

                {template.widgets.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Smartphone size={16} className="text-gray-300 mb-1" />
                    <p className="text-[9px] text-gray-400">No widgets</p>
                  </div>
                )}
              </div>

              {/* Bottom bar */}
              <div className="flex justify-center py-1.5">
                <div className="w-20 h-1 bg-gray-300 rounded-full" />
              </div>
            </div>
          </div>

          {/* Details panel */}
          <div className="flex-1 space-y-4 overflow-y-auto">
            {/* Template info */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Template Details
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-2">Target Cohorts ({targetCohorts.length})</p>
                  <div className="flex flex-col gap-3">
                    {targetCohorts.map(tc => (
                      <div key={tc.id}>
                        <p className="text-sm font-medium text-gray-900">{tc.name}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {tc.tags?.map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[9px] font-bold uppercase rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {targetCohorts.length === 0 && <p className="text-sm text-gray-500">None</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Priority</p>
                    <p className="text-sm font-medium text-gray-900">#{template.priority}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Status</p>
                    <p className="text-sm font-medium text-gray-900">{template.status}</p>
                  </div>
                </div>
              </div>

              {/* QC Approval Banner */}
              {template.status === 'Not Live' && onMakeLive && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="text-amber-600" size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900">Mandatory QC Preview</h4>
                      <p className="text-xs text-amber-700 mt-1">
                        Please review the layout and configuration on the mockup phone. If everything is correct, you can approve this template for production.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Widgets list */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Widgets ({template.widgets.length})
              </h3>
              <div className="space-y-2">
                {template.widgets.map((widget, i) => {
                  const wType = availableWidgets.find((w) => w.type === widget.type);
                  return (
                    <div key={widget.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-sm border border-gray-200">
                        {wType?.icon}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{wType?.label}</p>
                        <p className="text-xs text-gray-400">{wType?.description}</p>
                      </div>
                      <span className="ml-auto text-xs text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200">
                        Slot {i + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 shrink-0 gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            {template.status === 'Not Live' ? 'Cancel' : 'Close'}
          </button>
          
          {template.status === 'Not Live' && onMakeLive && (
            <button
              onClick={() => onMakeLive(template.id)}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-emerald-200"
            >
              <CheckCircle size={16} />
              Approve & Make Live
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateViewModal;
