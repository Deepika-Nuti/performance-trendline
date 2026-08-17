export function rougeScore(h: string, r: string) {
  const r1 = rouge1(h, r);
  const rl = rougeL(h, r);
  const r2 = rouge2(h, r);
  return (r1 + rl + r2) / 3.0;
}

export function bleuScore(h: string, r: string) {
  const b_guide = bleu(h, r); // basic BLEU
  const b4 = calculateBLEU(h, r);
  return (b_guide + (b4?.f1 || 0)) / 2.0;
}
