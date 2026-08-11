/**
 * Minimal RFC-4180 CSV helpers. No dependency, runs fully in the browser.
 */

const DELIMITERS = [
  { char: '\t', label: 'Tab' },
  { char: ',', label: 'Comma' },
  { char: ';', label: 'Semicolon' },
];

/** Picks the delimiter that appears most in the header line — sheets often export as TSV. */
export const detectDelimiter = (text) => {
  const headerLine = text.replace(/^\uFEFF/, '').split(/\r?\n/)[0] ?? '';

  return DELIMITERS.reduce((best, candidate) => {
    const count = headerLine.split(candidate.char).length - 1;
    return count > best.count ? { ...candidate, count } : best;
  }, { ...DELIMITERS[1], count: 0 });
};

const splitCsv = (text, delimiter) => {
  const clean = text.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i];

    if (inQuotes) {
      if (char !== '"') {
        field += char;
      } else if (clean[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = false;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row = [...row, field];
      field = '';
    } else if (char === '\n') {
      rows.push([...row, field]);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    rows.push([...row, field]);
  }

  return rows;
};

const isBlankRow = (cells) => cells.every((cell) => cell.trim() === '');

/**
 * Parse delimited text into { headers, rows, delimiter } with trimmed cells and
 * blank rows dropped. `rows[i][j]` always aligns with `headers[j]`, padding short
 * lines with ''. Handles both comma- and tab-separated exports.
 */
export const parseCsvTable = (text) => {
  const delimiter = detectDelimiter(text);
  const table = splitCsv(text, delimiter.char).filter((cells) => !isBlankRow(cells));

  if (table.length === 0) {
    throw new Error('The file is empty. Add a header row and at least one data row.');
  }

  const [headerCells, ...dataCells] = table;
  const headers = headerCells.map((header) => header.trim());

  if (headers.every((header) => header === '')) {
    throw new Error('The first row must contain column names.');
  }

  if (dataCells.length === 0) {
    throw new Error('The file has a header row but no data rows.');
  }

  return {
    delimiter: delimiter.label,
    headers,
    rows: dataCells.map((cells) => headers.map((_, index) => (cells[index] ?? '').trim())),
  };
};

const escapeCell = (value) => {
  const text = value ?? '';
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsvText = (headers, rows) =>
  [headers, ...rows].map((cells) => cells.map(escapeCell).join(',')).join('\n');

export const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error(`Could not read "${file.name}". Try re-saving it as CSV.`));
    reader.readAsText(file);
  });

export const downloadCsv = (fileName, headers, rows) => {
  const blob = new Blob([toCsvText(headers, rows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
