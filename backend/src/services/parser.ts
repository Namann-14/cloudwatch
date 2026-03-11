import * as XLSX from 'xlsx';

export interface ParsedData {
  headers: string[];
  rows: Record<string, string | number>[];
  rawCsv: string;
}

/**
 * Parse a CSV or XLSX file buffer into structured data.
 * Uses SheetJS (xlsx) which handles both formats natively.
 */
export function parseFile(buffer: Buffer, originalName: string): ParsedData {
  const ext = originalName.split('.').pop()?.toLowerCase();

  let workbook: XLSX.WorkBook;

  if (ext === 'csv') {
    // Force text parsing for CSV
    workbook = XLSX.read(buffer, { type: 'buffer', raw: false });
  } else {
    workbook = XLSX.read(buffer, { type: 'buffer' });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('The uploaded file contains no sheets.');
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet, {
    defval: '',
  });

  if (rows.length === 0) {
    throw new Error('The uploaded file contains no data rows.');
  }

  const headers = Object.keys(rows[0]);

  // Convert back to CSV string for the LLM prompt
  const rawCsv = XLSX.utils.sheet_to_csv(sheet);

  return { headers, rows, rawCsv };
}
