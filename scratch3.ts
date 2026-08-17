import { NormalizedRow, BuilderResult } from '../../types/evaluation';

export function buildReasoningInputs(normalizedRows: NormalizedRow[]): BuilderResult {
  const inputs: any[] = [];
  
  for (const row of normalizedRows) {
    const rawReasoning = row.raw['GA_Reasoning'] || row.raw['ga_reasoning'];
    let llmSteps: any[] | undefined = row.raw.llm_steps;
    
    if (!llmSteps && typeof rawReasoning === 'string') {
      const stepRegex = /Step \d+ — (.*?)(?=Step \d+ — |$)/gs;
      let match;
      const parsedSteps: any[] = [];
      
      while ((match = stepRegex.exec(rawReasoning)) !== null) {
        const text = match[1].trim();
        const hasJustification = /(section \d+|act|code|article \d+|under the)/i.test(text);
        parsedSteps.push({ text, hasJustification });
      }
      
      if (parsedSteps.length > 0) {
        llmSteps = parsedSteps;
        row.raw.llm_steps = parsedSteps;
      }
    }
    
    if (llmSteps) {
      inputs.push({
        h: llmSteps, // Array of objects
        r: row.raw.gold_steps || undefined
      });
    }
  }
  
  if (inputs.length === 0) {
    return { status: 'not_available', reason: 'requires llm_steps or GA_Reasoning column.' };
  }
  
  return { status: 'available', inputs };
}
