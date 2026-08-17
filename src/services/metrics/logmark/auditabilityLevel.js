/**
 * ============================================================================
 * AUDITABILITY LEVEL
 * ----------------------------------------------------------------------------
 * Measures the completeness, tamper-resistance, and replayability of an AI
 * system's operational history ΓÇö how easily an external auditor can
 * reconstruct, verify, and replay the exact decision-making process.
 * Reference: Haber & Stornetta (1991) Journal of Cryptology (hash chains).
 * ============================================================================
 */

const crypto = require("crypto");

/** Structured Log Field Completeness
 * S_log = (1 / (K├ùM)) ├ù ╬ú_{i=1}^{K} ╬ú_{j=1}^{M} I(f_i,j is valid and logged)
 * @param {(0|1|boolean)[][]} fieldValidityMatrix - K runs ├ù M mandatory fields;
 *        each entry is truthy if that field was present/valid for that run
 * @returns {number} structured log field completeness score, in [0,1]
 */
function calculateLogFieldCompleteness(fieldValidityMatrix) {
  const K = fieldValidityMatrix.length;
  if (K === 0) {
    throw new Error("fieldValidityMatrix must contain at least one run");
  }
  const M = fieldValidityMatrix[0].length;
  let validCount = 0;
  for (const run of fieldValidityMatrix) {
    for (const fieldIsValid of run) {
      if (fieldIsValid) validCount += 1;
    }
  }
  return validCount / (K * M);
}

/** Build a tamper-evident cryptographic hash chain over a sequence of log entries.
 * h_i = SHA256( e_i ΓÇû h_{i-1} )
 * @param {string[]} logEntries - serialized log entries, e_1 ... e_K, in order
 * @param {string} [genesisHash="0".repeat(64)] - h_0, the seed/genesis hash
 * @returns {string[]} the resulting hash chain, h_1 ... h_K
 */
function generateHashChain(logEntries, genesisHash = "0".repeat(64)) {
  const chain = [];
  let previousHash = genesisHash;
  for (const entry of logEntries) {
    const currentHash = crypto
      .createHash("sha256")
      .update(entry + previousHash)
      .digest("hex");
    chain.push(currentHash);
    previousHash = currentHash;
  }
  return chain;
}

/** Cryptographic Ledger Chain Integrity
 * S_ledger = (count of cryptographically verifiable entries) / (total recorded entries)
 * Recomputes the hash chain from the raw entries and compares it against the
 * stored chain to find how many entries are still verifiable (unbroken from
 * the point of the first mismatch onward, entries are no longer verifiable).
 * @param {string[]} logEntries - the raw, serialized log entries, e_1 ... e_K
 * @param {string[]} storedHashChain - the previously recorded hash chain, h_1 ... h_K
 * @param {string} [genesisHash="0".repeat(64)] - h_0, the seed/genesis hash
 * @returns {number} ledger integrity score, in [0,1]
 */
function calculateLedgerIntegrity(logEntries, storedHashChain, genesisHash = "0".repeat(64)) {
  if (storedHashChain.length === 0) {
    return 1.0; // an empty log is vacuously intact ΓÇö nothing to have tampered with
  }
  const recomputedChain = generateHashChain(logEntries, genesisHash);
  let verifiableCount = 0;
  for (let i = 0; i < storedHashChain.length; i++) {
    if (recomputedChain[i] === storedHashChain[i]) {
      verifiableCount += 1;
    } else {
      break; // a single broken link invalidates every entry after it
    }
  }
  return verifiableCount / storedHashChain.length;
}

/** Deterministic Replay Equivalence = (1/K) ├ù ╬ú_{i=1}^{K} Sim(y_original,i, y_replay,i)
 * @param {number[]} similarityScores - Sim(y_original, y_replay) per replayed run,
 *        e.g. token-level Jaccard similarity or embedding cosine similarity, each in [0,1]
 * @returns {number} deterministic replay equivalence score, in [0,1]
 */
function calculateReplayEquivalence(similarityScores) {
  const K = similarityScores.length;
  if (K === 0) {
    throw new Error("similarityScores must contain at least one run");
  }
  return similarityScores.reduce((sum, s) => sum + s, 0) / K;
}

/** Composite Auditability Level (weighted geometric mean)
 * A_L = S_log^w1 ├ù S_ledger^w2 ├ù S_replay^w3
 * where w1 + w2 + w3 = 1.0. Any dimension dropping to zero collapses the
 * whole score, by design.
 * @param {object} input
 * @param {number} input.logFieldCompleteness - S_log, from calculateLogFieldCompleteness()
 * @param {number} input.ledgerIntegrity - S_ledger, from calculateLedgerIntegrity()
 * @param {number} input.replayEquivalence - S_replay, from calculateReplayEquivalence()
 * @param {number} input.w1 - weight on log field completeness
 * @param {number} input.w2 - weight on ledger integrity
 * @param {number} input.w3 - weight on replay equivalence
 * @returns {number} composite auditability level, in [0,1]
 */
function calculateCompositeAuditability({
  logFieldCompleteness,
  ledgerIntegrity,
  replayEquivalence,
  w1,
  w2,
  w3,
}) {
  if (Math.abs(w1 + w2 + w3 - 1.0) > 1e-9) {
    throw new Error("w1, w2 and w3 must sum to 1.0");
  }
  return (
    Math.pow(logFieldCompleteness, w1) *
    Math.pow(ledgerIntegrity, w2) *
    Math.pow(replayEquivalence, w3)
  );
}

module.exports = {
  calculateLogFieldCompleteness,
  generateHashChain,
  calculateLedgerIntegrity,
  calculateReplayEquivalence,
  calculateCompositeAuditability,
};
