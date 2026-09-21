import React from 'react';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

const Card = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5">
    <h3 className="text-[15px] font-bold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
    <span className="text-gray-600">{label}</span>
    <span className="text-gray-900 font-semibold truncate max-w-[55%] text-right">{value || '—'}</span>
  </div>
);

const TIPS = [
  'Fill mandatory fields marked with an asterisk.',
  'You can add unlimited photos, videos, and PDFs.',
  'Paste a listing with Add with AI to fill this form in one go.',
];

const SummarySidebar = ({ values, media, errorCount, aiFieldCount }) => (
  <aside className="flex flex-col gap-5">
    <Card title="Agent & Property">
      <Row label="Agent" value={values.agentName} />
      <Row label="Phone" value={values.agentPhoneNumber} />
      <Row label="Asset Type" value={values.assetType} />
      <Row label="Micromarket" value={values.micromarket} />
    </Card>

    <Card title="Media Summary">
      <Row label="Existing Photos" value="0" />
      <Row label="New Photos" value={String(media.photos.length)} />
      <Row label="Total Photos" value={String(media.photos.length)} />

      <div className="my-2 border-t border-gray-100" />

      <Row label="Existing Videos" value="0" />
      <Row label="New Videos" value={String(media.videos.length)} />
      <Row label="Total Videos" value={String(media.videos.length)} />

      <div className="my-2 border-t border-gray-100" />

      <Row label="Existing Documents" value="0" />
      <Row label="New Documents" value={String(media.documents.length)} />
      <Row label="Total Documents" value={String(media.documents.length)} />
    </Card>

    {(aiFieldCount > 0 || errorCount > 0) && (
      <Card title="Status">
        {aiFieldCount > 0 && (
          <p className="flex items-center gap-2 text-sm text-violet-700 mb-2">
            <Sparkles size={14} />
            {aiFieldCount} fields filled by AI
          </p>
        )}
        {errorCount > 0 ? (
          <p className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={14} />
            {errorCount} {errorCount === 1 ? 'field needs' : 'fields need'} attention
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 size={14} />
            Ready to submit
          </p>
        )}
      </Card>
    )}

    <Card title="Tips">
      <ul className="flex flex-col gap-2.5 text-sm text-gray-700 list-disc pl-4">
        {TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </Card>
  </aside>
);

export default SummarySidebar;
