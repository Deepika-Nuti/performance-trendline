import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { EvaluationRun } from '../../types/evaluation';
import { runEvaluation } from './runner';

export interface BatchUploadResult {
  run: EvaluationRun;
  requiresDisambiguation: boolean;
  ambiguities?: Array<{ field: string; candidates: string[] }>;
}

export async function processBatchUpload(
  file: File,
  modelName: string,
  modelVersion: string,
  datasetName: string
): Promise<BatchUploadResult> {
  const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  const isJson = file.name.endsWith('.json');

  return new Promise(async (resolve, reject) => {
    try {
      let rawRows: any[] = [];

      if (isXlsx) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        await processRows(rawRows);
      } else if (isJson) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const json = JSON.parse(e.target?.result as string);
            if (Array.isArray(json)) {
              await processRows(json);
            } else {
              await processRows([json]);
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      } else {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            await processRows(results.data);
          },
          error: (e) => reject(e)
        });
      }

      async function processRows(rows: any[]) {
        try {
          // Call the v2 ground-truth engine to normalize, build inputs, evaluate, and save.
          const run = await runEvaluation(datasetName, rows, modelName, modelVersion);
          
          // Inject UI-requested overrides that the engine currently mocks
          run.metadata.uploadedFileName = file.name;

          resolve({
            run,
            requiresDisambiguation: false, // Disambiguation not requested in phase 3 scope
          });
        } catch (e) {
          reject(e);
        }
      }
    } catch (e) {
      reject(e);
    }
  });
}
