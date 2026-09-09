import React from 'react';
import { X, CheckCircle, Info, Smartphone, Monitor, Lock } from 'lucide-react';
import PopupBannerPreview from './PopupBannerPreview';
import PopupSheetPreview from './PopupSheetPreview';
import { STATUS_STYLES, surfaceLabel } from './popupConstants';
import { getTemplate } from './popupTemplates';
import { describeFrequency, describeTargeting, describeTrigger } from './popupValidation';
import { buttonBreakdown, clickThroughRate, dismissRate, formatCount, formatPct } from './popupStats';

const SummaryRow = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-medium text-gray-500 mb-0.5">{label}</p>
    <p className="text-xs text-gray-900">{value}</p>
  </div>
);

const PopupViewModal = ({ isOpen, popup, cohorts, onClose, onMakeLive }) => {
  if (!isOpen || !popup) return null;

  const isNotLive = popup.status === 'Not Live';
  const template = getTemplate(popup.templateKey);
  // One surface, one frame — web renders desktop, app renders the phone.
  const device = popup.surface === 'web' ? 'desktop' : 'mobile';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-start pt-10 overflow-y-auto">
      <div
        className={`bg-white w-full rounded-2xl shadow-2xl flex flex-col mb-10 overflow-hidden border border-gray-100 ${
          popup.managedExternally ? 'max-w-3xl' : 'max-w-5xl'
        }`}
      >
        {isNotLive && !popup.managedExternally && (
          <div className="bg-amber-50 shrink-0 border-b border-amber-200 px-6 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-900 leading-tight">Mandatory QC preview</h3>
              <p className="text-xs text-amber-700 leading-snug">
                Check the button sits cleanly in the creative's well on both devices before going live.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">{popup.name}</h2>
            <span
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                STATUS_STYLES[popup.status] || STATUS_STYLES.Draft
              }`}
            >
              {popup.status}
            </span>
            <span className="px-2.5 py-1 text-[11px] font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
              {popup.managedExternally ? 'App-managed' : template.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isNotLive && (
              <button
                onClick={() => onMakeLive(popup.id)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <CheckCircle size={16} />
                Approve &amp; Make Live
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-6 pt-6">
          {/* Preview */}
          {popup.managedExternally ? (
            <div className="flex-1 flex items-start justify-center">
              <div className="w-[320px] bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Lock size={18} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-blue-900">Managed by the app</h3>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">{popup.externalNote}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500">
                {device === 'mobile' ? <Smartphone size={14} /> : <Monitor size={14} />}
                {device === 'mobile' ? 'App' : 'Web'}
              </span>

              <div
                className={`relative bg-gray-300 rounded-2xl overflow-hidden border border-gray-300 ${
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
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
                Configuration
              </h3>
              <SummaryRow label="Surface" value={surfaceLabel(popup.surface)} />
              <SummaryRow label="Trigger" value={describeTrigger(popup)} />
              <SummaryRow label="Audience" value={describeTargeting(popup, cohorts)} />
              <SummaryRow label="Frequency" value={describeFrequency(popup)} />
              <SummaryRow label="Priority" value={`#${popup.priority}`} />
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
                Performance
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-gray-500">Impressions</p>
                  <p className="text-sm font-bold text-gray-900">{formatCount(popup.stats?.impressions)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">CTR</p>
                  <p className="text-sm font-bold text-gray-900">{formatPct(clickThroughRate(popup))}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Dismiss</p>
                  <p className="text-sm font-bold text-gray-900">{formatPct(dismissRate(popup))}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-200">
                {buttonBreakdown(popup).map((button) => (
                  <div key={button.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate">{button.label}</span>
                    <span className="font-mono text-gray-900">
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
