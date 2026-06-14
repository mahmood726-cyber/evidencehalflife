// test_truth_recovery.mjs — assertions over the repo's OWN engine vs a
// known-truth DGP. These encode the MEASURED behaviour (truth-first): they
// pass because they assert what the tool actually does, including its
// limitations. Run: node test_truth_recovery.mjs
import assert from 'node:assert/strict';
import { cumulativeMA, estimateHalfLife } from './engine.mjs';
import { runScenario, exp2_stable, exp3_calibration } from './harness.mjs';

let pass = 0;
function ok(name, fn) {
  try { fn(); console.log('  PASS', name); pass++; }
  catch (e) { console.log('  FAIL', name, '\n    ', e.message); process.exitCode = 1; }
}

console.log('=== truth-recovery assertions: Evidence Half-Life ===');

// 1) Pooling sanity (anchors the engine to a known closed form).
//    Two identical studies: FE theta = yi, SE = sei/sqrt(2), tau2 = 0.
ok('FE pooling matches closed form for identical studies', () => {
  const cma = cumulativeMA([{ year: 2000, yi: -0.3, sei: 0.1 }, { year: 2005, yi: -0.3, sei: 0.1 }]);
  assert.ok(Math.abs(cma[1].theta - (-0.3)) < 1e-9);
  assert.ok(Math.abs(cma[1].se - 0.1 / Math.SQRT2) < 1e-9);
  assert.ok(Math.abs(cma[1].tau2 - 0) < 1e-9);
});

// 2) Stable truth (true drift = 0, strongly significant) must be reported
//    as non-flipping. Both the tool and the noiseless truth return Infinity.
ok('stable conclusion (true drift 0) is reported stable (Infinity)', () => {
  const r = exp2_stable();
  assert.equal(r.predicted, Infinity, 'tool should report stable');
  assert.equal(r.actual, Infinity, 'true process never flips');
});

// 3) Directional correctness: a decaying positive effect yields a FINITE,
//    positive predicted half-life and a positive recovered drift sign issue —
//    drift of the cumulative POSITIVE effect toward null is negative.
ok('decaying conclusion -> finite predicted half-life, drift toward null', () => {
  const cfg = { mu0: 0.30, drift: -0.03, year0: 1990, sePerStudy: 0.18, trialsPerYear: 1, nStudies: 12, seed: 42 };
  const r = runScenario(cfg);
  assert.ok(Number.isFinite(r.predicted), 'half-life should be finite');
  assert.ok(r.predicted > 0, 'half-life positive');
  assert.ok(r.drift < 0, 'recovered drift negative (positive effect aging toward null)');
});

// 4) MEASURED LIMITATION (the headline finding): under very fast linear drift,
//    the tool extrapolates thetaNow linearly and predicts an IMMINENT flip,
//    while the cumulative pooled effect (which averages all history and has
//    large inertia) never actually loses significance. We assert this
//    over-optimistic divergence is real and large.
ok('fast-drift over-optimism: tool predicts imminent flip the truth never has', () => {
  const cfg = { mu0: 0.30, drift: -0.08, year0: 1990, sePerStudy: 0.18, trialsPerYear: 1, nStudies: 12, seed: 99 };
  const r = runScenario(cfg);
  assert.ok(Number.isFinite(r.predicted) && r.predicted <= 2,
    `tool predicts imminent flip, got ${r.predicted}`);
  assert.equal(r.actual, Infinity, 'noiseless truth never flips');
});

// 5) NO probabilistic claim: the tool emits a deterministic point estimate, so
//    the best obtainable "flip probability" is a binary indicator. Its hit-rate
//    as a flip-within-20y classifier is materially below a calibrated forecaster
//    and carries many false positives. We assert it is NOT well-calibrated.
ok('flip forecast is deterministic and not well-calibrated (FP-heavy)', () => {
  const e3 = exp3_calibration();
  // honest bound: accuracy is moderate, not near-perfect, and FP are substantial
  assert.ok(e3.accuracy < 0.85, `hit-rate ${(e3.accuracy * 100).toFixed(1)}% should be < 85%`);
  assert.ok(e3.FP >= 20, `false positives ${e3.FP} should be substantial (>=20)`);
});

console.log(`\n${pass}/5 assertions passed.`);
if (pass !== 5) process.exitCode = 1;
