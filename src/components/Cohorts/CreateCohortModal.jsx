import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cohortTypes } from '../../data/mockCohorts';

const CreateCohortModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim() || !selectedType) return;
    onCreate({ name, description, type: selectedType });
    setName('');
    setDescription('');
    setSelectedType('');
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[600px] mx-4 animate-in fade-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create Cohort</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Define a new cohort by type and values.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Cohort Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cohort Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Premium Whitefield Agents"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this cohort for?"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Cohort Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cohort Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {cohortTypes.map((type) => (
                <label
                  key={type.id}
                  className={`relative flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedType === type.id
                      ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="cohortType"
                    value={type.id}
                    checked={selectedType === type.id}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mt-0.5 w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900 accent-gray-900"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {type.label}
                      </span>
                      {type.exclusive && (
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] font-semibold rounded">
                          Exclusive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || !selectedType}
            className="px-5 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            Create Cohort
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCohortModal;
