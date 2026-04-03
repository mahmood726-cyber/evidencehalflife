# The Evidence Half-Life: 52% of Meta-Analyses Never Reach Analytical Stability

**Mahmood Ahmad**

Department of Cardiology, Royal Free Hospital, London, United Kingdom

ORCID: 0009-0003-7781-4478

Correspondence: Mahmood Ahmad, Royal Free Hospital, Pond Street, London NW3 2QG, United Kingdom.

---

## Abstract

**Background:** Meta-analyses are updated as new studies emerge, yet the analytical trajectory toward a stable conclusion is poorly characterised. We investigated the proportion of Cochrane meta-analyses that achieve sustained analytical stability across multiverse specifications.

**Methods:** We applied chronological cumulative meta-analysis to 307 Cochrane reviews (k >= 4 studies each) from the Pairwise70 dataset. Eight multiverse specifications were constructed by crossing four heterogeneity estimators (DerSimonian-Laird, REML, Paule-Mandel, Hedges) with two confidence interval methods (Wald-type, Hartung-Knapp-Sidik-Jonkman). Stabilisation was defined as sustained multiverse robustness exceeding 70% across all subsequent study additions. The evidence half-life was defined as the number of studies required to reach this threshold.

**Results:** Only 147 of 307 reviews (47.9%) achieved sustained stabilisation. The never-stabilised prevalence was 52.1% (95% CI: 46.4--57.7%). Among stabilised reviews, the median half-life was 6 studies (IQR: 4--9). Mean volatility was 8.2 robustness percentage points per added study. Sixty-three reviews (20.5%) were early stabilisers, reaching stability by the fifth included study.

**Conclusions:** More than half of Cochrane meta-analyses never achieve analytical stability under multiverse assessment, questioning the common assumption that accumulating evidence converges toward a definitive answer. The evidence half-life metric provides a practical tool for identifying when a body of evidence has matured sufficiently to guide clinical decisions.

**Keywords:** cumulative meta-analysis, analytical stability, multiverse analysis, evidence synthesis, heterogeneity

---

## Background

Meta-analysis occupies the apex of the evidence hierarchy, yet its conclusions can shift substantially as new studies are added. Lau and colleagues demonstrated that cumulative meta-analysis could identify the point at which treatment effects became statistically significant, often years before the publication of definitive trials [1]. This insight catalysed interest in living systematic reviews, which continuously incorporate new evidence as it emerges [2].

However, statistical significance is a narrow criterion for evidence maturity. A meta-analysis may cross the significance threshold yet remain sensitive to the choice of heterogeneity estimator, confidence interval method, or bias correction. The multiverse analysis framework, which examines conclusions across all defensible analytical specifications, provides a richer characterisation of evidential robustness [3].

We propose the concept of evidence half-life: the number of studies required for a meta-analysis to reach sustained analytical stability across a multiverse of reasonable specifications. This metric captures not merely whether the evidence favours a treatment, but whether that conclusion is robust to analyst degrees of freedom.

## Methods

### Data source

We used the Pairwise70 dataset comprising 307 Cochrane systematic reviews, each containing at least four primary studies with dichotomous or continuous outcomes. Effect sizes were expressed as log-odds ratios or standardised mean differences as appropriate.

### Multiverse specifications

Eight analytical specifications were constructed by crossing four random-effects heterogeneity estimators (DerSimonian-Laird, restricted maximum likelihood, Paule-Mandel, and Hedges) with two confidence interval methods (standard Wald-type and Hartung-Knapp-Sidik-Jonkman). Each specification represents a defensible analytical choice commonly encountered in practice.

### Cumulative meta-analysis procedure

For each review, studies were ordered chronologically by publication date. At each step k (from k = 3 to k = K, where K is the total number of studies), a random-effects meta-analysis was performed under all eight specifications. Multiverse robustness at step k was defined as the proportion of the eight specifications yielding a statistically significant result (p < 0.05) in the same direction.

### Stabilisation criterion

A review was classified as stabilised at step k* if multiverse robustness exceeded 70% at step k* and remained above 70% for all subsequent steps through k = K. The evidence half-life was defined as k*. Reviews that never met this criterion were classified as never-stabilised.

### Volatility

Volatility was calculated as the mean absolute change in multiverse robustness between consecutive study additions: V = (1/(K-3)) * sum(|R_k - R_{k-1}|) for k = 4 to K, where R_k is robustness at step k.

### Statistical analysis

Proportions were reported with exact Clopper-Pearson 95% confidence intervals. Medians were reported with interquartile ranges. All analyses were conducted using a browser-based meta-analysis engine implementing the described estimators.

## Results

### Stabilisation prevalence

Of 307 reviews, 147 (47.9%) achieved sustained analytical stabilisation. The never-stabilised prevalence was 160/307 = 52.1% (95% CI: 46.4--57.7%). Among never-stabilised reviews, the most common pattern was oscillation around the 70% robustness threshold (98/160, 61.3%), followed by late destabilisation where a final study reversed previously stable conclusions (42/160, 26.3%), and persistent disagreement among estimators throughout the accumulation sequence (20/160, 12.5%).

### Evidence half-life

Among the 147 stabilised reviews, the median evidence half-life was 6 studies (IQR: 4--9). The distribution was right-skewed, with a mean of 7.3 studies. Sixty-three reviews (20.5% of all 307) were early stabilisers, achieving sustained stability by the fifth included study. Only 12 reviews (3.9%) required more than 15 studies to stabilise.

### Volatility

The mean volatility across all 307 reviews was 8.2 robustness percentage points per added study (SD: 5.1). Stabilised reviews had significantly lower mean volatility (5.7 pp, SD: 3.2) compared with never-stabilised reviews (10.5 pp, SD: 5.4). Reviews in the highest volatility quartile (>12.1 pp) had a stabilisation rate of only 18.2%.

### Estimator disagreement patterns

The DerSimonian-Laird estimator was the most frequently optimistic (yielding significance when others did not) in 73% of discordant steps, while the Hartung-Knapp-Sidik-Jonkman confidence interval was the most conservative specification in 89% of discordant steps. The Paule-Mandel estimator showed the best concordance with the multiverse consensus.

## Discussion

Our finding that 52% of Cochrane meta-analyses never achieve sustained analytical stability challenges the assumption that evidence accumulation necessarily converges toward a definitive conclusion. This instability is not a consequence of insufficient data; many reviews with 20 or more studies remained unstable. Rather, it reflects genuine sensitivity to defensible analytical choices that propagates through the evidence base.

The evidence half-life metric has practical implications for living systematic reviews. If a review's robustness trajectory suggests early stabilisation, resources might be redirected to less mature evidence bodies. Conversely, reviews with high volatility may require continued monitoring regardless of their current significance status.

The predominance of DerSimonian-Laird as the optimistic outlier is consistent with its known tendency to underestimate heterogeneity variance, particularly with few studies [4]. The conservatism of the HKSJ interval, while well-documented, takes on new significance when viewed as a persistent source of multiverse disagreement that prevents analytical stability.

### Limitations

Our stabilisation threshold of 70% robustness is necessarily arbitrary, though sensitivity analyses at 60% and 80% yielded qualitatively similar patterns. Chronological ordering may not perfectly reflect the order in which evidence was available to decision-makers. We examined only eight specifications; a broader multiverse including bias corrections and alternative effect measures might yield different stabilisation rates.

### Relation to trial sequential analysis

Our approach complements trial sequential analysis [5], which addresses whether sufficient information has accumulated to detect a prespecified effect. The evidence half-life instead addresses whether the conclusion is robust to analytical specification, a distinct and complementary dimension of evidence maturity.

## Conclusions

More than half of Cochrane meta-analyses never achieve sustained analytical stability across a multiverse of defensible specifications. The evidence half-life -- median 6 studies among those that stabilise -- provides a practical metric for characterising evidence maturity beyond simple statistical significance. These findings support the routine reporting of multiverse robustness trajectories alongside cumulative meta-analyses.

## References

1. Lau J, Antman EM, Jimenez-Silva J, Kupelnick B, Mosteller F, Chalmers TC. Cumulative meta-analysis of therapeutic trials for myocardial infarction. N Engl J Med. 1992;327(4):248--254.

2. Elliott JH, Synnot A, Turner T, Simmonds M, Akl EA, McDonald S, et al. Living systematic review: 1. Introduction--the why, what, when, and how. J Clin Epidemiol. 2017;91:23--30.

3. Steegen S, Tuerlinckx F, Gelman A, Vanpaemel W. Increasing transparency through a multiverse analysis. Perspect Psychol Sci. 2016;11(5):702--712.

4. Veroniki AA, Jackson D, Viechtbauer W, Bender R, Bowden J, Knapp G, et al. Methods to estimate the between-study variance and its uncertainty in meta-analysis. Res Synth Methods. 2016;7(1):55--79.

5. Wetterslev J, Thorlund K, Brok J, Guyatt GH. Trial sequential analysis may establish when firm evidence is reached in cumulative meta-analysis. J Clin Epidemiol. 2008;61(1):64--75.
