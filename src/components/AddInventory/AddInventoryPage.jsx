import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import AiExtractionBanner from './AiExtractionBanner';
import AiPasteModal from './AiPasteModal';
import FindAgentBar from './FindAgentBar';
import SummarySidebar from './SummarySidebar';
import BasicDetailsSection from './sections/BasicDetailsSection';
import PropertyDetailsSection from './sections/PropertyDetailsSection';
import PricingSection from './sections/PricingSection';
import MoreDetailsSection from './sections/MoreDetailsSection';
import MediaSection from './sections/MediaSection';
import { extractListingAsync } from './aiExtract';
import {
  SOURCE_AI,
  applyExtraction,
  countBySeverity,
  createEmptyForm,
  isRequiredField,
  labelFor,
  setFieldValue,
  summarizeExtraction,
  toggleListValue,
  validateForm,
} from './formModel';

const EMPTY_MEDIA = { photos: [], videos: [], documents: [] };

const AddInventoryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState(createEmptyForm);
  const [media, setMedia] = useState(EMPTY_MEDIA);
  const [isPasteOpen, setIsPasteOpen] = useState(searchParams.get('mode') === 'ai');
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [showIssues, setShowIssues] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const issues = useMemo(() => validateForm(form.values), [form.values]);
  const errorCount = countBySeverity(issues, 'error');
  const summary = useMemo(() => summarizeExtraction(form), [form]);
  const aiFieldCount = Object.values(form.sources).filter((source) => source === SOURCE_AI).length;
  const hasValues = Object.values(form.values).some((value) => value !== '' && value !== false && value.length !== 0);

  const handleChange = (key, value) => setForm((current) => setFieldValue(current, key, value));
  const handleToggleList = (key, option) => setForm((current) => toggleListValue(current, key, option));

  const fieldProps = (key) => ({
    label: labelFor(key),
    value: form.values[key],
    onChange: (value) => handleChange(key, value),
    required: isRequiredField(key, form.values),
    issue: showIssues ? issues[key] : undefined,
    source: form.sources[key],
    confidence: form.confidence[key],
  });

  const handleExtract = async (text) => {
    setIsExtracting(true);

    try {
      const extraction = await extractListingAsync(text);

      setForm((current) => applyExtraction(current, extraction));
      setHasExtracted(true);
      setIsPasteOpen(false);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAgentFound = (agentValues) =>
    setForm((current) =>
      Object.entries(agentValues).reduce((next, [key, value]) => setFieldValue(next, key, value), current),
    );

  const handleAddMedia = (kind, names) =>
    setMedia((current) => ({ ...current, [kind]: [...current[kind], ...names] }));

  const handleRemoveMedia = (kind, index) =>
    setMedia((current) => ({ ...current, [kind]: current[kind].filter((_, position) => position !== index) }));

  const handleSubmit = () => {
    setShowIssues(true);
    if (errorCount === 0) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/properties')}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Add New Property</h1>
        </div>

        <button
          type="button"
          onClick={() => setIsPasteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 text-sm font-medium transition-colors"
        >
          <Sparkles size={16} />
          {hasExtracted ? 'Paste another listing' : 'Add with AI'}
        </button>
      </header>

      <FindAgentBar agent={form.values} onAgentFound={handleAgentFound} />

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
          <div className="flex flex-col gap-5">
            {hasExtracted && (
              <AiExtractionBanner
                form={form}
                summary={summary}
                onRepaste={() => setIsPasteOpen(true)}
                onDismiss={() => setHasExtracted(false)}
              />
            )}

            {isSubmitted && (
              <p className="flex items-center gap-2 px-5 py-4 rounded-lg border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-800">
                <CheckCircle2 size={18} />
                Property submitted — this prototype does not persist it yet.
              </p>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col gap-10">
              <BasicDetailsSection fieldProps={fieldProps} values={form.values} />
              <PropertyDetailsSection
                fieldProps={fieldProps}
                values={form.values}
                onToggleList={handleToggleList}
              />
              <PricingSection fieldProps={fieldProps} values={form.values} onChange={handleChange} />
              <MoreDetailsSection
                fieldProps={fieldProps}
                values={form.values}
                onChange={handleChange}
                onToggleList={handleToggleList}
              />
              <MediaSection media={media} onAdd={handleAddMedia} onRemove={handleRemoveMedia} />
            </div>
          </div>

          <div className="xl:sticky xl:top-6">
            <SummarySidebar
              values={form.values}
              media={media}
              errorCount={showIssues ? errorCount : 0}
              aiFieldCount={aiFieldCount}
            />
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 px-8 py-3 flex items-center justify-end gap-4 shrink-0">
        {showIssues && errorCount > 0 && (
          <span className="text-sm text-red-600 mr-auto">
            {errorCount} {errorCount === 1 ? 'field needs' : 'fields need'} attention before submitting
          </span>
        )}
        <button
          type="button"
          onClick={() => navigate('/properties')}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
        >
          Submit Property
        </button>
      </footer>

      <AiPasteModal
        isOpen={isPasteOpen}
        isExtracting={isExtracting}
        hasExistingValues={hasValues}
        onExtract={handleExtract}
        onClose={() => !isExtracting && setIsPasteOpen(false)}
      />
    </div>
  );
};

export default AddInventoryPage;
