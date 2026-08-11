import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileSpreadsheet, Loader2 } from 'lucide-react';
import { parseCsvTable, readFileAsText } from '../../utils/csv';
import { autoMapHeaders } from './propertySchema';
import { summarize, validateMapping, validateRows } from './validateRows';
import { buildUploadedProperties } from './buildProperties';
import StepIndicator from './StepIndicator';
import UploadStep from './UploadStep';
import MappingStep from './MappingStep';
import ResultStep from './ResultStep';
import PropertyImagesModal from './PropertyImagesModal';

const UPLOAD_DELAY_MS = 700;

const BulkUploadPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [mapping, setMapping] = useState({});
  const [readError, setReadError] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedProperties, setUploadedProperties] = useState([]);
  const [imagesByProperty, setImagesByProperty] = useState({});
  const [activeImageKey, setActiveImageKey] = useState(null);

  const imagesRef = useRef(imagesByProperty);

  useEffect(() => {
    imagesRef.current = imagesByProperty;
  }, [imagesByProperty]);

  // Release the object URLs created for locally picked images.
  useEffect(
    () => () => {
      Object.values(imagesRef.current)
        .flat()
        .forEach((image) => URL.revokeObjectURL(image.url));
    },
    [],
  );

  const validatedRows = useMemo(
    () => (parsed ? validateRows({ rows: parsed.rows, mapping }) : []),
    [parsed, mapping],
  );
  const mappingStatus = useMemo(() => validateMapping(mapping), [mapping]);
  const summary = useMemo(() => summarize(validatedRows), [validatedRows]);

  const canUpload = mappingStatus.isValid && summary.invalid === 0 && summary.valid > 0;

  const handleFileSelected = async (selectedFile) => {
    setIsReading(true);
    setReadError(null);

    try {
      const text = await readFileAsText(selectedFile);
      const table = parseCsvTable(text);

      setFile(selectedFile);
      setParsed(table);
      setMapping(autoMapHeaders(table.headers));
      setStep(2);
    } catch (error) {
      setReadError(error.message);
    } finally {
      setIsReading(false);
    }
  };

  const handleMappingChange = (columnIndex, fieldKey) =>
    setMapping({ ...mapping, [columnIndex]: fieldKey });

  const handleUpload = async () => {
    setIsUploading(true);

    try {
      const properties = buildUploadedProperties(validatedRows.filter((row) => row.status !== 'error'));
      await new Promise((resolve) => setTimeout(resolve, UPLOAD_DELAY_MS));

      setUploadedProperties(properties);
      setStep(3);
    } catch (error) {
      setReadError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImages = (propertyKey, images) =>
    setImagesByProperty({
      ...imagesByProperty,
      [propertyKey]: [...(imagesByProperty[propertyKey] ?? []), ...images],
    });

  const handleRemoveImage = (propertyKey, imageId) => {
    const images = imagesByProperty[propertyKey] ?? [];
    const removed = images.find((image) => image.id === imageId);

    if (removed) {
      URL.revokeObjectURL(removed.url);
    }

    setImagesByProperty({
      ...imagesByProperty,
      [propertyKey]: images.filter((image) => image.id !== imageId),
    });
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setParsed(null);
    setMapping({});
    setReadError(null);
    setUploadedProperties([]);
    setImagesByProperty({});
    setActiveImageKey(null);
  };

  const activeProperty = uploadedProperties.find((property) => property.key === activeImageKey);

  return (
    <div className="pb-8">
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Bulk Upload</h1>
        {file && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileSpreadsheet size={16} className="text-gray-400" />
            <span className="font-medium text-gray-700">{file.name}</span>
            <span>· {(file.size / 1024).toFixed(1)} KB</span>
          </div>
        )}
      </header>

      <div className="px-6">
        <StepIndicator currentStep={step} />

        {step === 1 && (
          <UploadStep onFileSelected={handleFileSelected} error={readError} isReading={isReading} />
        )}

        {step === 2 && parsed && (
          <>
            <MappingStep
              parsed={parsed}
              mapping={mapping}
              mappingStatus={mappingStatus}
              summary={summary}
              validatedRows={validatedRows}
              onMappingChange={handleMappingChange}
            />

            <div className="mt-6 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-5 py-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <ArrowLeft size={16} />
                Choose another file
              </button>

              <div className="flex items-center gap-4">
                {!canUpload && (
                  <span className="text-sm text-gray-500">
                    {summary.invalid > 0
                      ? `Fix ${summary.invalid} blocked row${summary.invalid === 1 ? '' : 's'} to continue`
                      : 'Map every required field to continue'}
                  </span>
                )}
                <button
                  onClick={handleUpload}
                  disabled={!canUpload || isUploading}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  {isUploading ? 'Uploading…' : `Upload ${summary.valid} propert${summary.valid === 1 ? 'y' : 'ies'}`}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <ResultStep
            properties={uploadedProperties}
            imagesByProperty={imagesByProperty}
            fileName={file?.name ?? ''}
            onManageImages={setActiveImageKey}
            onReset={handleReset}
            onDone={() => navigate('/properties')}
          />
        )}
      </div>

      {activeProperty && (
        <PropertyImagesModal
          property={activeProperty}
          images={imagesByProperty[activeProperty.key] ?? []}
          onAddImages={handleAddImages}
          onRemoveImage={handleRemoveImage}
          onClose={() => setActiveImageKey(null)}
        />
      )}
    </div>
  );
};

export default BulkUploadPage;
