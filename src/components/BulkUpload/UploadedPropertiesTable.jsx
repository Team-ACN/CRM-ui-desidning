import React from 'react';
import { ImagePlus, Images } from 'lucide-react';
import { FIELDS_BY_KEY, KEY_COLUMN_KEYS } from './propertySchema';

const STATUS_STYLES = {
  Available: 'bg-green-100 text-green-800 border-green-200',
  Sold: 'bg-gray-100 text-gray-700 border-gray-200',
  Hold: 'bg-amber-100 text-amber-800 border-amber-200',
  Delisted: 'bg-red-100 text-red-800 border-red-200',
};

const ImageCell = ({ images }) => {
  if (images.length === 0) {
    return <span className="text-xs text-gray-400">No images</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {images.slice(0, 3).map((image) => (
          <img
            key={image.id}
            src={image.url}
            alt={image.name}
            className="w-8 h-8 rounded border border-white object-cover ring-1 ring-gray-200"
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">{images.length}</span>
    </div>
  );
};

const Cell = ({ fieldKey, property }) => {
  const value = property[fieldKey];

  if (fieldKey === 'propertyId') {
    return (
      <span className="text-gray-600">
        {value}
        {property.isGeneratedId && <span className="ml-1.5 text-[11px] text-gray-400">new</span>}
      </span>
    );
  }

  return <span className={fieldKey === 'propertyName' ? 'font-medium text-gray-900' : 'text-gray-600'}>{value || '—'}</span>;
};

const UploadedPropertiesTable = ({ properties, imagesByProperty, onManageImages }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Images size={16} className="text-gray-500" />
          Uploaded properties ({properties.length})
        </h4>
        <span className="text-xs text-gray-500">Add images to each property below</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
            <tr>
              {KEY_COLUMN_KEYS.map((key) => (
                <th key={key} className="px-4 py-3 min-w-[110px] whitespace-nowrap">
                  {FIELDS_BY_KEY[key].label}
                </th>
              ))}
              <th className="px-4 py-3 min-w-[100px]">Status</th>
              <th className="px-4 py-3 min-w-[120px]">Images</th>
              <th className="px-4 py-3 min-w-[130px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {properties.map((property) => {
              const images = imagesByProperty[property.key] ?? [];

              return (
                <tr key={property.key} className="hover:bg-gray-50">
                  {KEY_COLUMN_KEYS.map((key) => (
                    <td key={key} className="px-4 py-3 whitespace-nowrap">
                      <Cell fieldKey={key} property={property} />
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${
                        STATUS_STYLES[property.status] ?? STATUS_STYLES.Available
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ImageCell images={images} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onManageImages(property.key)}
                      className="flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      <ImagePlus size={14} />
                      {images.length > 0 ? 'Manage' : 'Add Images'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UploadedPropertiesTable;
