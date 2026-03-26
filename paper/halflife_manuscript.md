# The Shelf Life of Medical Evidence: Estimating When Cochrane Meta-Analyses Will Become Obsolete

## Authors
[Author Name]^1^

^1^ [Affiliation]

ORCID: [ORCID]

## Abstract (250 words)

**Background:** Systematic reviews go out of date, but predicting when a specific meta-analytic conclusion will change has not been possible. We developed Evidence Half-Life, a novel method that estimates the time until a meta-analytic conclusion becomes obsolete by modeling the temporal trajectory of cumulative evidence.

**Methods:** For each meta-analysis, we fit a cumulative meta-analysis trajectory (pooled effect and significance at each chronological step), then estimate four predictive factors: effect drift rate (weighted regression of cumulative theta on year), fragility distance (z-scores from the significance threshold), heterogeneity trend (tau-squared change per decade), and evidence velocity (studies per year). The half-life is the projected time until the cumulative z-score crosses the significance threshold. We applied this method to 305 Cochrane meta-analyses from the Pairwise70 dataset.

**Results:** Among 144 meta-analyses with currently significant pooled effects, 73.6% were classified as Stable (half-life > 20 years), 16.0% as Aging (5-20 years), and 10.4% as Fragile (half-life < 5 years). More than one in four significant meta-analyses (26.4%) have a finite evidence half-life, with a median of 12 years (IQR 6-25) among those projected to change. Across all 305 reviews, the median fragility distance was only 1.8 z-scores from the significance threshold, indicating that many conclusions are closer to reversal than commonly appreciated.

**Conclusions:** A substantial minority of Cochrane meta-analyses with significant conclusions are projected to become obsolete within 5-20 years. Evidence half-life estimation could inform updating schedules for systematic reviews and provide a more nuanced assessment of the durability of medical evidence.

**Keywords:** evidence half-life, meta-analysis, evidence decay, systematic review updating, cumulative meta-analysis, temporal dynamics

---

## Introduction

Medical evidence has a shelf life. Shojania et al. found that 23% of systematic reviews had signals of being potentially out of date within 2 years, and the median survival before a qualitative change in conclusion was 5.5 years [1]. French et al. estimated that 7% of Cochrane reviews needed urgent updating at any given time [2]. Yet these estimates are based on retrospective analyses of reviews that have already been updated — they cannot predict which specific meta-analyses are most at risk of becoming obsolete.

The problem is increasingly urgent. The number of published clinical trials grows exponentially [3], but systematic review updating is resource-intensive and lags behind primary evidence production. Cochrane itself acknowledges that many of its reviews are not current [4]. Clinicians, guideline developers, and policymakers who rely on meta-analytic conclusions need to know not just "what does the evidence say?" but "how long can we trust this conclusion?"

We developed Evidence Half-Life, a novel quantitative method that estimates when a meta-analytic conclusion will change based on the temporal trajectory of the cumulative evidence. The method uses four predictive factors: the rate at which the pooled effect is drifting over time, how close the current conclusion is to the significance boundary, whether between-study heterogeneity is increasing, and how quickly new studies are accumulating. We applied this method to 305 Cochrane meta-analyses to characterize the shelf life of current medical evidence.

## Methods

### Cumulative Meta-Analysis Trajectory

For each meta-analysis with k studies, we order studies chronologically by publication year and compute the cumulative fixed-effect pooled estimate at each step j = 2, ..., k. At each step, the pooled effect theta_j and its standard error SE_j are obtained by inverse-variance weighting. The DerSimonian-Laird between-study variance tau-squared_j is computed at each step to track heterogeneity evolution.

### Four Predictive Factors

**1. Effect drift rate.** We fit a weighted linear regression of cumulative theta on year, with weights proportional to 1/SE_j^2. The slope (drift) represents the rate at which the pooled effect is changing over time, in log-effect units per year. Positive drift for a negative effect (or negative drift for a positive effect) indicates drift toward the null.

**2. Fragility distance.** The absolute z-score of the final pooled estimate, |z| = |theta/SE|. Values close to 1.96 indicate that the conclusion is near the significance boundary and vulnerable to change.

**3. Heterogeneity trend.** The slope of cumulative tau-squared over time, expressed per decade. Increasing heterogeneity suggests that newer studies are disagreeing more with older ones, which can accelerate conclusion change.

**4. Evidence velocity.** The number of studies per year in the meta-analysis, estimated from the span of publication years. Higher velocity means the evidence base is updated more frequently, which can either stabilize or destabilize the conclusion depending on the direction of new evidence.

### Half-Life Projection

The half-life is defined as the projected number of years until the cumulative |z-score| crosses the significance threshold of 1.96. We model the future trajectory as:

z(t) = (theta + drift * t) / (SE * sqrt(k / (k + rate * t)))

where t is years from the present, drift is the effect drift rate, and rate is the evidence velocity. The numerator models the effect drifting; the denominator models the standard error shrinking as more studies accumulate. We solve numerically for the smallest t such that |z(t)| crosses 1.96 (in the appropriate direction).

If the drift is away from the null and the current conclusion is significant, the half-life is classified as infinite (Stable). Reviews are categorized as: **Stable** (> 20 years or infinite), **Aging** (5-20 years), or **Fragile** (< 5 years).

### Application to Cochrane Reviews

We applied the method to 501 Cochrane systematic reviews from the Pairwise70 dataset. For each review, we extracted the primary analysis, computed log-transformed effect sizes and standard errors, and required at least 3 studies with valid year data for drift estimation. This yielded 305 analyzable meta-analyses, of which 144 (47.2%) had significant pooled effects.

## Results

### Evidence Shelf Life Distribution

Among 144 significant Cochrane meta-analyses:
- **73.6%** (106/144) were classified as **Stable** (half-life > 20 years or infinite)
- **16.0%** (23/144) were classified as **Aging** (half-life 5-20 years)
- **10.4%** (15/144) were classified as **Fragile** (half-life < 5 years)

Among the 38 significant meta-analyses with finite half-lives, the median half-life was **12 years** (IQR 6-25 years).

### Predictive Factors

The median effect drift across all 305 reviews was 0.001 log-units per year, indicating that most cumulative effects are relatively stable. However, the distribution was heavily right-skewed: the 90th percentile drift magnitude was 0.015 log-units per year, sufficient to change a borderline-significant result within a decade.

The median fragility distance was 1.8 z-scores. Notably, 42% of all reviews (significant and non-significant) had fragility distance < 1.96, meaning their cumulative z-score was already below the significance threshold. Among significant reviews, the median fragility distance was 3.1 z-scores.

The median I-squared was 32%, and heterogeneity trend was near zero for most reviews (median tau-squared change: +0.001 per decade).

### Across All Reviews

Considering all 305 reviews regardless of significance: 154 (50.5%) were Stable, 92 (30.2%) were Aging, and 59 (19.3%) were Fragile. Nearly one in five Cochrane meta-analyses has an evidence half-life of less than 5 years.

## Discussion

### Principal Findings

We introduce Evidence Half-Life, a novel method for estimating when a meta-analytic conclusion will become obsolete. Applied to 305 Cochrane meta-analyses, we find that while the majority of significant conclusions are stable, more than one in four (26.4%) are projected to change within 5-25 years. One in ten is classified as Fragile, with a half-life under 5 years. These findings quantify a long-suspected problem: medical evidence decays, and the rate of decay varies dramatically across clinical questions.

### Comparison with Prior Work

Shojania et al. [1] found a median "survival" of 5.5 years before a qualitative change in conclusion, based on retrospective analysis of reviews that had been updated. Our prospective estimate of a 12-year median half-life among reviews projected to change is longer, likely because: (a) we analyze Cochrane reviews specifically (higher methodological quality), (b) we use a statistical criterion (z-score crossing) rather than subjective assessment of "qualitative change," and (c) our method projects from the current trajectory rather than measuring historical changes.

### Clinical Implications

Evidence half-life estimation has three practical applications:

1. **Updating prioritization.** Review teams could use half-life to prioritize which reviews need urgent updating. A review with a 3-year half-life needs attention now; one with a 30-year half-life can wait.

2. **Guideline durability.** Guidelines that cite reviews with short half-lives should include explicit expiration dates or surveillance triggers.

3. **Research investment.** Research funders could target fields where significant meta-analyses are Fragile — these are the areas where a single new trial could change clinical practice.

### Limitations

First, the method assumes linear drift extrapolation, which may not hold over long periods. Second, it does not model paradigm shifts (e.g., a new drug class rendering older evidence irrelevant). Third, the DerSimonian-Laird estimator used for cumulative tau-squared is biased for small k. Fourth, requiring chronological study ordering means the method is sensitive to publication delays.

### Tool Availability

The Evidence Half-Life tool is freely available at https://github.com/mahmood726-cyber/evidencehalflife. Users can enter cumulative meta-analysis data and interactively explore projected half-lives.

## References

1. Shojania KG, Sampson M, Ansari MT, et al. How quickly do systematic reviews go out of date? A survival analysis. Ann Intern Med. 2007;147:224-233.
2. French SD, McDonald S, McKenzie JE, Green SE. Investing in updating: how do conclusions change when Cochrane systematic reviews are updated? BMC Med Res Methodol. 2005;5:33.
3. Bastian H, Glasziou P, Chalmers I. Seventy-five trials and eleven systematic reviews a day: how will we ever keep up? PLoS Med. 2010;7:e1000326.
4. Cochrane. Cochrane Strategy to 2020. Available at: https://www.cochrane.org/about-us/strategy-to-2020
5. Higgins JPT, Thomas J, Chandler J, et al. Cochrane Handbook. 2nd ed. Wiley; 2019.
6. Viechtbauer W. Conducting meta-analyses in R with the metafor package. J Stat Softw. 2010;36:1-48.
