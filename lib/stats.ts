// Pure-TypeScript statistics — no dependencies. Used by the insight engine to
// gate every observation before it's surfaced, so claims are validated, not asserted.

// Abramowitz & Stegun 7.1.26 approximation of the error function.
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

// Standard normal CDF.
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

// Two-tailed p-value for a z statistic.
export function twoTailedP(z: number): number {
  return 2 * (1 - normalCdf(Math.abs(z)));
}

export interface TwoPropResult {
  pSubgroup: number; // proportion in subgroup (0-1)
  pBaseline: number; // proportion in the complement
  nSubgroup: number;
  nBaseline: number;
  z: number;
  pValue: number;
  confidence: number; // (1 - pValue) as a %, capped 0-100
  absLift: number; // pSubgroup - pBaseline (percentage points, 0-1 scale)
  relLift: number; // (pSubgroup - pBaseline) / pBaseline
}

// Two-proportion z-test comparing a subgroup's success rate to the complement's.
// "Success" here = the student left (paused/churned).
export function twoProportionZTest(
  aSucc: number,
  aN: number,
  bSucc: number,
  bN: number
): TwoPropResult {
  const pA = aN > 0 ? aSucc / aN : 0;
  const pB = bN > 0 ? bSucc / bN : 0;
  const pPool = aN + bN > 0 ? (aSucc + bSucc) / (aN + bN) : 0;
  const se = Math.sqrt(pPool * (1 - pPool) * (1 / aN + 1 / bN));
  const z = se > 0 ? (pA - pB) / se : 0;
  const pValue = twoTailedP(z);
  return {
    pSubgroup: pA,
    pBaseline: pB,
    nSubgroup: aN,
    nBaseline: bN,
    z,
    pValue,
    confidence: Math.max(0, Math.min(100, (1 - pValue) * 100)),
    absLift: pA - pB,
    relLift: pB > 0 ? (pA - pB) / pB : 0,
  };
}

export function pct(x: number, digits = 0): string {
  return `${(x * 100).toFixed(digits)}%`;
}

// Compact p-value formatting (e.g. "p<0.001", "p=0.03").
export function fmtP(p: number): string {
  if (p < 0.001) return "p<0.001";
  if (p < 0.01) return `p=${p.toFixed(3)}`;
  return `p=${p.toFixed(2)}`;
}
