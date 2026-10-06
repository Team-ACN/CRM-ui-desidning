import React from 'react';
import { X, Smartphone, CheckCircle, Play, Copy, Check, Info, Lock, Package } from 'lucide-react';
import { mockCohorts, availableWidgets } from '../../data/mockCohorts';
import WidgetInner from './WidgetInner';
import AppHeaderMock from './AppHeaderMock';
import PropertiesHeaderMock from './PropertiesHeaderMock';
import MockPropertyCard from './MockPropertyCard';
import { Button, IconButton } from '../cms-ui';

const TemplateViewModal = ({ isOpen, onClose, template, onMakeLive }) => {
  if (!isOpen || !template) return null;

  const isLive = template.status === 'Live';
  const isDraft = template.status === 'Draft';
  const isNotLive = template.status === 'Not Live';

  const targetCohorts = mockCohorts.filter(c => template.targetCohorts?.includes(c.id));

  return (
    <div className="cms fixed inset-0 bg-black/30 animate-scrim-in z-[100] flex justify-center items-start pt-10 px-6 overflow-y-auto">
      <div className="bg-surface w-full max-w-5xl rounded-2xl shadow-raised animate-sheet-in flex flex-col mb-10 overflow-hidden relative">
        
        {/* QC Mandatory Banner for "Not Live" Templates */}
        {isNotLive && (
           <div className="bg-canvas shrink-0 border-b border-separator px-6 py-3 flex items-center gap-3">
             <Info size={16} strokeWidth={1.75} className="text-warning shrink-0" />
             <div className="flex-1">
               <h3 className="text-[13px] font-semibold text-label leading-tight">Mandatory QC preview</h3>
               <p className="text-[13px] text-secondary leading-snug">
                 This template requested approval. Please review the layout across devices before making it live.
               </p>
             </div>
           </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-separator bg-surface shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <h2 className="text-[17px] leading-[22px] font-semibold tracking-[-0.01em] text-label truncate">{template.name}</h2>
            <div className="flex items-center gap-3 text-[13px] shrink-0">
              <span className={`inline-flex items-center gap-1.5 font-medium ${
                isLive ? 'text-positive' : isNotLive ? 'text-warning' : 'text-secondary'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isLive ? 'bg-positive-dot' : isNotLive ? 'bg-warning-dot' : 'bg-tertiary'
                }`} />
                {template.status}
              </span>
              <span className="text-tertiary tabular-nums">
                v{template.version}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isNotLive && (
              <Button variant="primary" icon={CheckCircle} onClick={() => onMakeLive(template.id)}>
                Approve & Make Live
              </Button>
            )}
            <IconButton icon={X} label="Close" onClick={onClose} className="-mr-2" />
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
            <div className="bg-canvas rounded-2xl p-4">
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-label mb-4">Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] text-secondary mb-1">Target page</p>
                  <div className="flex items-center gap-2">
                    <Smartphone size={14} strokeWidth={1.75} className="text-secondary" />
                    <span className="text-[14px] font-medium text-label">{template.pageType || 'Home Page'}</span>
                  </div>
                </div>
                
                {template.priority !== undefined && (
                  <div>
                    <p className="text-[12px] text-secondary mb-1">Display priority</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[14px] font-medium text-label tabular-nums">
                        {template.priority}
                      </span>
                      <span className="text-[12px] text-secondary">Higher numbers display first</span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[12px] text-secondary mb-1">Target cohorts</p>
                  {targetCohorts.length > 0 ? (
                    <p className="text-[14px] font-medium text-label">
                      {targetCohorts.map(cohort => cohort.name).join(', ')}
                    </p>
                  ) : (
                    <span className="text-[14px] text-secondary">Global (All Users)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Widget Summary */}
            <div className="bg-canvas rounded-2xl p-4 flex-1">
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-label mb-3">Widget stack</h3>
              
              {template.widgets?.length > 0 && (
                <div className="bg-surface rounded-xl shadow-card divide-y divide-separator">
                  {template.widgets.map((widget, idx) => {
                    const wType = availableWidgets.find(w => w.type === widget.type);
                    return (
                      <div key={idx} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-8 h-8 rounded-lg bg-fill flex items-center justify-center shrink-0">
                          <span className="text-sm text-secondary">{wType?.icon || <Package size={14} strokeWidth={1.75} />}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-label truncate">{wType?.label || widget.type}</p>
                          <p className="text-[12px] text-tertiary truncate tabular-nums">Position {idx + 1}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {(!template.widgets || template.widgets.length === 0) && (
                <div className="text-center py-6">
                  <p className="text-[13px] text-secondary">No widgets configured in this layout.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateViewModal;
