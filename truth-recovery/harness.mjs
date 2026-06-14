// harness.mjs — wire the repo's OWN estimateHalfLife against a known-truth DGP
// and MEASURE (a) deterministic prediction accuracy vs the actual noiseless
// crossing time, and (b) whether the tool's output can be read as a CALIBRATED
// flip probability.
//
// Run: node harness.mjs
import { cumulativeMA, estimateHalfLife } from './engine.mjs';
import { generateCumulativeEvidence, trueCumulative, actualHalfLife } from './dgp-cumulative.mjs';

// One scenario: generate data, ask the tool, compare to truth.
function runScenario(cfg) {
  const { studies } = generateCumulativeEvidence(cfg);
  const cma = cumulativeMA(studies);
  const hl = estimateHalfLife(cma, cfg.trialsPerYear);
  const predicted = hl.halfLife; // years (number or Infinity)

  const actual = actualHalfLife(cfg, cfg.nStudies, 100); // noiseless truth
  const truthNow = trueCumulative(cfg, cfg.nStudies);

  return {
    cfg, predicted, actual,
    predictedFinite: Number.isFinite(predicted),
    actualFinite: Number.isFinite(actual),
    drift: hl.drift,
    trueDrift: cfg.drift,
    currentSig: hl.currentSig,
    trueZ: truthNow.z,
  };
}

// ---------- Experiment 1: accuracy on a decaying (aging) conclusion ----------
// A strong positive effect that drifts toward the null. We KNOW it eventually
// loses significance; measure how close the predicted half-life is to actual.
function exp1_accuracy() {
  const rows = [];
  // sweep drift magnitudes; keep it currently significant
  for (const g of [-0.010, -0.020, -0.030, -0.040]) {
    const cfg = {
      mu0: 0.30, drift: g, year0: 1990,
      sePerStudy: 0.18, trialsPerYear: 1, nStudies: 12, seed: 42,
    };
    rows.push(runScenario(cfg));
  }
  return rows;
}

// ---------- Experiment 2: stable conclusion must be reported stable ----------
// True drift = 0, strongly significant. Truth: never flips (actual=Infinity).
// The tool should return Infinity (">50 / stable").
function exp2_stable() {
  const cfg = {
    mu0: -0.30, drift: 0.0, year0: 1994,
    sePerStudy: 0.10, trialsPerYear: 1, nStudies: 12, seed: 7,
  };
  return runScenario(cfg);
}

// ---------- Experiment 3: CALIBRATION as a flip-probability claim ----------
// The recipe asks: if it claims a flip probability, does predicted match actual
// flip rate? The tool emits a DETERMINISTIC half-life, not a probability. The
// only probabilistic reading available is the indicator "predicts a flip within
// H years" (predicted <= H). We test that binary forecast against the actual
// noiseless flip-within-H outcome across many seeds & drifts, at H = 20y
// (the tool's own "stable" cutoff in compute()).
//
// For a genuinely calibrated probabilistic forecaster we would bin predicted
// probabilities and compare to empirical frequencies. Here there is exactly one
// achievable "probability" value per case (0 or 1), so calibration collapses to
// a hit-rate / confusion matrix. We report it honestly as such.
function exp3_calibration() {
  const H = 20; // tool's "stable" boundary used in the UI gauge
  const cases = [];
  const drifts = [0.0, -0.005, -0.010, -0.015, -0.020, -0.030, -0.045, -0.060];
  let TP = 0, FP = 0, TN = 0, FN = 0;
  for (const g of drifts) {
    for (let seed = 1; seed <= 25; seed++) {
      const cfg = {
        mu0: 0.30, drift: g, year0: 1990,
        sePerStudy: 0.18, trialsPerYear: 1, nStudies: 12, seed,
      };
      const r = runScenario(cfg);
      const predFlip = r.predictedFinite && r.predicted <= H; // tool says "will flip <=H"
      const trueFlip = r.actualFinite && r.actual <= H;        // truth: flips <=H
      if (predFlip && trueFlip) TP++;
      else if (predFlip && !trueFlip) FP++;
      else if (!predFlip && !trueFlip) TN++;
      else FN++;
      cases.push({ g, seed, predicted: r.predicted, actual: r.actual, predFlip, trueFlip });
    }
  }
  const n = TP + FP + TN + FN;
  const accuracy = (TP + TN) / n;
  return { H, n, TP, FP, TN, FN, accuracy, cases, drifts };
}

// ---------- Experiment 4: monotonicity (sanity of the drift mechanism) ----------
// Faster true decay => shorter predicted half-life (when finite).
function exp4_monotonic() {
  const out = [];
  for (const g of [-0.005, -0.010, -0.020, -0.040, -0.080]) {
    const cfg = {
      mu0: 0.30, drift: g, year0: 1990,
      sePerStudy: 0.18, trialsPerYear: 1, nStudies: 12, seed: 99,
    };
    const r = runScenario(cfg);
    out.push({ g, predicted: r.predicted, actual: r.actual });
  }
  return out;
}

function main() {
  console.log('=== Evidence Half-Life — truth-recovery harness ===\n');

  console.log('--- Exp 1: accuracy on aging (decaying) conclusions ---');
  console.log('trueDrift | predictedHL(y) | actualHL(y) | absErr(y)');
  const e1 = exp1_accuracy();
  let maxErr = 0, anyFinite = 0;
  for (const r of e1) {
    const err = (r.predictedFinite && r.actualFinite) ? Math.abs(r.predicted - r.actual) : NaN;
    if (Number.isFinite(err)) { maxErr = Math.max(maxErr, err); anyFinite++; }
    console.log(
      `  ${r.trueDrift.toFixed(3)}     | ${String(r.predicted).padStart(8)}       | ${String(r.actual).padStart(7)}     | ${Number.isFinite(err) ? err.toFixed(1) : 'n/a'}`
    );
  }
  console.log(`  -> finite-vs-finite cases: ${anyFinite}/${e1.length}, max abs error: ${Number.isFinite(maxErr) ? maxErr.toFixed(1) : 'n/a'} years\n`);

  console.log('--- Exp 2: stable conclusion (true drift = 0) ---');
  const e2 = exp2_stable();
  console.log(`  predicted=${e2.predicted}  actual=${e2.actual}  (both should be Infinity)\n`);

  console.log('--- Exp 3: flip-within-20y forecast vs truth (confusion matrix) ---');
  const e3 = exp3_calibration();
  console.log(`  n=${e3.n}  TP=${e3.TP} FP=${e3.FP} TN=${e3.TN} FN=${e3.FN}`);
  console.log(`  hit-rate (accuracy of binary flip forecast) = ${(e3.accuracy * 100).toFixed(1)}%`);
  console.log('  NOTE: tool emits NO probability — only a deterministic point estimate.');
  console.log('  A true calibration curve (predicted P vs observed freq) is NOT possible.\n');

  console.log('--- Exp 4: monotonicity (faster decay -> shorter HL) ---');
  const e4 = exp4_monotonic();
  for (const r of e4) console.log(`  drift=${r.g.toFixed(3)}  predicted=${r.predicted}  actual=${r.actual}`);

  return { e1, e2, e3, e4, maxErr, anyFinite };
}

// Only run the verbose report when invoked directly (node harness.mjs), so
// that importing the experiment functions from the test file stays quiet.
import { fileURLToPath } from 'node:url';
let results = null;
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  results = main();
}
export { runScenario, exp1_accuracy, exp2_stable, exp3_calibration, exp4_monotonic, main, results };
