// ⚒ bloom.js — fold/sign/escure for clock state
// Prime Bloom Standard: ring k weighted by p_k.
export const PRIMES = [2, 3, 5, 7, 11, 13, 17];
export const PRIMORIAL = 510510;
export const MAX_EXP = 16;

export function quantize(rings) {
  // hours -> bloom exponent (floor log_p(hours+1) clamped)
  return rings.map((h, k) => {
    const p = PRIMES[k] || 17;
    const e = Math.floor(Math.log(Math.max(1, h) + 1) / Math.log(p));
    return Math.min(MAX_EXP, Math.max(0, e));
  });
}

export function fold(bloom) {
  // ∏ p_k^bloom[k]  (BigInt)
  let f = 1n;
  for (let k = 0; k < bloom.length && k < PRIMES.length; k++) {
    const p = BigInt(PRIMES[k]);
    for (let i = 0; i < bloom[k]; i++) f *= p;
  }
  return f;
}

export function sign(bloom) {
  // CRT signature: residues mod each prime
  return PRIMES.map((p, k) => (bloom[k] || 0) % p);
}

export function escure(rings) {
  const b = quantize(rings);
  return { bloom: b, fold: fold(b).toString(), sig: sign(b) };
}
