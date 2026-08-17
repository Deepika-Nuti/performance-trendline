# Metric Inspection Inventory

## Findings

1. **Location:** `src/services/metrics/logmark/`
2. **`run_all.js`:** The file exists but is empty (0 bytes).
3. **`.golden` files:** No `.golden` files were found in the repository.

## Inventory

### 1. Attack Success Rate
- **Metric:** Attack Success Rate
- **Implementation file:** `src/services/metrics/logmark/attackSuccessRate.js`
- **Function:** `calculateAttackSuccessRate(successfulAttacks, totalAttackAttempts)` -> `number`
- **Required input 1:** `successfulAttacks` (number)
- **Required input 2:** `totalAttackAttempts` (number)
- **Input type:** Dataset-level aggregate
- **Current benchmark source:** None (`run_all.js` empty)
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Would need a way to identify which rows represent "attacks" and which of those are "successful".
- **Additional information required?:** Yes, the uploaded data must contain explicit labels or indicators of attacks and their success status.

### 2. Composite Auditability
- **Metric:** Composite Auditability
- **Implementation file:** `src/services/metrics/logmark/auditabilityLevel.js`
- **Function:** `calculateCompositeAuditability({ logFieldCompleteness, ledgerIntegrity, replayEquivalence, w1, w2, w3 })` -> `number`
- **Required input 1:** Configuration object with various scores and weights.
- **Input type:** Configuration / External-info
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** No
- **Required transformation:** N/A
- **Additional information required?:** Yes, requires external configuration and system-level audit metrics not typically found in row-level batch results.

### 3. Average Odds Difference (AOD)
- **Metric:** Average Odds Difference
- **Implementation file:** `src/services/metrics/logmark/averageOddsDifference.js`
- **Function:** `calculateAOD(uTP, uFP, uTN, uFN, pTP, pFP, pTN, pFN)` -> `number`
- **Required input 1:** Unprivileged and Privileged group confusion matrix counts.
- **Input type:** Group-based / Dataset-level aggregate
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Needs group demographics and true labels vs predicted labels.
- **Additional information required?:** Yes, requires demographic fields and ground truth labels.

### 4. Composite Bias Index
- **Metric:** Composite Bias Index
- **Implementation file:** `src/services/metrics/logmark/biasIndex.js`
- **Function:** `calculateCompositeBiasIndex({ disparateImpactRatio, demographicParityDifference, embeddingCosineSkew, w1, w2, w3 })` -> `number`
- **Required input 1:** Configuration object with sub-metric scores and weights.
- **Input type:** Configuration / Aggregate
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** No
- **Required transformation:** N/A
- **Additional information required?:** Yes, requires prior calculation of sub-metrics and configuration weights.

### 5. Utility Weighted Efficacy
- **Metric:** Utility Weighted Efficacy
- **Implementation file:** `src/services/metrics/logmark/biasMitigation.js`
- **Function:** `calculateUtilityWeightedEfficacy(mitigationEfficacyIndex, utilityRaw, utilityMitigated)` -> `number`
- **Required input 1:** `mitigationEfficacyIndex`, `utilityRaw`, `utilityMitigated`
- **Input type:** Configuration / Aggregate
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** No
- **Required transformation:** N/A
- **Additional information required?:** Yes, requires mitigation context not present in standard uploads.

### 6. BLEU
- **Metric:** BLEU
- **Implementation file:** `src/services/metrics/logmark/bleu.js`
- **Function:** `calculateBLEU(candidate, reference)` -> `number`
- **Required input 1:** `candidate` (string)
- **Required input 2:** `reference` (string)
- **Input type:** Row-level
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Yes
- **Required transformation:** Extract `candidate` and `reference` strings from normalized row fields.
- **Additional information required?:** No, assuming basic Q&A structure in upload.

### 7. Composite Compliance Adaptability
- **Metric:** Composite Compliance Adaptability
- **Implementation file:** `src/services/metrics/logmark/complianceAdaptability.js`
- **Function:** `calculateCompositeComplianceAdaptability({ policyDecouplingRatio, policyPropagationLatencyScore, unlearningEfficiency, w1, w2, w3 })` -> `number`
- **Required input 1:** Configuration object
- **Input type:** Configuration
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** No
- **Required transformation:** N/A
- **Additional information required?:** Yes, needs system architecture metrics.

### 8. Custom Drift
- **Metric:** Custom Drift
- **Implementation file:** `src/services/metrics/logmark/customDrift.js`
- **Function:** `calculateCustomDrift(expectedDistribution, actualDistribution)` -> `number`
- **Required input 1:** `expectedDistribution`
- **Required input 2:** `actualDistribution`
- **Input type:** Distribution
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Calculate `actualDistribution` from batch.
- **Additional information required?:** Yes, requires `expectedDistribution` baseline.

### 9. Data Drift
- **Metric:** Data Drift
- **Implementation file:** `src/services/metrics/logmark/dataDrift.js`
- **Function:** `calculateDataDrift(expectedDistribution, actualDistribution)` -> `number`
- **Required input 1:** `expectedDistribution`
- **Required input 2:** `actualDistribution`
- **Input type:** Distribution
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Calculate `actualDistribution` from batch.
- **Additional information required?:** Yes, requires baseline expected distribution.

### 10. Disparate Impact (DI)
- **Metric:** Disparate Impact
- **Implementation file:** `src/services/metrics/logmark/disparateImpact.js`
- **Function:** `calculateDI(unprivSelected, unprivTotal, privSelected, privTotal)` -> `number`
- **Required input 1:** Selection counts for privileged and unprivileged groups
- **Input type:** Group-based / Dataset-level aggregate
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Requires demographic attributes and selection outcomes.
- **Additional information required?:** Yes, group metadata.

### 11. Equal Opportunity Difference (EOD)
- **Metric:** Equal Opportunity Difference
- **Implementation file:** `src/services/metrics/logmark/equalOpportunityDifference.js`
- **Function:** `calculateEOD(unprivTP, unprivQual, privTP, privQual)` -> `number`
- **Required input 1:** True positive and qualified counts by group
- **Input type:** Group-based / Dataset-level aggregate
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Requires group metadata and ground truth labels.
- **Additional information required?:** Yes, group metadata.

### 12. Model Drift
- **Metric:** Model Drift
- **Implementation file:** `src/services/metrics/logmark/modelDrift.js`
- **Function:** `calculateModelDrift(baselinePerformance, currentPerformance)` -> `number`
- **Required input 1:** `baselinePerformance`
- **Required input 2:** `currentPerformance`
- **Input type:** Historical / Distribution
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Calculate `currentPerformance`.
- **Additional information required?:** Yes, requires historical baseline performance.

### 13. Perplexity
- **Metric:** Perplexity
- **Implementation file:** `src/services/metrics/logmark/perplexity.js`
- **Function:** `calculatePerplexity(logProbabilities)` -> `number`
- **Required input 1:** `logProbabilities` (array/list)
- **Input type:** Row-level or Dataset-level
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Extract `logProbabilities` if provided by the model in the dataset.
- **Additional information required?:** Yes, requires the model to have output log probabilities, which is rare in simple CSV uploads.

### 14. Composite Privacy Integrity
- **Metric:** Composite Privacy Integrity
- **Implementation file:** `src/services/metrics/logmark/privacyIntegrity.js`
- **Function:** `calculateCompositePrivacyIntegrity({ leakageScore, membershipInferenceAdvantage, epsilon, epsilonTarget, wLeak, wMIA, wDP })` -> `number`
- **Required input 1:** Configuration object with privacy metrics.
- **Input type:** Configuration
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** No
- **Required transformation:** N/A
- **Additional information required?:** Yes, requires external privacy analysis.

### 15. Provenance Completeness
- **Metric:** Provenance Completeness
- **Implementation file:** `src/services/metrics/logmark/provenanceCompleteness.js`
- **Function:** `calculateProvenanceCompletenessScore({ entailmentIndicators, citationIndicators, alpha })` -> `number`
- **Required input 1:** `entailmentIndicators`, `citationIndicators`
- **Input type:** Row-level / Aggregate
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Needs citation/entailment analysis per row.
- **Additional information required?:** Yes, requires specific citation fields.

### 16. Reasoning Correctness (RC)
- **Metric:** Reasoning Correctness
- **Implementation file:** `src/services/metrics/logmark/reasoningCorrectness.js`
- **Function:** `calculateRC(llmSteps, goldSteps)` -> `number`
- **Required input 1:** `llmSteps`
- **Required input 2:** `goldSteps`
- **Input type:** Row-level
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Needs step-by-step reasoning extraction.
- **Additional information required?:** Yes, requires dataset to have intermediate steps.

### 17. ROUGE (N, L, S)
- **Metric:** ROUGE
- **Implementation file:** `src/services/metrics/logmark/rouge.js`
- **Function:** `rougeN(candidate, reference, n)`, `rougeL(candidate, reference)`, `rougeS(candidate, reference)` -> `{ recall, precision, f1 }`
- **Required input 1:** `candidate` (string)
- **Required input 2:** `reference` (string)
- **Input type:** Row-level
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Yes
- **Required transformation:** Extract `candidate` and `reference` strings.
- **Additional information required?:** No.

### 18. Statistical Parity Difference (SPD)
- **Metric:** Statistical Parity Difference
- **Implementation file:** `src/services/metrics/logmark/statisticalParityDifference.js`
- **Function:** `calculateSPD(unprivSelected, unprivTotal, privSelected, privTotal)` -> `number`
- **Required input 1:** Selection counts by group
- **Input type:** Group-based / Dataset-level aggregate
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Requires demographics and selections.
- **Additional information required?:** Yes, group metadata.

### 19. Stepwise Integrity (SI)
- **Metric:** Stepwise Integrity
- **Implementation file:** `src/services/metrics/logmark/stepwiseIntegrity.js`
- **Function:** `calculateSI(steps)` -> `number`
- **Required input 1:** `steps`
- **Input type:** Row-level
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Needs step arrays.
- **Additional information required?:** Yes.

### 20. Traceability Explainability (TE)
- **Metric:** Traceability Explainability
- **Implementation file:** `src/services/metrics/logmark/traceabilityExplainability.js`
- **Function:** `calculateTE(steps)` -> `number`
- **Required input 1:** `steps`
- **Input type:** Row-level
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Needs step arrays.
- **Additional information required?:** Yes.

### 21. Transparency Score (TS)
- **Metric:** Transparency Score
- **Implementation file:** `src/services/metrics/logmark/transparencyScore.js`
- **Function:** `calculateTS(factors)` -> `number`
- **Required input 1:** `factors`
- **Input type:** Configuration / Dataset-level
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Needs transparency factors.
- **Additional information required?:** Yes.

### 22. TruthfulQA
- **Metric:** TruthfulQA
- **Implementation file:** `src/services/metrics/logmark/truthfulQA.js`
- **Function:** `calculateTruthfulQA(truthfulResponses, totalResponses)` -> `number`
- **Required input 1:** `truthfulResponses`
- **Required input 2:** `totalResponses`
- **Input type:** Dataset-level aggregate
- **Current benchmark source:** None
- **Can derive from uploaded batch results?:** Partially
- **Required transformation:** Count total vs truthful responses.
- **Additional information required?:** Yes, requires a boolean `is_truthful` column or equivalent.
