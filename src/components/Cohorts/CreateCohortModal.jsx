import React, { useState } from 'react';
import { cohortTypes } from '../../data/mockCohorts';
import { Modal, Button, fieldClass, textareaClass, labelClass } from '../cms-ui';

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

  return (
    <Modal
      onClose={onClose}
      title="Create Cohort"
      subtitle="Define a new cohort by type and values."
      width="max-w-[600px]"
      footer={
        <>
          <Button variant="plain" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={!name.trim() || !selectedType}>
            Create Cohort
          </Button>
        </>
      }
    >
      {/* Body */}
      <div className="space-y-5 pt-1">
        {/* Cohort Name */}
        <div>
          <label className={labelClass}>
            Cohort name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Premium Whitefield Agents"
            className={fieldClass}
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this cohort for?"
            rows={2}
            className={`${textareaClass} resize-none`}
          />
        </div>

        {/* Cohort Type */}
        <div>
          <label className={labelClass}>
            Cohort type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {cohortTypes.map((type) => (
              <label
                key={type.id}
                className={`relative flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-[background-color,box-shadow] duration-150 ${
                  selectedType === type.id
                    ? 'bg-accent-soft ring-2 ring-accent'
                    : 'bg-fill hover:bg-fill-strong'
                }`}
              >
                <input
                  type="radio"
                  name="cohortType"
                  value={type.id}
                  checked={selectedType === type.id}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="mt-0.5 w-4 h-4 accent-accent"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-label">
                      {type.label}
                    </span>
                    {type.exclusive && (
                      <span className="text-[12px] font-medium text-danger">
                        Exclusive
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-secondary mt-0.5">{type.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateCohortModal;
