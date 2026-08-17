const fs = require('fs');
let c = fs.readFileSync('src/services/evaluation/registry.ts', 'utf8');

const missingBlock = `  {
    id: 'attack-success-rate', name: 'Attack Success Rate', category: 'Safety', implementation: calculateAttackSuccessRate, inputBuilder: buildAttackSuccessRateInputs, type: 'aggregate'
  },
  {
    id: 'data-drift', name: 'Data Drift', category: 'Drift', implementation: calculateDataDrift, inputBuilder: (rows: any, ctx: any) => buildDataDriftInputs(ctx, null), type: 'distribution'
  },
  {
    id: 'custom-drift', name: 'Custom Drift', category: 'Drift', implementation: evaluateCustomDrift || calculateCustomDrift, inputBuilder: (rows: any, ctx: any) => buildDataDriftInputs(ctx, null), type: 'distribution'
  },
  {
    id: 'model-drift', name: 'Model Drift', category: 'Drift', implementation: calculateModelDrift, inputBuilder: (rows: any, ctx: any) => buildModelDriftInputs(null, ctx.previousRuns), type: 'historical'
  },
  {
    id: 'statistical-parity-difference', name: 'Statistical Parity Difference', category: 'Fairness', implementation: calculateSPD, inputBuilder: buildFairnessInputs, type: 'group/aggregate'
  },
`;

c = c.replace(/\{\s*id: 'disparate-impact'/, missingBlock + "  {\n    id: 'disparate-impact'");

fs.writeFileSync('src/services/evaluation/registry.ts', c);
console.log('Restored missing blocks!');
