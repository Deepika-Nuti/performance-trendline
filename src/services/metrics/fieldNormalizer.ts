// Config map of canonical field -> known aliases
const fieldAliases: Record<string, string[]> = {
  inputPrompt: ['question', 'employee_questions', 'employee_question', 'employee question', 'prompt', 'query', 'input'],
  candidate: ['generated_text', 'generated_answers', 'generated_answer', 'generated answer', 'ai response', 'ai_response', 'response', 'model_output', 'candidate', 'prediction', 'llm_output', 'output', 'answer'],
  reference: ['reference_text', 'expected answers', 'expected_answers', 'expected answer', 'expected_answer', 'ground_truth', 'ground truth', 'reference', 'reference_output', 'gold_standard', 'expected', 'target', 'expected_output', 'reference_answer'],
  
  // Safety / Robustness
  successfulAttacks: ['successful_attacks', 'successful attacks', 'attacks_succeeded'],
  totalAttackAttempts: ['total_attack_attempts', 'total attacks', 'attack_attempts'],
  
  // Drift
  expectedDistribution: ['expected_distribution', 'baseline_distribution', 'reference_distribution'],
  actualDistribution: ['actual_distribution', 'current_distribution', 'observed_distribution'],
  baselinePerformance: ['baseline_performance', 'baseline_metric'],
  currentPerformance: ['current_performance', 'current_metric'],

  // Fairness aggregates
  unprivSelected: ['unpriv_selected', 'unprivileged_selected'],
  unprivTotal: ['unpriv_total', 'unprivileged_total'],
  privSelected: ['priv_selected', 'privileged_selected'],
  privTotal: ['priv_total', 'privileged_total'],
  
  uTP: ['utp', 'u_tp', 'unprivileged_tp', 'unpriv_tp'],
  uFP: ['ufp', 'u_fp', 'unprivileged_fp', 'unpriv_fp'],
  uTN: ['utn', 'u_tn', 'unprivileged_tn', 'unpriv_tn'],
  uFN: ['ufn', 'u_fn', 'unprivileged_fn', 'unpriv_fn'],
  pTP: ['ptp', 'p_tp', 'privileged_tp', 'priv_tp'],
  pFP: ['pfp', 'p_fp', 'privileged_fp', 'priv_fp'],
  pTN: ['ptn', 'p_tn', 'privileged_tn', 'priv_tn'],
  pFN: ['pfn', 'p_fn', 'privileged_fn', 'priv_fn'],
  
  unprivQual: ['unpriv_qual', 'unprivileged_qualified'],
  privQual: ['priv_qual', 'privileged_qualified'],

  // Privacy
  leakageScore: ['leakage_score', 'leakage'],
  membershipInferenceAdvantage: ['membership_inference_advantage', 'mia_advantage', 'mia'],
  epsilon: ['epsilon', 'privacy_budget'],
  epsilonTarget: ['epsilon_target', 'target_epsilon'],
  wLeak: ['w_leak', 'leak_weight'],
  wMIA: ['w_mia', 'mia_weight'],
  wDP: ['w_dp', 'dp_weight'],

  // Reliability / Quality
  truthfulResponses: ['truthful_responses'],
  totalResponses: ['total_responses'],
  logProbabilities: ['log_probabilities', 'log_probs', 'logprobs'],
  llmSteps: ['llm_steps', 'generated_steps'],
  goldSteps: ['gold_steps', 'reference_steps', 'expected_steps'],
  steps: ['steps', 'reasoning_steps'],
  entailmentIndicators: ['entailment_indicators', 'entailments'],
  citationIndicators: ['citation_indicators', 'citations'],
  alpha: ['alpha', 'citation_penalty'],
  
  // Governance / Bias Configuration
  logFieldCompleteness: ['log_field_completeness', 'log_completeness'],
  ledgerIntegrity: ['ledger_integrity'],
  replayEquivalence: ['replay_equivalence'],
  w1: ['w1', 'weight_1'],
  w2: ['w2', 'weight_2'],
  w3: ['w3', 'weight_3'],
  disparateImpactRatio: ['disparate_impact_ratio', 'dir'],
  demographicParityDifference: ['demographic_parity_difference', 'dpd'],
  embeddingCosineSkew: ['embedding_cosine_skew', 'ecs'],
  mitigationEfficacyIndex: ['mitigation_efficacy_index', 'mei'],
  utilityRaw: ['utility_raw'],
  utilityMitigated: ['utility_mitigated'],
  policyDecouplingRatio: ['policy_decoupling_ratio', 'pdr'],
  policyPropagationLatencyScore: ['policy_propagation_latency_score', 'ppls'],
  unlearningEfficiency: ['unlearning_efficiency', 'ue'],
  factors: ['factors', 'transparency_factors'],
};

// Invert map for fast lookup
const aliasToCanonical = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(fieldAliases)) {
  for (const alias of aliases) {
    aliasToCanonical.set(alias.toLowerCase().trim().replace(/_+/g, ' '), canonical);
    aliasToCanonical.set(alias.toLowerCase().trim().replace(/\s+/g, '_'), canonical);
  }
}

/**
 * Maps an arbitrary uploaded column name to a canonical field name.
 * 
 * Must be case-insensitive and whitespace/underscore-tolerant.
 * Will NOT fuzzy-guess unrelated columns.
 */
export function normalizeFieldName(rawName: string): string | null {
  const cleanSpace = rawName.toLowerCase().trim().replace(/\s+/g, ' ');
  const cleanUnderscore = rawName.toLowerCase().trim().replace(/_+/g, ' ');
  
  if (aliasToCanonical.has(cleanSpace)) {
    return aliasToCanonical.get(cleanSpace)!;
  }
  if (aliasToCanonical.has(cleanUnderscore)) {
    return aliasToCanonical.get(cleanUnderscore)!;
  }
  
  // If it matches a canonical name directly
  if (fieldAliases[rawName.toLowerCase().trim()]) {
    return rawName.toLowerCase().trim();
  }
  
  return null;
}

export function detectAmbiguities(columns: string[]): Array<{ field: string; candidates: string[] }> {
  const canonicalToFound = new Map<string, string[]>();
  
  for (const col of columns) {
    const canonical = normalizeFieldName(col);
    if (canonical) {
      if (!canonicalToFound.has(canonical)) {
        canonicalToFound.set(canonical, []);
      }
      canonicalToFound.get(canonical)!.push(col);
    }
  }
  
  const ambiguities: Array<{ field: string; candidates: string[] }> = [];
  for (const [canonical, candidates] of canonicalToFound.entries()) {
    if (candidates.length > 1) {
      ambiguities.push({ field: canonical, candidates });
    }
  }
  
  return ambiguities;
}
