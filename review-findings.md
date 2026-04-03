## REVIEW CLEAN
## Code Review Audit: EvidenceHalfLife (halflife.html)
### Date: 2026-04-03
### Summary: 0 P0, 2 P1, 3 P2

---

#### P0 -- Critical

None.

#### P1 -- Important

- **P1-1** [Statistics]: The cumulative MA uses fixed-effect (inverse-variance) pooling (line 268-276). When heterogeneity is substantial, the FE z-score is inflated and the half-life may be over-optimistic. This is clearly documented in the About modal (line 161) as a known limitation.

- **P1-2** [Statistics]: The drift regression operates on correlated cumulative estimates (each step shares all prior studies). The drift rate is descriptive, not a formal temporal trend test. Also documented as a known limitation (line 162).

#### P2 -- Minor / Enhancement

- **P2-1** [Statistics]: DL tau2 in cumulative MA (line 286): `Math.max(0, (Q - (j-1)) / C)` -- correct, df = j-1 for j studies. The FE pooling, z-score, and p-value computations are correct.

- **P2-2** [Statistics]: Half-life projection uses SE shrinkage model `SE(t) = SE_current * sqrt(k / (k + rate*t))` (line 357) which assumes future studies have average precision of existing ones. This is a reasonable simplification, documented in limitations.

- **P2-3** [Enhancement]: No CSV export (JSON only). Blob URLs properly created and revoked (lines 509-513).

#### Checklist

- [x] `</html>` closing tag present (line 558)
- [x] Div balance: 24/24 (excluding JS)
- [x] No literal `</script>` inside script blocks
- [x] `escapeHtml` escapes `& < > " '` (line 179-180)
- [x] Blob URLs revoked after use (line 513)
- [x] Skip-nav link present (line 69)
- [x] Modal keyboard trap with cleanup (lines 536-552)
- [x] `aria-live="polite"` on gauge (line 115)
- [x] Plotly charts have `role="img"` and `aria-label` (lines 128, 131)
- [x] normalCDF uses Abramowitz & Stegun approximation -- correct
- [x] Weighted linear regression for drift -- correct
- [x] Division by zero guard for same-year studies (line 320): `denom > 1e-12`
- [x] Edge case: k < 3 returns early with message (line 303)
- [x] Tau2 trend skips first 2 points where tau2 is unstable (line 329)
