# evidencehalflife

The Evidence Half-Life: 52% of Meta-Analyses Never Reach Analytical Stability

An E156 methods micro-paper plus an interactive single-file tool that estimates
how long a cumulative meta-analytic conclusion is likely to remain stable.

## What is here

- **`halflife.html`** — offline single-file tool. Given studies entered in
  chronological order, it builds the cumulative meta-analysis (inverse-variance
  fixed-effect pooling with DerSimonian-Laird tau-squared), estimates the effect
  drift rate, fragility distance, and a tau-squared trend, then projects the year
  the cumulative z-score is expected to cross |z| = 1.96. Charts via Plotly.
- **`pipeline_pairwise70.R`** — the R analysis pipeline (metafor) used to compute
  half-life and stability categories over the Pairwise70 Cochrane-review dataset.
- **`data/`** — analysis outputs (`halflife_all.csv`, `.rds`).
- **`paper/`, `docs/`, `e156-submission/`** — manuscript, protocol, and the E156
  submission bundle.
- **`tests/`** — Selenium UI/engine tests for `halflife.html` (`pytest tests/`).

## Finding

Across 307 eligible Cochrane reviews (Pairwise70 dataset) under eight multiverse
specifications, only 147 reviews achieved sustained robustness above 70%, giving a
never-stabilized prevalence with a median half-life of six studies. Full numbers,
confidence intervals, method, and limitations are reported in
[`paper/manuscript.md`](paper/manuscript.md).

_Status: Submission ready (portfolio registry)._
