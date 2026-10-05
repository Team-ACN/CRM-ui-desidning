import React from 'react';
import { X, CheckCircle, Info, Smartphone, Monitor, Lock } from 'lucide-react';
import { Button, IconButton } from '../cms-ui';
import StatusChip from './StatusChip';
import PopupBannerPreview from './PopupBannerPreview';
import PopupSheetPreview from './PopupSheetPreview';
import { surfaceLabel } from './popupConstants';
import { getTemplate } from './popupTemplates';
import { describeFrequency, describeTargeting, describeTrigger } from './popupValidation';
import { buttonBreakdown, clickThroughRate, dismissRate, formatCount, formatPct } from './popupStats';

const SummaryRow = ({ label, value }) => (
  <div>
    <p className="text-[12px] text-secondary mb-0.5">{label}</p>
    <p className="text-[14px] text-label">{value}</p>
  </div>
);

const PopupViewModal = ({ isOpen, popup, cohorts, onClose, onMakeLive }) => {
  if (!isOpen || !popup) return null;

  const isNotLive = popup.status === 'Not Live';
  const template = getTemplate(popup.templateKey);
  // One surface, one frame — web renders desktop, app renders the phone.
  const device = popup.surface === 'web' ? 'desktop' : 'mobile';

  return (
    <div className="fixed inset-0 bg-black/30 animate-scrim-in z-[100] flex justify-center items-start pt-10 overflow-y-auto">
      <div
        className={`bg-surface w-full rounded-2xl shadow-raised animate-sheet-in flex flex-col mb-10 overflow-hidden ${
          popup.managedExternally ? 'max-w-3xl' : 'max-w-5xl'
        }`}
      >
        {isNotLive && !popup.managedExternally && (
          <div className="bg-warning-dot/10 shrink-0 px-6 py-3 flex items-center gap-3">
            <Info size={18} strokeWidth={1.75} className="text-warning shrink-0" />
            <div>
              <h3 className="text-[14px] font-semibold text-label leading-tight">Mandatory QC preview</h3>
              <p className="text-[13px] text-secondary leading-snug mt-0.5">
                Check the button sits cleanly in the creative's well on both devices before going live.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4 shrink-0">
          <div className="min-w-0">
            <h2 className="text-[17px] leading-[22px] font-semibold tracking-[-0.01em] text-label truncate">
              {popup.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-[13px] text-secondary">
              <StatusChip status={popup.status} />
              <span className="text-tertiary">·</span>
              <span>{popup.managedExternally ? 'App-managed' : template.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isNotLive && (
              <Button variant="primary" icon={CheckCircle} onClick={() => onMakeLive(popup.id)}>
                Approve &amp; make live
              </Button>
            )}
            <IconButton icon={X} label="Close" size={18} onClick={onClose} className="-mr-2" />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-6 pt-2">
          {/* Preview */}
          {popup.managedExternally ? (
            <div className="flex-1 flex items-start justify-center">
              <div className="w-[320px] bg-canvas rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-surface shadow-card flex items-center justify-center mx-auto mb-3">
                  <Lock size={20} strokeWidth={1.75} className="text-secondary" />
                </div>
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-label">Managed by the app</h3>
                <p className="text-[13px] text-secondary mt-1 leading-relaxed">{popup.externalNote}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center gap-3">
              <span className="flex items-center gap-1.5 text-[13px] font-medium text-secondary">
                {device === 'mobile' ? (
                  <Smartphone size={14} strokeWidth={1.75} />
                ) : (
                  <Monitor size={14} strokeWidth={1.75} />
                )}
                {device === 'mobile' ? 'App' : 'Web'}
              </span>

              <div
                className={`relative bg-fill-strong rounded-2xl overflow-hidden ${
                  device === 'mobile' ? 'w-[320px] h-[620px]' : 'w-[560px] h-[440px]'
                }`}
              >
                {device === 'mobile' ? (
                  <PopupSheetPreview popup={popup} width={320} />
                ) : (
                  <PopupBannerPreview popup={popup} width={500} />
                )}
              </div>
            </div>
          )}

          {/* Config + performance */}
          <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-1">
            <div className="bg-canvas rounded-2xl p-4 space-y-3">
              <h3 className="text-[13px] font-semibold text-label">Configuration</h3>
              <SummaryRow label="Surface" value={surfaceLabel(popup.surface)} />
              <SummaryRow label="Trigger" value={describeTrigger(popup)} />
              <SummaryRow label="Audience" value={describeTargeting(popup, cohorts)} />
              <SummaryRow label="Frequency" value={describeFrequency(popup)} />
              <SummaryRow label="Priority" value={`#${popup.priority}`} />
            </div>

            <div className="bg-canvas rounded-2xl p-4 space-y-3">
              <h3 className="text-[13px] font-semibold text-label">Performance</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[17px] font-semibold text-label tabular-nums">{formatCount(popup.stats?.impressions)}</p>
                  <p className="text-[12px] text-secondary">Impressions</p>
                </div>
                <div>
                  <p className="text-[17px] font-semibold text-label tabular-nums">{formatPct(clickThroughRate(popup))}</p>
                  <p className="text-[12px] text-secondary">CTR</p>
                </div>
                <div>
                  <p className="text-[17px] font-semibold text-label tabular-nums">{formatPct(dismissRate(popup))}</p>
                  <p className="text-[12px] text-secondary">Dismiss</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-separator">
                {buttonBreakdown(popup).map((button) => (
                  <div key={button.id} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="text-secondary truncate">{button.label}</span>
                    <span className="text-label tabular-nums shrink-0">
                      {formatCount(button.clicks)} · {formatPct(button.ctr)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupViewModal;
