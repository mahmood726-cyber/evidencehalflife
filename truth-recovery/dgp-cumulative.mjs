// dgp-cumulative.mjs — standalone seeded known-truth cumulative-evidence DGP.
//
// PURPOSE: generate a cumulative meta-analysis from a KNOWN true effect
// trajectory so we can ask the tool to forecast the "half-life" (time until
// the cumulative z-score crosses |z|=1.96), then continue the SAME true
// process forward to learn the ACTUAL crossing time. Predicted vs actual is
// the calibration/accuracy test.
//
// TRUE MODEL (fully specified, no hidden randomness beside the seeded RNG):
//   - Effects are on a log scale (e.g. logRR).
//   - The true mean effect drifts LINEARLY with year:  muTrue(year) = mu0 + g*(year - year0)
//     where g is the true per-year drift. g<0 => moving toward the null from
//     a positive effect (an "aging/decaying" conclusion); g=0 => stable.
//   - Study j in year t_j has a sampling SE se_j (a fixed schedule), and its
//     observed yi ~ Normal(muTrue(t_j), se_j^2) using a seeded Gaussian RNG.
//   - New studies arrive at a constant rate `trialsPerYear` on a regular grid.
//
// Because the tool pools with inverse-variance FE on the OBSERVED yi, the
// cumulative pooled theta is itself a (noisy) estimate of a precision-weighted
// average of muTrue over the observed years. The "true" cumulative trajectory
// (what the tool is trying to recover) is the noiseless analogue, which we
// compute exactly. We can therefore find the ACTUAL year at which the
// noiseless cumulative z crosses 1.96 under continued data collection.

// ---- seeded RNG: mulberry32 + Box–Muller ----
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gaussian(rng) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Generate `nStudies` studies on a regular yearly-spaced grid.
//   cfg = { mu0, drift (g), year0, sePerStudy, trialsPerYear, nStudies, seed }
// Returns { studies, cfg }. studies = [{year, yi, sei}] in chronological order.
function generateCumulativeEvidence(cfg) {
  const {
    mu0, drift, year0 = 0, sePerStudy,
    trialsPerYear = 1, nStudies, seed = 1,
  } = cfg;
  const rng = mulberry32(seed);
  const studies = [];
  const dtYear = 1 / trialsPerYear; // years between consecutive studies
  for (let j = 0; j < nStudies; j++) {
    const year = year0 + j * dtYear;
    const muTrue = mu0 + drift * (year - year0);
    const sei = sePerStudy;
    const yi = muTrue + sei * gaussian(rng);
    studies.push({ year, yi, sei });
  }
  return { studies, cfg };
}

// NOISELESS truth: the exact cumulative inverse-variance-weighted mean of the
// TRUE means muTrue(t_j) for the first m studies, and its FE SE. Equal SEs =>
// plain average of the true means. This is what an infinitely-precise version
// of the tool's cumulativeMA would converge to.
function trueCumulative(cfg, m) {
  const { mu0, drift, year0 = 0, sePerStudy, trialsPerYear = 1 } = cfg;
  const dtYear = 1 / trialsPerYear;
  let sumW = 0, sumWY = 0;
  for (let j = 0; j < m; j++) {
    const year = year0 + j * dtYear;
    const muTrue = mu0 + drift * (year - year0);
    const w = 1 / (sePerStudy * sePerStudy);
    sumW += w; sumWY += w * muTrue;
  }
  const theta = sumWY / sumW;
  const se = 1 / Math.sqrt(sumW);
  return { theta, se, z: theta / se, k: m };
}

// ACTUAL crossing: under continued collection at `trialsPerYear`, find the
// first additional whole-year offset T (1..maxT) at which the NOISELESS
// cumulative |z| crosses 1.96 in the direction implied by the current state.
// Mirrors the tool's flip semantics: if currently significant -> first T with
// |z|<1.96 (loss of significance); if currently non-significant -> first T
// with |z|>=1.96 (gain of significance). Returns Infinity if no crossing.
function actualHalfLife(cfg, nStudiesNow, maxT = 100) {
  const { trialsPerYear = 1 } = cfg;
  const now = trueCumulative(cfg, nStudiesNow);
  const sigNow = Math.abs(now.z) > 1.96;
  for (let T = 1; T <= maxT; T++) {
    const mAdded = Math.round(trialsPerYear * T);
    const future = trueCumulative(cfg, nStudiesNow + mAdded);
    const sigFut = Math.abs(future.z) > 1.96;
    if (sigNow && !sigFut) return T;
    if (!sigNow && sigFut) return T;
  }
  return Infinity;
}

export { mulberry32, gaussian, generateCumulativeEvidence, trueCumulative, actualHalfLife };
