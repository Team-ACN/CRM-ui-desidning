import React from 'react';
import ChoiceGroup from '../fields/ChoiceGroup';
import FormSection from '../FormSection';
import {
  COMMERCIAL_ASSETS,
  COMMUNITY_OPTIONS,
  LISTING_LABELS,
  LISTING_OPTIONS,
  PROPERTY_KIND_OPTIONS,
  RESIDENTIAL_ASSETS,
} from '../formOptions';

const BasicDetailsSection = ({ fieldProps, values }) => {
  const assetOptions = values.propertyType.toLowerCase() === 'commercial' ? COMMERCIAL_ASSETS : RESIDENTIAL_ASSETS;

  return (
    <FormSection step={1} title="Basic Details">
      <ChoiceGroup {...fieldProps('listingType')} options={LISTING_OPTIONS} labels={LISTING_LABELS} />
      <ChoiceGroup {...fieldProps('propertyType')} options={PROPERTY_KIND_OPTIONS} />
      <ChoiceGroup {...fieldProps('assetType')} options={assetOptions} />
      <ChoiceGroup {...fieldProps('communityType')} options={COMMUNITY_OPTIONS} required />
    </FormSection>
  );
};

export default BasicDetailsSection;
