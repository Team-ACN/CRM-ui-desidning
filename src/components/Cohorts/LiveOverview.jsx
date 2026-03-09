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
      templateByCohort[t.cohortId] = t;
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
              const targetCohort = cohorts.find((c) => c.id === template.cohortId);

              return (
                <div
                  key={template.id}
                  className="bg-white border border-emerald-100 rounded-xl p-5 flex items-center justify-between shadow-sm shadow-emerald-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Live indicator & Rank */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-wider leading-none mb-0.5">Priority</span>
                        <span className="text-sm text-emerald-700 font-bold leading-none">#{template.priority}</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse ring-2 ring-white" />
                    </div>
                    
                    {/* Template info */}
                    <div className="min-w-[200px] flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900">{template.name}</h3>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full border border-emerald-200">
                          Live
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs font-medium text-gray-600">
                          {template.widgets.length} widgets
                        </span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          {template.widgets.map((w) => getWidgetLabel(w.type)).join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-300 mx-4">→</div>

                    {/* Target Cohort info */}
                    <div className="w-1/3">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Target Cohort</p>
                      {targetCohort ? (
                        <>
                          <h4 className="text-sm font-semibold text-gray-800">{targetCohort.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            {targetCohort.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold uppercase rounded tracking-wider"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <AlertCircle size={14} />
                          <span className="text-xs font-medium">No valid cohort linked</span>
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
