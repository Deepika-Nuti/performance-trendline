const fs = require('fs');

let c = fs.readFileSync('src/services/evaluation/registry.ts', 'utf8');

// Strip all previous logmark imports
c = c.replace(/import \* as \w+ from '\.\.\/metrics\/logmark\/\w+\.js';\n/g, '');

const newImports = `import { 
  rouge1, rougeL, rouge2, precision, recall, f1Score, bleu, semanticSimilarity, wer, faithfulness, hallucinationFlag, completenessFlag, accuracy, rowOverall, aggregateOverall,
  calculateBLEU, rougeN, rougeS, calculatePerplexity, calculateTruthfulQA, calculateAttackSuccessRate, calculateDataDrift, evaluateCustomDrift, calculateCustomDrift, calculateModelDrift,
  calculateSPD, calculateDI, calculateEOD, calculateAOD, calculateRC, calculateSI, calculateTE, calculateTS,
  calculateUtilityWeightedEfficacy, calculateDIR_mitigation, calculateEqualizedOddsVariance, calculateMitigationEfficacyIndex,
  calculateCompositeBiasIndex, calculateDIR_biasIndex, calculateDemographicParityDifference, calculateEmbeddingCosineSkew,
  calculateCompositePrivacyIntegrity, calculateLeakageScore, checkDifferentialPrivacyGuarantee, calculateMembershipInferenceAdvantage,
  calculateProvenanceCompletenessScore, calculateBaseProvenanceScore,
  calculateCompositeAuditability, calculateLogFieldCompleteness, calculateLedgerIntegrity, calculateReplayEquivalence,
  calculateCompositeComplianceAdaptability, calculatePolicyDecouplingRatio, calculatePolicyPropagationLatencyScore, calculateUnlearningEfficiency
} from '../metrics/logmark/index.js';\n\n`;

fs.writeFileSync('src/services/evaluation/registry.ts', newImports + c);
console.log('Fixed imports!');
