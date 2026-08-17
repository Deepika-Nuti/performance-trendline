const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../../src/services/evaluation/registry.ts');
let content = fs.readFileSync(file, 'utf8');

// Add the import if not exists
if (!content.includes('buildDynamicGovernanceInputs')) {
  content = content.replace(
    /buildGovernanceInputs,/g,
    'buildGovernanceInputs,\n  buildDynamicGovernanceInputs,'
  );
}

// Replace Bias Mitigation
content = content.replace(
  /id: 'bias-mitigation'[\s\S]*?inputBuilder: \(\) => \(\{ status: 'calculated', inputs: \{\} \}\)[\s\S]*?type: 'group\/historical'/g,
  `id: 'bias-mitigation', name: 'Bias Mitigation', category: 'Governance',
    implementation: (args: any) => {
      const dir = calculateDIR_mitigation(args?.favorableRateUnprivileged || 0.4, args?.favorableRatePrivileged || 0.5);
      const eqOdds = calculateEqualizedOddsVariance({ tprGroup0: args?.tprGroup0 || 0.8, tprGroup1: args?.tprGroup1 || 0.85, fprGroup0: args?.fprGroup0 || 0.1, fprGroup1: args?.fprGroup1 || 0.12 });
      const efficacy = calculateMitigationEfficacyIndex(0.2, 0.1);
      const value = calculateUtilityWeightedEfficacy(efficacy, 0.9, 0.88);
      return { value, details: { DIR: dir, equalizedOddsVariance: eqOdds, mitigationEfficacyIndex: efficacy, args } };
    },
    inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'`
);

// Replace Bias Index
content = content.replace(
  /id: 'bias-index'[\s\S]*?inputBuilder: \(\) => \(\{ status: 'calculated', inputs: \{\} \}\)[\s\S]*?type: 'group\/configuration'/g,
  `id: 'bias-index', name: 'Bias Index', category: 'Governance',
    implementation: (args: any) => {
      const dir = calculateDIR_biasIndex(args?.favorableRateUnprivileged || 0.4, args?.favorableRatePrivileged || 0.5);
      const dpd = calculateDemographicParityDifference(args?.favorableRateUnprivileged || 0.4, args?.favorableRatePrivileged || 0.5);
      const skew = calculateEmbeddingCosineSkew([1, 0, 0], [[1, 0, 0]], [[0, 1, 0]]);
      const value = calculateCompositeBiasIndex({ disparateImpactRatio: dir, demographicParityDifference: dpd, embeddingCosineSkew: skew, w1: 0.33, w2: 0.33, w3: 0.34 });
      return { value, details: { DIR: dir, demographicParityDifference: dpd, embeddingCosineSkew: skew, args } };
    },
    inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'`
);

// Replace Privacy Integrity
content = content.replace(
  /id: 'privacy-integrity'[\s\S]*?inputBuilder: \(\) => \(\{ status: 'calculated', inputs: \{\} \}\)[\s\S]*?type: 'configuration'/g,
  `id: 'privacy-integrity', name: 'Privacy Integrity', category: 'Governance',
    implementation: (args: any) => {
      const leakage = calculateLeakageScore({ unmaskedTokenCount: args?.unmaskedTokenCount || 5, totalTokenCount: args?.totalTokenCount || 100, successfulAttackCount: 1, totalAttackCount: 50 });
      const dp = checkDifferentialPrivacyGuarantee({ probOutputGivenD: 0.1, probOutputGivenDPrime: 0.05, epsilon: 1.0, delta: 1e-5 });
      const mia = calculateMembershipInferenceAdvantage(0.55);
      const value = calculateCompositePrivacyIntegrity({ leakageScore: leakage, membershipInferenceAdvantage: mia, epsilon: 1.0, epsilonTarget: 1.0, wLeak: 0.4, wMIA: 0.3, wDP: 0.3 });
      return { value, details: { leakageScore: leakage, differentialPrivacy: dp, membershipInferenceAdvantage: mia, args } };
    },
    inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'`
);

// Replace Provenance Completeness
content = content.replace(
  /id: 'provenance-completeness'[\s\S]*?inputBuilder: \(\) => \(\{ status: 'calculated', inputs: \{\} \}\)[\s\S]*?type: 'configuration'/g,
  `id: 'provenance-completeness', name: 'Provenance Completeness', category: 'Governance',
    implementation: (args: any) => {
      const ei = args?.entailmentIndicators || [1, 1, 0, 1];
      const ci = args?.citationIndicators || [1, 0, 0, 1];
      const base = calculateBaseProvenanceScore(ei);
      const value = calculateProvenanceCompletenessScore({ entailmentIndicators: ei, citationIndicators: ci, alpha: 0.5 });
      return { value, details: { baseProvenanceScore: base, args } };
    },
    inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'`
);

// Replace Auditability Level
content = content.replace(
  /id: 'auditability-level'[\s\S]*?inputBuilder: \(\) => \(\{ status: 'calculated', inputs: \{\} \}\)[\s\S]*?type: 'configuration'/g,
  `id: 'auditability-level', name: 'Auditability Level', category: 'Governance',
    implementation: (args: any) => {
      const logField = calculateLogFieldCompleteness(args?.logFieldCompleteness || [[true, true], [true, false]]);
      const ledger = calculateLedgerIntegrity(args?.ledgerElements || ["a", "b"], args?.ledgerElements || ["hash1", "hash2"]);
      const replay = calculateReplayEquivalence(args?.replayEquivalence || [0.9, 0.95]);
      const value = calculateCompositeAuditability({ logFieldCompleteness: logField, ledgerIntegrity: 0.5, replayEquivalence: replay, w1: 0.33, w2: 0.33, w3: 0.34 });
      return { value, details: { logFieldCompleteness: logField, ledgerIntegrity: ledger, replayEquivalence: replay, args } };
    },
    inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'`
);

// Replace Compliance Adaptability
content = content.replace(
  /id: 'compliance-adaptability'[\s\S]*?inputBuilder: \(\) => \(\{ status: 'calculated', inputs: \{\} \}\)[\s\S]*?type: 'configuration'/g,
  `id: 'compliance-adaptability', name: 'Compliance Adaptability', category: 'Governance',
    implementation: (args: any) => {
      const decouple = calculatePolicyDecouplingRatio(args?.policyDecouplingRatio || 10, 2);
      const latency = calculatePolicyPropagationLatencyScore(args?.latency || 120, 100);
      const unlearn = calculateUnlearningEfficiency({ unlearningCompleteness: 0.9, selectiveUnlearnCost: 50, fullRetrainingCost: 1000 });
      const value = calculateCompositeComplianceAdaptability({ policyDecouplingRatio: decouple, policyPropagationLatencyScore: latency, unlearningEfficiency: unlearn, w1: 0.33, w2: 0.33, w3: 0.34 });
      return { value, details: { policyDecouplingRatio: decouple, policyPropagationLatencyScore: latency, unlearningEfficiency: unlearn, args } };
    },
    inputBuilder: buildDynamicGovernanceInputs, higherIsBetter: true, excludeFromVerdict: true, type: 'aggregate'`
);

fs.writeFileSync(file, content);
console.log('Done!');
