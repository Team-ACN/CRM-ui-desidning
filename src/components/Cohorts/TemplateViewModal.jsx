import React from 'react';
import { X, Smartphone, CheckCircle, Play, Copy, Check, Info, Lock, Package } from 'lucide-react';
import { mockCohorts, availableWidgets } from '../../data/mockCohorts';
import WidgetInner from './WidgetInner';
import AppHeaderMock from './AppHeaderMock';
import PropertiesHeaderMock from './PropertiesHeaderMock';
import MockPropertyCard from './MockPropertyCard';

const TemplateViewModal = ({ isOpen, onClose, template, onMakeLive }) => {
  if (!isOpen || !template) return null;

  const isLive = template.status === 'Live';
  const isDraft = template.status === 'Draft';
  const isNotLive = template.status === 'Not Live';

  const targetCohorts = mockCohorts.filter(c => template.targetCohorts?.includes(c.id));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-start pt-10 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col mb-10 overflow-hidden border border-gray-100 relative">
        
        {/* QC Mandatory Banner for "Not Live" Templates */}
        {isNotLive && (
           <div className="bg-amber-50 shrink-0 border-b border-amber-200 px-6 py-3 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
               <Info className="w-4 h-4 text-amber-600" />
             </div>
             <div className="flex-1">
               <h3 className="text-sm font-semibold text-amber-900 leading-tight">Mandatory QC Preview</h3>
               <p className="text-xs text-amber-700 leading-snug">
                 This template requested approval. Please review the layout across devices before making it live.
               </p>
             </div>
           </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">{template.name}</h2>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                isLive 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isNotLive
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {template.status}
              </span>
              <span className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                v{template.version}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isNotLive && (
              <button 
                onClick={() => onMakeLive(template.id)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                <CheckCircle size={16} />
                Approve & Make Live
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-6 pt-6">
          {/* Phone preview */}
          <div className="flex justify-center flex-1">
            {/* Phone Frame Setup */}
            <div className="w-[390px] h-[844px] bg-[#FAFAFA] rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-gray-800 relative mx-auto flex flex-col items-center shrink-0 origin-top scale-[0.80]">
              
              {/* New Match-Design App Header */}
              {template.pageType === 'PROPERTIES' ? (
                <PropertiesHeaderMock pageType={template.pageType} />
              ) : (
                <AppHeaderMock pageType={template.pageType || 'HOME'} />
              )}

              {/* Canvas Content Area */}
              <div className="flex-1 w-full overflow-y-auto no-scrollbar relative flex flex-col border-b-[8px] border-gray-800">
                
                {template.widgets?.length > 0 ? (
                  <div className="flex-1 px-3 py-3 space-y-2.5">
                    {template.widgets.map((widget, index) => (
                      <div 
                        key={widget.id || index}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative"
                      >
                        <div className="h-24 bg-gray-50 flex flex-col items-center justify-center p-4">
                          <span className="text-gray-400 text-xs mb-1">Widget Type</span>
                          <span className="font-semibold text-gray-700">{widget.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-xs font-medium text-gray-500">No widgets configured</p>
                  </div>
                )}
                
              </div>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2">
            
            {/* Configured Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-medium text-gray-500 mb-1">Target Page</p>
                  <div className="flex items-center gap-2">
                    <Smartphone size={14} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">{template.pageType || 'Home Page'}</span>
                  </div>
                </div>
                
                {template.priority !== undefined && (
                  <div>
                    <p className="text-[11px] font-medium text-gray-500 mb-1">Display Priority</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                        {template.priority}
                      </div>
                      <span className="text-xs text-gray-600">Higher numbers display first</span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-medium text-gray-500 mb-2">Target Cohorts</p>
                  {targetCohorts.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {targetCohorts.map(cohort => (
                        <span key={cohort.id} className="inline-flex items-center px-2 py-1 rounded bg-white border border-gray-200 text-xs font-medium text-gray-700 shadow-sm">
                          {cohort.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 italic">Global (All Users)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Widget Summary */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex-1">
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Widget Stack</h3>
                <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  {template.widgets?.length || 0}
                </span>
              </div>
              
              <div className="space-y-2">
                {template.widgets?.map((widget, idx) => {
                  const wType = availableWidgets.find(w => w.type === widget.type);
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                        <span className="text-sm text-gray-500">{wType?.icon || <Package size={14} />}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{wType?.label || widget.type}</p>
                        <p className="text-[10px] text-gray-500 truncate">Position {idx + 1}</p>
                      </div>
                    </div>
                  );
                })}

                {(!template.widgets || template.widgets.length === 0) && (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-500 italic">No widgets configured in this layout.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateViewModal;
