// engine.mjs — pure functions extracted VERBATIM from ../halflife.html
// Source: halflife.html lines 183-385 (normalCDF, cumulativeMA, estimateHalfLife).
// No edits to function bodies. Only an `export {...}` appended at the bottom.
// These functions do not reference `document`, so no DOM stub is required.

function normalCDF(x) {
  if (x > 8) return 1; if (x < -8) return 0;
  const a1=.254829592,a2=-.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=.3275911;
  const s=x<0?-1:1, ax=Math.abs(x)/Math.sqrt(2), t=1/(1+p*ax);
  return .5*(1+s*(1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-ax*ax)));
}

function cumulativeMA(studies) {
  const results = [];
  for (let j = 1; j <= studies.length; j++) {
    const subset = studies.slice(0, j);
    // Fixed-effect (inverse-variance) pooling for cumulative trajectory
    let sumW = 0, sumWY = 0;
    for (const s of subset) {
      const w = 1 / (s.sei * s.sei);
      sumW += w;
      sumWY += w * s.yi;
    }
    const theta = sumWY / sumW;
    const se = 1 / Math.sqrt(sumW);
    const z = theta / se;
    const p = 2 * (1 - normalCDF(Math.abs(z)));

    // DL tau2
    let Q = 0, C = 0;
    for (const s of subset) {
      const w = 1 / (s.sei * s.sei);
      Q += w * (s.yi - theta) * (s.yi - theta);
      C += w - (w * w) / sumW;
    }
    const tau2 = Math.max(0, (Q - (j - 1)) / C);

    results.push({
      k: j, year: studies[j - 1].year,
      theta, se, z, p, tau2,
      significant: Math.abs(z) > 1.96,
      ci_lo: theta - 1.96 * se, ci_hi: theta + 1.96 * se
    });
  }
  return results;
}

function estimateHalfLife(cma, trialsPerYear) {
  if (cma.length < 3) return { halfLife: null, drift: 0, fragility: 0, tau2Trend: 0, message: 'Need >= 3 studies' };

  const current = cma[cma.length - 1];
  const firstYear = cma[0].year;
  const lastYear = current.year;
  const span = lastYear - firstYear;

  // 1. Effect drift: weighted linear regression of cumulative theta on year
  let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0, sumW = 0;
  for (const r of cma) {
    const w = 1 / (r.se * r.se);
    const x = r.year - firstYear;
    sumW += w; sumX += w * x; sumY += w * r.theta;
    sumXX += w * x * x; sumXY += w * x * r.theta;
  }
  // Guard: when all studies share the same year, denominator is 0 → drift = 0 (no temporal info)
  const denom = sumW * sumXX - sumX * sumX;
  const drift = Math.abs(denom) > 1e-12 ? (sumW * sumXY - sumX * sumY) / denom : 0;

  // 2. Fragility distance: current z-score
  const fragility = Math.abs(current.z);

  // 3. Tau2 trend (simple slope of tau2 over time)
  let tau2Slope = 0;
  if (cma.length >= 5) {
    let sx = 0, sy = 0, sxx = 0, sxy = 0, n = 0;
    for (const r of cma.slice(2)) { // skip first 2 (tau2 unstable for k<3)
      const x = r.year - firstYear;
      sx += x; sy += r.tau2; sxx += x * x; sxy += x * r.tau2; n++;
    }
    tau2Slope = n > 1 ? (n * sxy - sx * sy) / (n * sxx - sx * sx) : 0;
  }

  // 4. Project forward: when will |z| cross 1.96?
  let halfLife = null;
  const k = current.k;
  const thetaNow = current.theta;
  const seNow = current.se;

  // Is drift toward or away from null?
  const driftTowardNull = (thetaNow > 0 && drift < 0) || (thetaNow < 0 && drift > 0);

  if (!driftTowardNull && Math.abs(current.z) > 1.96) {
    halfLife = Infinity; // Evidence strengthening or stable + currently significant
  } else {
    // Simulate year by year
    for (let t = 1; t <= 100; t++) {
      const newK = k + trialsPerYear * t;
      const projTheta = thetaNow + drift * t;
      const projSE = seNow * Math.sqrt(k / newK); // SE shrinks with more studies
      const projZ = Math.abs(projTheta / projSE);

      if (current.significant && projZ < 1.96) {
        halfLife = t;
        break;
      }
      if (!current.significant && projZ >= 1.96) {
        halfLife = t; // Time until evidence becomes significant
        break;
      }
    }
    if (halfLife === null) halfLife = Infinity; // Didn't cross in 100 years
  }

  return {
    halfLife: halfLife === Infinity ? Infinity : halfLife,
    drift,
    fragility,
    tau2Trend: tau2Slope * 10, // per decade
    driftTowardNull,
    currentSig: current.significant,
    currentZ: current.z,
    currentTheta: current.theta,
    currentSE: current.se,
    k: current.k,
    lastYear
  };
}

export { normalCDF, cumulativeMA, estimateHalfLife };
