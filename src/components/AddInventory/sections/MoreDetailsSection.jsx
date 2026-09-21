import React from 'react';
import CheckboxField from '../fields/CheckboxField';
import ChoiceGroup from '../fields/ChoiceGroup';
import CounterField from '../fields/CounterField';
import FieldShell from '../fields/FieldShell';
import MultiChoiceGroup from '../fields/MultiChoiceGroup';
import TextField from '../fields/TextField';
import FormSection from '../FormSection';
import {
  AMENITY_OPTIONS,
  BUILDING_KHATA_OPTIONS,
  KHATA_FLAG_OPTIONS,
  LAND_KHATA_OPTIONS,
} from '../formOptions';

const FLAGS = [
  { key: 'cornerUnit', label: 'Corner Unit' },
  { key: 'exclusive', label: 'Exclusive' },
  { key: 'ocReceived', label: 'OC Received' },
];

const MoreDetailsSection = ({ fieldProps, values, onChange, onToggleList }) => (
  <FormSection step={4} title="More Details">
    <TextField {...fieldProps('uds')} placeholder="1500" suffix="Sqft" />

    <div className="flex flex-col gap-3">
      {FLAGS.map((flag) => (
        <CheckboxField
          key={flag.key}
          label={flag.label}
          checked={values[flag.key]}
          onChange={(checked) => onChange(flag.key, checked)}
        />
      ))}
    </div>

    <ChoiceGroup {...fieldProps('buildingKhata')} label="Building Khata" options={BUILDING_KHATA_OPTIONS} />
    <ChoiceGroup {...fieldProps('landKhata')} label="Land Khata" options={LAND_KHATA_OPTIONS} />

    <div className="flex flex-col gap-3">
      {KHATA_FLAG_OPTIONS.map((option) => (
        <CheckboxField
          key={option}
          label={option}
          checked={values.khataFlags.includes(option)}
          onChange={() => onToggleList('khataFlags', option)}
        />
      ))}
    </div>

    <CounterField
      label="Parking"
      value={values.parking}
      onChange={(value) => onChange('parking', value)}
      source={fieldProps('parking').source}
    />

    <MultiChoiceGroup
      label="Amenities"
      values={values.amenities}
      options={AMENITY_OPTIONS}
      onToggle={(option) => onToggleList('amenities', option)}
    />

    <FieldShell label="Extra Details">
      <textarea
        rows={5}
        value={values.extraDetails}
        placeholder="Enter any additional details"
        onChange={(event) => onChange('extraDetails', event.target.value)}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
      />
    </FieldShell>
  </FormSection>
);

export default MoreDetailsSection;
