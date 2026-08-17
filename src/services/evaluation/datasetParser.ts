import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { normalizeFieldName } from '../metrics/fieldNormalizer';

export async function parseDataset(file: File): Promise<any[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  return new Promise((resolve, reject) => {
    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(normalizeRows(results.data as any[])),
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
  return rows.map(row => {
    const normalizedRow: any = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = normalizeFieldName(key);
      if (normalizedKey) {
        normalizedRow[normalizedKey] = value;
      }
    }
    return normalizedRow;
  });
}
