import React from 'react';
import { Calendar, Users, Tag } from 'lucide-react';
import { Modal, Button } from '../cms-ui';

const formatTag = (tag) => tag.charAt(0) + tag.slice(1).toLowerCase();

const CohortViewModal = ({ isOpen, onClose, cohort, templates }) => {
  if (!isOpen || !cohort) return null;

  const linkedTemplates = templates.filter((t) => t.cohortId === cohort.id);

  return (
    <Modal
      onClose={onClose}
      title={cohort.name}
      subtitle={cohort.description}
      width="max-w-[520px]"
      footer={
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {/* Body */}
      <div className="space-y-6">
        {/* Status & tags */}
        <div className="flex items-center gap-3 flex-wrap text-[13px]">
          <span
            className={`inline-flex items-center gap-1.5 font-medium ${
              cohort.status === 'Active' ? 'text-positive' : 'text-secondary'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cohort.isActive ? 'bg-positive-dot' : 'bg-tertiary'}`} />
            {cohort.status}
          </span>
          {cohort.tags.length > 0 && (
            <span className="text-secondary">{cohort.tags.map(formatTag).join(' · ')}</span>
          )}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-canvas rounded-xl">
            <div className="flex items-center gap-1.5 text-secondary mb-1">
              <Tag size={14} strokeWidth={1.75} />
              <span className="text-[12px] font-medium">Type</span>
            </div>
            <p className="text-[15px] font-medium text-label">
              {cohort.tags.map(formatTag).join(', ')}
            </p>
          </div>
          <div className="p-3 bg-canvas rounded-xl">
            <div className="flex items-center gap-1.5 text-secondary mb-1">
              <Users size={14} strokeWidth={1.75} />
              <span className="text-[12px] font-medium">Agents</span>
            </div>
            <p className="text-[15px] font-medium text-label tabular-nums">
              {cohort.agentCount || 0}
            </p>
          </div>
        </div>

        {/* Linked templates */}
        <div>
          <h3 className="text-[13px] font-medium text-secondary mb-2 px-1">
            Linked templates
          </h3>
          {linkedTemplates.length > 0 ? (
            <div className="bg-canvas rounded-xl divide-y divide-separator">
              {linkedTemplates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-3 py-2.5"
                >
                  <div>
                    <p className="text-[14px] font-medium text-label">{t.name}</p>
                    <p className="text-[12px] text-secondary tabular-nums">
                      Priority {t.priority} · {t.widgets.length} widgets
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${
                      t.status === 'Live' ? 'text-positive' : 'text-secondary'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'Live' ? 'bg-positive-dot' : 'bg-tertiary'}`} />
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-secondary py-4 text-center bg-canvas rounded-xl">
              No templates linked to this cohort
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CohortViewModal;
