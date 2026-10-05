import React from 'react';
import { Activity, Layers, Users, ExternalLink, AlertCircle } from 'lucide-react';
import { mockCohorts, mockTemplates, availableWidgets } from '../../data/mockCohorts';
import { ListGroup, ListRow, cardClass, sectionTitleClass } from '../cms-ui';

const formatTag = (tag) => tag.charAt(0) + tag.slice(1).toLowerCase();

const StatCard = ({ icon, value, label }) => {
  const Icon = icon;
  return (
    <div className={`${cardClass} p-5`}>
      <div className="w-9 h-9 bg-fill rounded-xl flex items-center justify-center mb-4">
        <Icon size={16} strokeWidth={1.75} className="text-secondary" />
      </div>
      <p className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-label tabular-nums">{value}</p>
      <p className="text-[13px] text-secondary mt-0.5">{label}</p>
    </div>
  );
};

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
    <div className="px-8 space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Layers} value={cohorts.length} label="Active cohorts" />
        <StatCard icon={Activity} value={liveTemplates.length} label="Live templates" />
        <StatCard icon={Users} value={totalAgentsReached.toLocaleString()} label="Agents reached" />
      </div>

      {/* Live Configurations */}
      <div>
        <h2 className={`${sectionTitleClass} mb-3 px-1`}>
          Live templates
        </h2>
        {liveTemplates.length > 0 && (
        <ListGroup>
          {liveTemplates
            .sort((a, b) => a.priority - b.priority)
            .map((template) => {
              const targetCohorts = template.cohortIds?.map(id => cohorts.find(c => c.id === id)).filter(Boolean) || [];

              return (
                <ListRow key={template.id} className="items-start">
                  {/* Rank */}
                  <span className="w-5 shrink-0 pt-px text-right text-[13px] font-medium text-tertiary tabular-nums">
                    {template.priority}
                  </span>

                  {/* Template info */}
                  <div className="min-w-[200px] flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[15px] font-medium tracking-[-0.01em] text-label truncate">{template.name}</h3>
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-positive">
                        <span className="w-1.5 h-1.5 rounded-full bg-positive-dot" />
                        Live
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-secondary truncate max-w-[360px]">
                      <span className="tabular-nums">{template.widgets.length}</span> widgets · {template.widgets.map((w) => getWidgetLabel(w.type)).join(', ')}
                    </p>
                  </div>

                  {/* Target Cohort info */}
                  <div className="w-1/3 min-w-[250px]">
                    <p className="text-[12px] text-secondary mb-1">
                      Target cohorts <span className="tabular-nums text-tertiary">{targetCohorts.length}</span>
                    </p>
                    {targetCohorts.length > 0 ? (
                      <div className="space-y-1">
                        {targetCohorts.map((tc) => (
                          <p key={tc.id} className="text-[13px] truncate">
                            <span className="font-medium text-label">{tc.name}</span>
                            <span className="text-secondary">
                              {' · '}{tc.tags.slice(0,2).map(formatTag).join(' · ')}
                              {tc.tags.length > 2 && <span className="text-tertiary"> +{tc.tags.length - 2}</span>}
                            </span>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-warning">
                        <AlertCircle size={14} strokeWidth={1.75} />
                        <span className="text-[13px] font-medium">No valid cohorts linked</span>
                      </div>
                    )}
                  </div>
                </ListRow>
              );
            })}
        </ListGroup>
        )}

        {liveTemplates.length === 0 && (
          <div className={`${cardClass} flex flex-col items-center text-center py-12`}>
            <div className="w-12 h-12 bg-fill rounded-2xl flex items-center justify-center mb-3">
              <Activity size={20} strokeWidth={1.75} className="text-secondary" />
            </div>
            <p className="text-[15px] font-semibold text-label">No live templates</p>
            <p className="text-[13px] text-secondary mt-1">
              Activate templates from the Manage Priority section.
            </p>
          </div>
        )}
      </div>

      {/* Inactive Cohorts hint */}
      {cohorts.filter((c) => !c.isActive).length > 0 && (
        <div className="text-[12px] text-tertiary text-center">
          {cohorts.filter((c) => !c.isActive).length} inactive cohort(s) not shown
        </div>
      )}
    </div>
  );
};

export default LiveOverview;
