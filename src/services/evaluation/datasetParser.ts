import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { normalizeFieldName, detectAmbiguities } from '../metrics/fieldNormalizer';

export async function parseDataset(file: File): Promise<any[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  return new Promise((resolve, reject) => {
    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            resolve(normalizeRows(results.data as any[]));
          } catch (e) {
            reject(e);
          }
        },
        error: (error) => reject(error)
      });
    } else if (extension === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(normalizeRows(json));
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (extension === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json)) {
            resolve(normalizeRows(json));
          } else {
            resolve(normalizeRows([json])); // Wrap object in array
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    } else {
      reject(new Error(`Unsupported file type: ${extension}`));
    }
  });
}

function normalizeRows(rows: any[]): any[] {
  if (rows.length === 0) return rows;
  
  // Check headers for ambiguities
  const columns = Object.keys(rows[0]);
  const ambiguities = detectAmbiguities(columns);
  if (ambiguities.length > 0) {
    const errorDetails = ambiguities.map(a => `'${a.field}': [${a.candidates.map(c => `'${c}'`).join(', ')}]`).join('; ');
    throw new Error(`Upload failed: Ambiguous columns detected for ${errorDetails}. Please remove or rename one.`);
  }

  return rows.map(row => {
    // Preserve all raw columns so governance/drift metrics have access to custom fields
    const normalizedRow: any = { ...row };
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = normalizeFieldName(key);
      if (normalizedKey) {
        normalizedRow[normalizedKey] = value;
      }
    }
    return normalizedRow;
  });
}
