import React from 'react';
import { Activity, Layers, Users, ExternalLink, AlertCircle } from 'lucide-react';
import { mockCohorts, mockTemplates, availableWidgets } from '../../data/mockCohorts';

const LiveOverview = ({ cohorts, templates, onCreateTemplate }) => {
  const activeCohorts = cohorts.filter((c) => c.isActive);
  const liveTemplates = templates.filter((t) => t.status === 'Live');
  
  // Build a map: cohortId -> template
  const templateByCohort = {};
  templates.forEach((t) => {
    if (t.status === 'Live') {
      t.cohortIds?.forEach(id => {
        templateByCohort[id] = t;
      });
    }
  });

  const getWidgetLabel = (type) => {
    const w = availableWidgets.find((aw) => aw.type === type);
    return w ? w.label : type;
  };

  // Calculate total agents across all active cohorts
  const totalAgentsReached = cohorts.reduce((sum, cohort) => sum + (cohort.agentCount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Layers size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{cohorts.length}</p>
              <p className="text-sm text-gray-500">Active Cohorts</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{liveTemplates.length}</p>
              <p className="text-sm text-gray-500">Live Templates</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalAgentsReached.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Agents Reached</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Configurations */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Live Templates Status
        </h2>
        <div className="space-y-3">
          {liveTemplates
            .sort((a, b) => a.priority - b.priority)
            .map((template) => {
              const targetCohorts = template.cohortIds?.map(id => cohorts.find(c => c.id === id)).filter(Boolean) || [];

              return (
                <div
                  key={template.id}
                  className="bg-white border border-emerald-100 rounded-xl p-5 flex items-center justify-between shadow-sm shadow-emerald-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Live indicator & Rank */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-wider leading-none mb-0.5">Priority</span>
                        <span className="text-sm text-emerald-700 font-bold leading-none">#{template.priority}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse ring-2 ring-white" />
                    </div>
                    
                    {/* Template info */}
                    <div className="min-w-[200px] flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900 truncate">{template.name}</h3>
                        <span className="shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full border border-emerald-200">
                          Live
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs font-medium text-gray-600">
                          {template.widgets.length} widgets
                        </span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-500 truncate max-w-[250px] inline-block">
                          {template.widgets.map((w) => getWidgetLabel(w.type)).join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-300 mx-4 shrink-0">→</div>

                    {/* Target Cohort info */}
                    <div className="w-1/3 min-w-[250px]">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Cohorts ({targetCohorts.length})</p>
                      {targetCohorts.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {targetCohorts.map((tc) => (
                              <div key={tc.id} className="bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 flex flex-col gap-0.5">
                                <h4 className="text-xs font-bold text-gray-800">{tc.name}</h4>
                                <div className="flex items-center gap-1">
                                  {tc.tags.slice(0,2).map((tag) => (
                                    <span key={tag} className="text-[9px] text-gray-500 font-medium uppercase">{tag}</span>
                                  ))}
                                  {tc.tags.length > 2 && <span className="text-[9px] text-gray-400">+{tc.tags.length - 2}</span>}
                                </div>
                              </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <AlertCircle size={14} />
                          <span className="text-xs font-medium">No valid cohorts linked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          {liveTemplates.length === 0 && (
            <div className="text-center py-12 bg-white border border-gray-100 rounded-xl">
              <Activity size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-900">No live templates</p>
              <p className="text-xs text-gray-500 mt-1">
                Activate templates from the Manage Priority section.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Inactive Cohorts hint */}
      {cohorts.filter((c) => !c.isActive).length > 0 && (
        <div className="text-xs text-gray-400 text-center pt-2">
          {cohorts.filter((c) => !c.isActive).length} inactive cohort(s) not shown
        </div>
      )}
    </div>
  );
};

export default LiveOverview;
