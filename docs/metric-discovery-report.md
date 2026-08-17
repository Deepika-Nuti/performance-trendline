# Metric Discovery Report

This report documents the exact metric implementations found in `src/services/metrics/logmark/`. This serves as the source of truth for the MetricRegistry.

## Files Classified as Runners, Helpers, or Tests
- `base-test.js` - Test
- `smoke-test.js` - Test
- `index.js` - Barrel file
- `run_all.js` - Runner
- `datasetEvaluator.js` - Helper/Runner for evaluating QA datasets
- `guideMetrics.js` - Helper/Bundle containing guide-specific metrics and tokenizers

## Genuine Metric Implementations

### 1. Attack Success Rate
- **File**: `attackSuccessRate.js`
- **Function**: `calculateAttackSuccessRate(successfulAttacks, totalAttackAttempts)`
- **Signature**: `(successfulAttacks: number, totalAttackAttempts: number) => number`
- **Required Inputs**: `successfulAttacks`, `totalAttackAttempts`
- **Input Type**: historical/aggregate (based on attack attempts)
- **Returns**: number (0 to 1)

### 2. Auditability Level
- **File**: `auditabilityLevel.js`
- **Function**: `calculateCompositeAuditability({ logFieldCompleteness, ledgerIntegrity, replayEquivalence, w1, w2, w3 })`
- **Signature**: `({ logFieldCompleteness: number, ledgerIntegrity: number, replayEquivalence: number, w1: number, w2: number, w3: number }) => number`
- **Required Inputs**: `logFieldCompleteness`, `ledgerIntegrity`, `replayEquivalence`, `w1`, `w2`, `w3`
- **Input Type**: aggregate/configuration
- **Returns**: number (0 to 1)

### 3. Average Odds Difference
- **File**: `averageOddsDifference.js`
- **Function**: `calculateAOD(uTP, uFP, uTN, uFN, pTP, pFP, pTN, pFN)`
- **Signature**: `(uTP: number, uFP: number, uTN: number, uFN: number, pTP: number, pFP: number, pTN: number, pFN: number) => number`
- **Required Inputs**: `uTP`, `uFP`, `uTN`, `uFN`, `pTP`, `pFP`, `pTN`, `pFN`
- **Input Type**: aggregate (confusion matrix values)
- **Returns**: number

### 4. Bias Index
- **File**: `biasIndex.js`
- **Function**: `calculateCompositeBiasIndex({ disparateImpactRatio, demographicParityDifference, embeddingCosineSkew, w1, w2, w3 })`
- **Signature**: `({ disparateImpactRatio: number, demographicParityDifference: number, embeddingCosineSkew: number, w1: number, w2: number, w3: number }) => number`
- **Required Inputs**: `disparateImpactRatio`, `demographicParityDifference`, `embeddingCosineSkew`, `w1`, `w2`, `w3`
- **Input Type**: aggregate/configuration
- **Returns**: number

### 5. Bias Mitigation
- **File**: `biasMitigation.js`
- **Function**: `calculateUtilityWeightedEfficacy(mitigationEfficacyIndex, utilityRaw, utilityMitigated)`
- **Signature**: `(mitigationEfficacyIndex: number, utilityRaw: number, utilityMitigated: number) => number`
- **Required Inputs**: `mitigationEfficacyIndex`, `utilityRaw`, `utilityMitigated`
- **Input Type**: aggregate
- **Returns**: number (0 to 1)

### 6. BLEU
- **File**: `bleu.js`
- **Function**: `calculateBLEU(candidate, reference)`
- **Signature**: `(candidate: string, reference: string) => number`
- **Required Inputs**: `candidate`, `reference`
- **Input Type**: row-level
- **Returns**: number

### 7. Compliance Adaptability
- **File**: `complianceAdaptability.js`
- **Function**: `calculateCompositeComplianceAdaptability({ policyDecouplingRatio, policyPropagationLatencyScore, unlearningEfficiency, w1, w2, w3 })`
- **Signature**: `({ policyDecouplingRatio: number, policyPropagationLatencyScore: number, unlearningEfficiency: number, w1: number, w2: number, w3: number }) => number`
- **Required Inputs**: `policyDecouplingRatio`, `policyPropagationLatencyScore`, `unlearningEfficiency`, `w1`, `w2`, `w3`
- **Input Type**: aggregate/configuration
- **Returns**: number (0 to 1)

### 8. Custom Drift
- **File**: `customDrift.js`
- **Function**: `calculateCustomDrift(expectedDistribution, actualDistribution)`
- **Signature**: `(expectedDistribution: number[], actualDistribution: number[]) => number`
- **Required Inputs**: `expectedDistribution`, `actualDistribution`
- **Input Type**: distribution
- **Returns**: number (PSI score)

### 9. Data Drift
- **File**: `dataDrift.js`
- **Function**: `calculateDataDrift(expectedDistribution, actualDistribution)`
- **Signature**: `(expectedDistribution: number[], actualDistribution: number[]) => number`
- **Required Inputs**: `expectedDistribution`, `actualDistribution`
- **Input Type**: distribution
- **Returns**: number (PSI score)

### 10. Disparate Impact
- **File**: `disparateImpact.js`
- **Function**: `calculateDI(unprivSelected, unprivTotal, privSelected, privTotal)`
- **Signature**: `(unprivSelected: number, unprivTotal: number, privSelected: number, privTotal: number) => number`
- **Required Inputs**: `unprivSelected`, `unprivTotal`, `privSelected`, `privTotal`
- **Input Type**: aggregate
- **Returns**: number

### 11. Equal Opportunity Difference
- **File**: `equalOpportunityDifference.js`
- **Function**: `calculateEOD(unprivTP, unprivQual, privTP, privQual)`
- **Signature**: `(unprivTP: number, unprivQual: number, privTP: number, privQual: number) => number`
- **Required Inputs**: `unprivTP`, `unprivQual`, `privTP`, `privQual`
- **Input Type**: aggregate
- **Returns**: number

### 12. Model Drift
- **File**: `modelDrift.js`
- **Function**: `calculateModelDrift(baselinePerformance, currentPerformance)`
- **Signature**: `(baselinePerformance: number, currentPerformance: number) => number`
- **Required Inputs**: `baselinePerformance`, `currentPerformance`
- **Input Type**: aggregate/historical
- **Returns**: number (percentage)

### 13. Perplexity
- **File**: `perplexity.js`
- **Function**: `calculatePerplexity(logProbabilities)`
- **Signature**: `(logProbabilities: number[]) => number`
- **Required Inputs**: `logProbabilities`
- **Input Type**: row-level/aggregate (requires logprobs derived from text)
- **Returns**: number

### 14. Privacy Integrity
- **File**: `privacyIntegrity.js`
- **Function**: `calculateCompositePrivacyIntegrity({ leakageScore, membershipInferenceAdvantage, epsilon, epsilonTarget, wLeak, wMIA, wDP })`
- **Signature**: `({ leakageScore: number, membershipInferenceAdvantage: number, epsilon: number, epsilonTarget: number, wLeak: number, wMIA: number, wDP: number }) => number`
- **Required Inputs**: `leakageScore`, `membershipInferenceAdvantage`, `epsilon`, `epsilonTarget`, `wLeak`, `wMIA`, `wDP`
- **Input Type**: aggregate/configuration
- **Returns**: number (0 to 1)

### 15. Provenance Completeness
- **File**: `provenanceCompleteness.js`
- **Function**: `calculateProvenanceCompletenessScore({ entailmentIndicators, citationIndicators, alpha })`
- **Signature**: `({ entailmentIndicators: number[], citationIndicators: number[], alpha: number }) => number`
- **Required Inputs**: `entailmentIndicators`, `citationIndicators`, `alpha`
- **Input Type**: aggregate/row-level array
- **Returns**: number (0 to 1)

### 16. Reasoning Correctness
- **File**: `reasoningCorrectness.js`
- **Function**: `calculateRC(llmSteps, goldSteps)`
- **Signature**: `(llmSteps: string[], goldSteps: string[]) => number`
- **Required Inputs**: `llmSteps`, `goldSteps`
- **Input Type**: row-level
- **Returns**: number (0 to 1)

### 17. ROUGE-N
- **File**: `rouge.js`
- **Function**: `rougeN(candidate, reference, n)`
- **Signature**: `(candidate: string, reference: string, n: number) => { recall: number, precision: number, f1: number }`
- **Required Inputs**: `candidate`, `reference`, `n`
- **Input Type**: row-level
- **Returns**: object with recall, precision, f1

### 18. ROUGE-L
- **File**: `rouge.js`
- **Function**: `rougeL(candidate, reference)`
- **Signature**: `(candidate: string, reference: string) => { recall: number, precision: number, f1: number }`
- **Required Inputs**: `candidate`, `reference`
- **Input Type**: row-level
- **Returns**: object with recall, precision, f1

### 19. ROUGE-S
- **File**: `rouge.js`
- **Function**: `rougeS(candidate, reference)`
- **Signature**: `(candidate: string, reference: string) => { recall: number, precision: number, f1: number }`
- **Required Inputs**: `candidate`, `reference`
- **Input Type**: row-level
- **Returns**: object with recall, precision, f1

### 20. Statistical Parity Difference
- **File**: `statisticalParityDifference.js`
- **Function**: `calculateSPD(unprivSelected, unprivTotal, privSelected, privTotal)`
- **Signature**: `(unprivSelected: number, unprivTotal: number, privSelected: number, privTotal: number) => number`
- **Required Inputs**: `unprivSelected`, `unprivTotal`, `privSelected`, `privTotal`
- **Input Type**: aggregate
- **Returns**: number

### 21. Stepwise Integrity
- **File**: `stepwiseIntegrity.js`
- **Function**: `calculateSI(steps)`
- **Signature**: `(steps: { logicallyValid: boolean, factuallyCorrect: boolean }[]) => number`
- **Required Inputs**: `steps`
- **Input Type**: row-level
- **Returns**: number (0 to 1)

### 22. Traceability Explainability
- **File**: `traceabilityExplainability.js`
- **Function**: `calculateTE(steps)`
- **Signature**: `(steps: { hasJustification: boolean }[]) => number`
- **Required Inputs**: `steps`
- **Input Type**: row-level
- **Returns**: number (0 to 1)

### 23. Transparency Score
- **File**: `transparencyScore.js`
- **Function**: `calculateTS(factors)`
- **Signature**: `(factors: { score: number, weight: number }[]) => number`
- **Required Inputs**: `factors`
- **Input Type**: aggregate
- **Returns**: number (0 to 1)

### 24. TruthfulQA
- **File**: `truthfulQA.js`
- **Function**: `calculateTruthfulQA(truthfulResponses, totalResponses)`
- **Signature**: `(truthfulResponses: number, totalResponses: number) => number`
- **Required Inputs**: `truthfulResponses`, `totalResponses`
- **Input Type**: aggregate
- **Returns**: number (0 to 1)
