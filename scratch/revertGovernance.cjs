const fs = require('fs');

let inputBuildersContent = fs.readFileSync('src/services/evaluation/inputBuilders.ts', 'utf8');
inputBuildersContent = inputBuildersContent.replace(/export function buildDynamicGovernanceInputs[\s\S]*/, '');
fs.writeFileSync('src/services/evaluation/inputBuilders.ts', inputBuildersContent, 'utf8');

let registryContent = fs.readFileSync('src/services/evaluation/registry.ts', 'utf8');
registryContent = registryContent.replace(/buildDynamicGovernanceInputs,/g, '');

registryContent = registryContent.replace(
  /id: 'bias-mitigation'[\s\S]*?inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'/g,
  `id: 'bias-mitigation', name: 'Bias Mitigation', category: 'Governance',
    implementation: (args: any) => {
      const dir = calculateDIR_mitigation(args?.favorableRateUnprivileged || 0.4, args?.favorableRatePrivileged || 0.5);
      const eqOdds = calculateEqualizedOddsVariance({ tprGroup0: args?.tprGroup0 || 0.8, tprGroup1: args?.tprGroup1 || 0.85, fprGroup0: args?.fprGroup0 || 0.1, fprGroup1: args?.fprGroup1 || 0.12 });
      const efficacy = calculateMitigationEfficacyIndex(args?.tprGroup0 || 0.2, args?.fprGroup0 || 0.1);
      const value = calculateUtilityWeightedEfficacy(efficacy, args?.tprGroup1 || 0.9, args?.fprGroup1 || 0.88);
      return { value, details: { DIR: dir, equalizedOddsVariance: eqOdds, mitigationEfficacyIndex: efficacy } };
    },
    inputBuilder: buildUnavailableInput('requires protected-attribute labels and historical outcome data, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'`
);

registryContent = registryContent.replace(
  /id: 'bias-index'[\s\S]*?inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'/g,
  `id: 'bias-index', name: 'Bias Index', category: 'Governance',
    implementation: (args: any) => {
      const dir = calculateDIR_biasIndex(args?.favorableRateUnprivileged || 0.4, args?.favorableRatePrivileged || 0.5);
      const dpd = calculateDemographicParityDifference(args?.favorableRateUnprivileged || 0.4, args?.favorableRatePrivileged || 0.5);
      const skew = calculateEmbeddingCosineSkew([1, 0, 0], [[1, 0, 0]], [[0, 1, 0]]);
      const value = calculateCompositeBiasIndex({ disparateImpactRatio: dir, demographicParityDifference: dpd, embeddingCosineSkew: skew, w1: 0.33, w2: 0.33, w3: 0.34 });
      return { value, details: { DIR: dir, demographicParityDifference: dpd, embeddingCosineSkew: skew } };
    },
    inputBuilder: buildUnavailableInput('requires protected-attribute labels, outcome data, and vector embeddings, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'`
);

registryContent = registryContent.replace(
  /id: 'privacy-integrity'[\s\S]*?inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'/g,
  `id: 'privacy-integrity', name: 'Privacy Integrity', category: 'Governance',
    implementation: (args: any) => {
      const leakage = calculateLeakageScore({ unmaskedTokenCount: args?.unmaskedTokenCount || 5, totalTokenCount: args?.totalTokenCount || 100, successfulAttackCount: 1, totalAttackCount: 50 });
      const dp = checkDifferentialPrivacyGuarantee({ probOutputGivenD: 0.1, probOutputGivenDPrime: 0.05, epsilon: 1.0, delta: 1e-5 });
      const mia = calculateMembershipInferenceAdvantage(0.55);
      const value = calculateCompositePrivacyIntegrity({ leakageScore: leakage, membershipInferenceAdvantage: mia, epsilon: 1.0, epsilonTarget: 1.0, wLeak: 0.4, wMIA: 0.3, wDP: 0.3 });
      return { value, details: { leakageScore: leakage, differentialPrivacy: dp, membershipInferenceAdvantage: mia } };
    },
    inputBuilder: buildUnavailableInput('requires differential-privacy configuration and attack simulation logs, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'`
);

registryContent = registryContent.replace(
  /id: 'provenance-completeness'[\s\S]*?inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'/g,
  `id: 'provenance-completeness', name: 'Provenance Completeness', category: 'Governance',
    implementation: (args: any) => {
      const ei = args?.entailmentIndicators || [1, 1, 0, 1];
      const ci = args?.citationIndicators || [1, 0, 0, 1];
      const base = calculateBaseProvenanceScore(ei);
      const value = calculateProvenanceCompletenessScore({ entailmentIndicators: ei, citationIndicators: ci, alpha: 0.5 });
      return { value, details: { baseProvenanceScore: base } };
    },
    inputBuilder: buildUnavailableInput('requires structured citation array and source corpus entailment indicators, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'`
);

registryContent = registryContent.replace(
  /id: 'auditability-level'[\s\S]*?inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'/g,
  `id: 'auditability-level', name: 'Auditability Level', category: 'Governance',
    implementation: (args: any) => {
      const logField = calculateLogFieldCompleteness(args?.logFieldCompleteness || [[true, true], [true, false]]);
      const ledger = calculateLedgerIntegrity(args?.ledgerElements || ["a", "b"], args?.ledgerElements || ["hash1", "hash2"]);
      const replay = calculateReplayEquivalence(args?.replayEquivalence || [0.9, 0.95]);
      const value = calculateCompositeAuditability({ logFieldCompleteness: logField, ledgerIntegrity: 0.5, replayEquivalence: replay, w1: 0.33, w2: 0.33, w3: 0.34 });
      return { value, details: { logFieldCompleteness: logField, ledgerIntegrity: ledger, replayEquivalence: replay } };
    },
    inputBuilder: buildUnavailableInput('requires structured audit log with hash-chain data, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'`
);

registryContent = registryContent.replace(
  /id: 'compliance-adaptability'[\s\S]*?inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'/g,
  `id: 'compliance-adaptability', name: 'Compliance Adaptability', category: 'Governance',
    implementation: (args: any) => {
      const decouple = calculatePolicyDecouplingRatio(args?.policyDecouplingRatio || 10, 2);
      const latency = calculatePolicyPropagationLatencyScore(args?.latency || 120, 100);
      const unlearn = calculateUnlearningEfficiency({ unlearningCompleteness: 0.9, selectiveUnlearnCost: 50, fullRetrainingCost: 1000 });
      const value = calculateCompositeComplianceAdaptability({ policyDecouplingRatio: decouple, policyPropagationLatencyScore: latency, unlearningEfficiency: unlearn, w1: 0.33, w2: 0.33, w3: 0.34 });
      return { value, details: { policyDecouplingRatio: decouple, policyPropagationLatencyScore: latency, unlearningEfficiency: unlearn } };
    },
    inputBuilder: buildUnavailableInput('requires system policy latency configuration and unlearning efficiency data, not present in this batch'), higherIsBetter: true, excludeFromVerdict: true, type: 'configuration'`
);

if (!registryContent.includes('buildUnavailableInput,')) {
    registryContent = registryContent.replace(/buildGovernanceInputs,/g, 'buildGovernanceInputs,\n    buildUnavailableInput,');
}

fs.writeFileSync('src/services/evaluation/registry.ts', registryContent, 'utf8');
