import { normalizeFieldName } from '../metrics/fieldNormalizer';

export interface NormalizedRow {
  generated_text?: string;
  reference_text?: string;
  question?: string;
  raw: any;
}

export function normalizeField(row: any, canonicalField: string): any {
  // If the exact canonical field exists, use it
  if (row.hasOwnProperty(canonicalField)) return row[canonicalField];

  // Map known registry inputs to fieldNormalizer canonicals
  const canonicalMap: Record<string, string> = {
    'generated_text': 'candidate',
    'reference_text': 'reference',
    'question': 'inputPrompt'
  };

  const targetCanonical = canonicalMap[canonicalField] || canonicalField;

  // Search through the row's keys to find one that normalizes to the target canonical field
  for (const key of Object.keys(row)) {
    const norm = normalizeFieldName(key);
    if (norm === targetCanonical) {
      return row[key];
    }
  }

  return undefined;
}

export function normalizeRow(row: any): NormalizedRow {
  return {
    generated_text: normalizeField(row, 'generated_text'),
    reference_text: normalizeField(row, 'reference_text'),
    question: normalizeField(row, 'question'),
    raw: row
  };
}

export function normalizeDataset(rows: any[]): NormalizedRow[] {
  return rows.map(normalizeRow);
}
