export function computeJaccard(s1, s2) {
  const set1 = new Set((s1||'').toLowerCase().split(/\s+/));
  const set2 = new Set((s2||'').toLowerCase().split(/\s+/));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 1 : intersection.size / union.size;
}
