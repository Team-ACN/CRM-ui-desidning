import { mockProperties } from '../../data/mockProperties';

const ID_PREFIX = 'PB';

/** Every bulk-uploaded property starts as Available — status is never read from the sheet. */
const INITIAL_STATUS = 'Available';

const highestExistingId = () =>
  mockProperties.reduce((max, property) => {
    const digits = Number(String(property.propertyId).replace(/\D/g, ''));
    return Number.isNaN(digits) ? max : Math.max(max, digits);
  }, 0);

/**
 * Turns validated rows into property records. Property ID and status are set by the
 * CRM, not by the sheet.
 */
export const buildUploadedProperties = (rows) => {
  const base = highestExistingId();

  return rows.map((row, index) => ({
    ...row.values,
    key: row.id,
    rowNumber: row.rowNumber,
    status: INITIAL_STATUS,
    propertyId: row.values.propertyId || `${ID_PREFIX}${base + index + 1}`,
    isGeneratedId: row.values.propertyId === '',
    warningCount: row.issues.length,
  }));
};
