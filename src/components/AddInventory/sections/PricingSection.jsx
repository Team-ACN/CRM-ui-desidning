import React from 'react';
import ChoiceGroup from '../fields/ChoiceGroup';
import PriceField from '../fields/PriceField';
import FormSection from '../FormSection';
import { ASK_PRICE_HINT, MAINTENANCE_OPTIONS, PRICE_UNIT_OPTIONS, RENT_HINT } from '../formOptions';
import { COMMISSION_TYPES } from '../../BulkUpload/propertySchema';

const RENT_PLACEHOLDER = 'eg. 2,000';

const RentalPricing = ({ fieldProps }) => (
  <>
    <PriceField {...fieldProps('rent')} placeholder={RENT_PLACEHOLDER} hint={RENT_HINT} />
    <PriceField {...fieldProps('deposit')} placeholder={RENT_PLACEHOLDER} hint={RENT_HINT} />
    <ChoiceGroup {...fieldProps('maintenance')} options={MAINTENANCE_OPTIONS} />
    <PriceField {...fieldProps('maintenanceAmount')} placeholder={RENT_PLACEHOLDER} hint={RENT_HINT} />
    <ChoiceGroup
      {...fieldProps('commissionType')}
      options={COMMISSION_TYPES}
      labels={{ 'side by side': 'Side by Side', 'commission sharing': 'Commission Sharing' }}
    />
  </>
);

const ResalePricing = ({ fieldProps, values, onChange }) => (
  <PriceField
    {...fieldProps('totalAskPrice')}
    placeholder="eg. 2,20,00,000"
    hint={ASK_PRICE_HINT}
    unit={values.priceUnit}
    unitOptions={PRICE_UNIT_OPTIONS}
    onUnitChange={(unit) => onChange('priceUnit', unit)}
    showWords
  />
);

const PricingSection = ({ fieldProps, values, onChange }) => (
  <FormSection step={3} title="Pricing Details">
    {values.listingType.toLowerCase() === 'rental' ? (
      <RentalPricing fieldProps={fieldProps} />
    ) : (
      <ResalePricing fieldProps={fieldProps} values={values} onChange={onChange} />
    )}
  </FormSection>
);

export default PricingSection;
