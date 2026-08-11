import {
  CROSS_FIELD_RULES,
  FIELDS_BY_KEY,
  IGNORE_FIELD,
  isFieldRequired,
  PROPERTY_FIELDS,
  REQUIRED_FIELD_KEYS,
  REQUIREMENT_NOTES,
} from './propertySchema';

const issue = (fieldKey, value, message, severity) => ({ field: fieldKey, value, message, severity });

/** Raw cell value per mapped field key. */
const rawValuesFor = (cells, mapping) =>
  Object.entries(mapping).reduce((values, [index, fieldKey]) => {
    if (fieldKey === IGNORE_FIELD) return values;
    return { ...values, [fieldKey]: cells[Number(index)] ?? '' };
  }, {});

/** Validate and normalise one non-empty cell. */
const parseCell = (entry, raw) => {
  const failure = entry.validate(raw);

  if (!failure) {
    return { issues: [], value: entry.normalize ? entry.normalize(raw) : raw };
  }

  // Warnings keep the normalised value so the row can still be uploaded.
  const value = failure.severity === 'warning' && entry.normalize ? entry.normalize(raw) : raw;
  return { issues: [issue(entry.key, raw, failure.message, failure.severity)], value };
};

const missingMessage = (entry) =>
  REQUIREMENT_NOTES[entry.key]
    ? `Required for this row (${REQUIREMENT_NOTES[entry.key]})`
    : 'Required value is missing';

/** Blank-cell issues, decided once the whole row is parsed — requirements are conditional. */
const missingValueIssues = (values) =>
  PROPERTY_FIELDS.filter((entry) => values[entry.key] === '').flatMap((entry) => {
    if (isFieldRequired(entry, values)) {
      return [issue(entry.key, '', missingMessage(entry), 'error')];
    }
    return entry.recommended ? [issue(entry.key, '', 'Recommended value is missing', 'warning')] : [];
  });

const applyCrossFieldRules = (values) =>
  CROSS_FIELD_RULES.filter((rule) => rule.applies(values)).map((rule) =>
    issue(rule.field, values[rule.field] ?? '', rule.message, rule.severity),
  );

const buildRow = (cells, mapping, index) => {
  const raw = rawValuesFor(cells, mapping);

  const parsed = PROPERTY_FIELDS.reduce(
    (state, entry) => {
      const cell = raw[entry.key] ?? '';

      if (cell === '') {
        return { ...state, values: { ...state.values, [entry.key]: '' } };
      }

      const { issues, value } = parseCell(entry, cell);
      return {
        values: { ...state.values, [entry.key]: value },
        issues: [...state.issues, ...issues],
      };
    },
    { values: {}, issues: [] },
  );

  return {
    id: `row-${index}`,
    rowNumber: index + 2, // +1 for the header row, +1 for 1-based numbering
    cells,
    values: parsed.values,
    issues: [
      ...parsed.issues,
      ...missingValueIssues(parsed.values),
      ...applyCrossFieldRules(parsed.values),
    ],
  };
};

const UNIQUE_FIELDS = PROPERTY_FIELDS.filter((entry) => entry.unique);

/** Flags rows whose unique value already appeared in an earlier row. */
const withDuplicateIssues = (rows) =>
  rows.reduce(
    (state, row) => {
      const duplicates = UNIQUE_FIELDS.flatMap((entry) => {
        const value = row.values[entry.key];
        const firstSeenAt = state.seen[entry.key]?.get(value);
        return value !== '' && firstSeenAt
          ? [issue(entry.key, value, `Duplicate ${entry.label} — already used in row ${firstSeenAt}`, 'error')]
          : [];
      });

      const seen = UNIQUE_FIELDS.reduce((acc, entry) => {
        const value = row.values[entry.key];
        const previous = acc[entry.key] ?? new Map();
        return {
          ...acc,
          [entry.key]:
            value === '' || previous.has(value) ? previous : new Map([...previous, [value, row.rowNumber]]),
        };
      }, state.seen);

      const issues = [...row.issues, ...duplicates];
      const hasError = issues.some((entry) => entry.severity === 'error');

      return {
        seen,
        rows: [
          ...state.rows,
          {
            ...row,
            issues,
            status: hasError ? 'error' : issues.length > 0 ? 'warning' : 'ok',
          },
        ],
      };
    },
    { seen: {}, rows: [] },
  ).rows;

/** Validate every data row against the current column mapping. Pure. */
export const validateRows = ({ rows, mapping }) =>
  withDuplicateIssues(rows.map((cells, index) => buildRow(cells, mapping, index)));

/** Mapping-level problems that must be resolved before uploading. */
export const validateMapping = (mapping) => {
  const mapped = Object.values(mapping).filter((fieldKey) => Boolean(FIELDS_BY_KEY[fieldKey]));

  const missingRequired = REQUIRED_FIELD_KEYS.filter((key) => !mapped.includes(key)).map(
    (key) => FIELDS_BY_KEY[key].label,
  );

  const duplicateFields = [
    ...new Set(mapped.filter((key, index) => mapped.indexOf(key) !== index)),
  ].map((key) => FIELDS_BY_KEY[key].label);

  return {
    missingRequired,
    duplicateFields,
    mappedCount: mapped.length,
    isValid: missingRequired.length === 0 && duplicateFields.length === 0,
  };
};

/**
 * Conditionally mandatory fields that some rows need but no column feeds — the
 * per-row errors alone would not make the missing column obvious.
 */
export const unmappedRequiredFields = (validatedRows, mapping) => {
  const mapped = new Set(Object.values(mapping));

  return PROPERTY_FIELDS.filter((entry) => entry.requiredWhen && !mapped.has(entry.key))
    .map((entry) => ({
      label: entry.label,
      note: REQUIREMENT_NOTES[entry.key] ?? null,
      rowCount: validatedRows.filter((row) => isFieldRequired(entry, row.values)).length,
    }))
    .filter((entry) => entry.rowCount > 0);
};

export const summarize = (validatedRows) => {
  const errored = validatedRows.filter((row) => row.status === 'error').length;
  const warned = validatedRows.filter((row) => row.status === 'warning').length;

  return {
    total: validatedRows.length,
    valid: validatedRows.length - errored,
    warned,
    invalid: errored,
  };
};

/** CSV payload (headers + rows) describing every failed row, for download. */
export const buildErrorReport = (headers, failedRows) => ({
  headers: [...headers, 'Row', 'Errors'],
  rows: failedRows.map((row) => [
    ...headers.map((_, index) => row.cells[index] ?? ''),
    String(row.rowNumber),
    row.issues
      .filter((entry) => entry.severity === 'error')
      .map((entry) => `${FIELDS_BY_KEY[entry.field].label}: ${entry.message}`)
      .join(' | '),
  ]),
});
