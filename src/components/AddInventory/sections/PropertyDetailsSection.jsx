import React from 'react';
import ChoiceGroup from '../fields/ChoiceGroup';
import MultiChoiceGroup from '../fields/MultiChoiceGroup';
import TextField from '../fields/TextField';
import FormSection from '../FormSection';
import {
  APARTMENT_TYPE_OPTIONS,
  BALCONY_FACING_OPTIONS,
  BEDROOM_OPTIONS,
  COUNT_OPTIONS,
  DOOR_FACING_LABELS,
  DOOR_FACING_OPTIONS,
  EXTRA_ROOM_OPTIONS,
  FURNISHING_LABELS,
  FURNISHING_OPTIONS,
  POSSESSION_LABELS,
} from '../formOptions';
import { POSSESSIONS, POSSESSIONS_BY_LISTING_TYPE } from '../../BulkUpload/propertySchema';

const isLandLike = (assetType) => ['plot', 'land'].includes(assetType.toLowerCase());

const PropertyDetailsSection = ({ fieldProps, values, onToggleList }) => {
  const possessions = POSSESSIONS_BY_LISTING_TYPE[values.listingType.toLowerCase()] ?? POSSESSIONS;
  const possession = values.possession.toLowerCase();

  return (
    <FormSection step={2} title="Property Details">
      <TextField {...fieldProps('propertyName')} placeholder="Project Name" withSearchIcon />

      {!isLandLike(values.assetType) && (
        <ChoiceGroup {...fieldProps('apartmentType')} options={APARTMENT_TYPE_OPTIONS} />
      )}

      <TextField {...fieldProps('sbua')} placeholder="1500" suffix="Sqft" />
      <TextField {...fieldProps('carpetArea')} label="Carpet Area" placeholder="1500" suffix="Sqft" />

      <ChoiceGroup {...fieldProps('facing')} options={DOOR_FACING_OPTIONS} labels={DOOR_FACING_LABELS} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField {...fieldProps('floorNumber')} placeholder="0000" />
        <TextField {...fieldProps('totalFloors')} placeholder="0000" />
      </div>

      <ChoiceGroup {...fieldProps('furnishing')} options={FURNISHING_OPTIONS} labels={FURNISHING_LABELS} />
      <ChoiceGroup {...fieldProps('noOfBedrooms')} options={BEDROOM_OPTIONS} />

      <MultiChoiceGroup
        label="Extra Rooms"
        values={values.extraRooms}
        options={EXTRA_ROOM_OPTIONS}
        onToggle={(option) => onToggleList('extraRooms', option)}
      />

      <ChoiceGroup {...fieldProps('noOfBathrooms')} options={COUNT_OPTIONS} />
      <ChoiceGroup {...fieldProps('noOfBalcony')} options={COUNT_OPTIONS} />
      <ChoiceGroup {...fieldProps('balconyFacing')} label="Balcony Facing" options={BALCONY_FACING_OPTIONS} />

      <ChoiceGroup {...fieldProps('possession')} options={possessions} labels={POSSESSION_LABELS} />

      {possession === 'under construction' && (
        <TextField {...fieldProps('handOverDate')} placeholder="26/Dec/2025" />
      )}
      {possession === 'available by' && <TextField {...fieldProps('availableFrom')} placeholder="26/Dec/2025" />}
    </FormSection>
  );
};

export default PropertyDetailsSection;
