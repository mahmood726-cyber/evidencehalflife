# Truth-Recovery Validation — Evidence Half-Life

**Repo:** mahmood726-cyber/evidencehalflife
**Engine under test:** halflife.html (lines 183-385: normalCDF, cumulativeMA, estimateHalfLife)
**Method:** extracted the engine's pure functions VERBATIM into engine.mjs, drove them
against a seeded known-truth cumulative-evidence DGP, and measured whether the predicted
"half-life" (forecast time-to-obsolescence / loss-of-significance) is accurate/calibrated.

## Verdict

**PARTIAL / FLAG — genuine methods engine (pooling is correct), but the headline
"half-life" forecast is a DETERMINISTIC heuristic with NO calibrated probability, and it
is materially over-optimistic under fast drift.** This is the recipe's "deterministic
heuristic with no probabilistic claim to validate -> FLAG" case, plus a concrete
over-optimism bug.

## What the tool claims

Given a chronologically-ordered cumulative meta-analysis, it outputs one number: projected
years until the cumulative |z| crosses 1.96. Output is a deterministic point estimate from
LINEAR extrapolation of the CURRENT cumulative effect:
projTheta = thetaNow + drift*t ; projSE = seNow*sqrt(k/(k+rate*t)).
There is NO flip probability, NO distribution, NO uncertainty propagation.

## Known-truth DGP (dgp-cumulative.mjs)

True log-scale mean drifts linearly: muTrue(t) = mu0 + g*(t-t0). Studies arrive on a
regular grid; observed yi ~ Normal(muTrue, se^2) via seeded mulberry32 + Box-Muller. The
NOISELESS cumulative inverse-variance mean and its FE z are computed exactly, so the ACTUAL
crossing time under continued data collection is known ground truth.

## Measured results (harness.mjs)

| Experiment | Result |
|---|---|
| Pooling sanity | FE theta/SE/tau^2 match closed form to <1e-9. Engine math correct. |
| Exp 1 accuracy (aging) | Predicted vs actual half-life errors of 5-19 years (true drift -0.01..-0.04). Direction right, magnitude poor. |
| Exp 2 stable (drift 0) | Tool returns Infinity; truth Infinity. CORRECT. |
| Exp 3 flip-within-20y (n=200) | TP=86 FP=37 TN=63 FN=14 -> 74.5% hit-rate. 37 false positives. |
| Exp 4 fast-drift over-optimism | At true drift -0.08: tool predicts HL=1 year (imminent flip) while noiseless truth NEVER loses significance (Infinity). |

### Headline finding (Exp 4)

The tool linearly extrapolates the CURRENT cumulative theta, but the cumulative pooled
theta averages all prior studies and has enormous inertia -- it does NOT move at the
per-study drift rate. Under fast drift the linear projection overshoots toward zero and
reports an imminent flip, while the true cumulative effect decays far more slowly and stays
significant. The forecast is OVER-OPTIMISTIC about obsolescence. The About box discloses
"linear drift extrapolation" and FE inflation, but not that extrapolating the *cumulative*
(rather than incremental) estimate is the dominant error source.

## Calibration verdict

A calibration curve (predicted P vs observed frequency) CANNOT be drawn: the tool emits no
probability. The only probabilistic reading is a binary "flips within H years" indicator,
hit-rate 74.5% with a large false-positive arm. The forecast is NOT calibrated and cannot
be made calibrated without a probabilistic model the tool does not have.

## Recommendation

- Do not present the half-life as a quantitative forecast. Relabel as a rough directional
  heuristic, OR replace the linear-cumulative extrapolation with a model that extrapolates
  the *incremental* effect and re-pools, AND emits a flip PROBABILITY (e.g. Monte-Carlo over
  future study draws) so it can be calibration-tested.
- Keep the (correct) cumulative-MA pooling and stable/aging/fragile gauge as qualitative
  triage; gate any numeric "years" claim behind the over-optimism caveat.
- Existing Selenium suite checks UI/plumbing, not forecast validity; these tests add the
  missing methods check.

## Files

- engine.mjs - verbatim pure functions from halflife.html.
- dgp-cumulative.mjs - standalone seeded known-truth DGP + noiseless truth.
- harness.mjs - wires repo's own functions; measures accuracy & calibration.
- test_truth_recovery.mjs - 5 assertions, all passing (node test_truth_recovery.mjs).
