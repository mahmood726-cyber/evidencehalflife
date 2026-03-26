#!/usr/bin/env Rscript
# Evidence Half-Life Pipeline: Estimate shelf life of 501 Cochrane meta-analyses
# Uses cumulative MA trajectory + drift extrapolation

suppressPackageStartupMessages(library(metafor))

DATA_DIR <- "C:/Models/Pairwise70/data"
OUT_DIR  <- "C:/Models/EvidenceHalfLife/data"
dir.create(OUT_DIR, showWarnings = FALSE, recursive = TRUE)

rda_files <- list.files(DATA_DIR, pattern = "\\.rda$", full.names = TRUE)
cat("Found", length(rda_files), "RDA files\n")

results <- data.frame(
  review_id = character(), k = integer(), first_year = integer(), last_year = integer(),
  span_years = numeric(), theta_final = numeric(), se_final = numeric(), z_final = numeric(),
  significant = logical(), tau2_final = numeric(), i2_final = numeric(),
  drift_per_year = numeric(), drift_toward_null = logical(),
  fragility_z = numeric(), tau2_trend_per_decade = numeric(),
  half_life = numeric(), category = character(),
  stringsAsFactors = FALSE
)

n_proc <- 0

for (f in rda_files) {
  rid <- sub("_data\\.rda$", "", basename(f))
  tryCatch({
    d <- get(load(f))
    if ("Analysis.number" %in% names(d)) d <- d[d$Analysis.number == min(d$Analysis.number), ]
    if (nrow(d) < 3) next  # Need >=3 for drift estimation

    yi <- log(d$Mean)
    sei <- (log(d$CI.end) - log(d$CI.start)) / (2 * qnorm(0.975))
    years <- d$Study.year

    valid <- is.finite(yi) & is.finite(sei) & sei > 0 & is.finite(years) & years > 1900
    yi <- yi[valid]; sei <- sei[valid]; years <- years[valid]
    if (length(yi) < 3) next

    # Sort chronologically
    ord <- order(years)
    yi <- yi[ord]; sei <- sei[ord]; years <- years[ord]

    # Cumulative MA at each step
    cum_theta <- cum_se <- cum_z <- cum_tau2 <- numeric(length(yi))
    for (j in 2:length(yi)) {
      fit <- tryCatch(rma(yi = yi[1:j], sei = sei[1:j], method = "DL"), error = function(e) NULL)
      if (is.null(fit)) next
      cum_theta[j] <- as.numeric(fit$beta)
      cum_se[j] <- as.numeric(fit$se)
      cum_z[j] <- cum_theta[j] / cum_se[j]
      cum_tau2[j] <- as.numeric(fit$tau2)
    }

    # Final MA
    fit_final <- tryCatch(rma(yi = yi, sei = sei, method = "REML"), error = function(e) NULL)
    if (is.null(fit_final)) next

    theta_f <- as.numeric(fit_final$beta)
    se_f <- as.numeric(fit_final$se)
    z_f <- theta_f / se_f
    tau2_f <- as.numeric(fit_final$tau2)
    i2_f <- as.numeric(fit_final$I2)

    # Drift: weighted regression of cumulative theta on year (skip first point)
    idx <- 2:length(yi)
    if (length(idx) < 2) next
    w <- 1 / (cum_se[idx]^2 + 1e-10)
    x <- years[idx] - years[1]
    lm_fit <- tryCatch(lm(cum_theta[idx] ~ x, weights = w), error = function(e) NULL)
    drift <- if (!is.null(lm_fit)) coef(lm_fit)[2] else 0

    # Tau2 trend
    tau2_slope <- 0
    if (length(idx) >= 4) {
      t2_fit <- tryCatch(lm(cum_tau2[idx] ~ x), error = function(e) NULL)
      if (!is.null(t2_fit)) tau2_slope <- coef(t2_fit)[2] * 10  # per decade
    }

    # Drift toward null?
    drift_toward_null <- (theta_f > 0 & drift < 0) | (theta_f < 0 & drift > 0)

    # Half-life: project forward
    sig <- abs(z_f) > 1.96
    half_life <- NA
    if (!drift_toward_null & sig) {
      half_life <- Inf  # Strengthening or stable + significant
    } else {
      trials_per_year <- length(yi) / max(1, years[length(years)] - years[1])
      k <- length(yi)
      for (t in 1:100) {
        new_k <- k + trials_per_year * t
        proj_theta <- theta_f + drift * t
        proj_se <- se_f * sqrt(k / new_k)
        proj_z <- abs(proj_theta / proj_se)
        if (sig & proj_z < 1.96) { half_life <- t; break }
        if (!sig & proj_z >= 1.96) { half_life <- t; break }
      }
      if (is.na(half_life)) half_life <- Inf
    }

    cat_label <- if (is.infinite(half_life)) "Stable" else if (half_life > 20) "Stable" else if (half_life > 5) "Aging" else "Fragile"

    results <- rbind(results, data.frame(
      review_id = rid, k = length(yi),
      first_year = years[1], last_year = years[length(years)],
      span_years = years[length(years)] - years[1],
      theta_final = theta_f, se_final = se_f, z_final = z_f,
      significant = sig, tau2_final = tau2_f, i2_final = i2_f,
      drift_per_year = drift, drift_toward_null = drift_toward_null,
      fragility_z = abs(z_f), tau2_trend_per_decade = tau2_slope,
      half_life = if (is.infinite(half_life)) 999 else half_life,
      category = cat_label,
      stringsAsFactors = FALSE
    ))

    n_proc <- n_proc + 1
    if (n_proc %% 50 == 0) cat("  Processed", n_proc, "...\n")

  }, error = function(e) {})
}

cat("\n=== PIPELINE COMPLETE ===\n")
cat("Analyzed:", nrow(results), "reviews\n\n")

write.csv(results, file.path(OUT_DIR, "halflife_all.csv"), row.names = FALSE)
saveRDS(results, file.path(OUT_DIR, "halflife_all.rds"))

# ── HEADLINE STATISTICS ──
sig <- results[results$significant == TRUE, ]
cat("=== HEADLINE FINDINGS ===\n")
cat("Total analyzed:", nrow(results), "\n")
cat("Significant:", nrow(sig), "(", round(100 * nrow(sig)/nrow(results), 1), "%)\n\n")

cat("Among SIGNIFICANT meta-analyses:\n")
finite_hl <- sig[sig$half_life < 999, ]
stable <- sig[sig$half_life >= 999 | sig$category == "Stable", ]
aging <- sig[sig$category == "Aging", ]
fragile <- sig[sig$category == "Fragile", ]

cat("  Stable (>20yr):  ", nrow(stable), "(", round(100*nrow(stable)/nrow(sig),1), "%)\n")
cat("  Aging (5-20yr):  ", nrow(aging), "(", round(100*nrow(aging)/nrow(sig),1), "%)\n")
cat("  Fragile (<5yr):  ", nrow(fragile), "(", round(100*nrow(fragile)/nrow(sig),1), "%)\n")

if (nrow(finite_hl) > 0) {
  cat("\n  Among those with FINITE half-life:\n")
  cat("    Median:  ", round(median(finite_hl$half_life), 1), "years\n")
  cat("    Mean:    ", round(mean(finite_hl$half_life), 1), "years\n")
  cat("    IQR:     ", round(quantile(finite_hl$half_life, 0.25), 1), "-",
      round(quantile(finite_hl$half_life, 0.75), 1), "years\n")
}

cat("\nAmong ALL reviews:\n")
cat("  Median drift:", round(median(results$drift_per_year, na.rm = TRUE), 5), "log-units/year\n")
cat("  Median fragility:", round(median(results$fragility_z, na.rm = TRUE), 2), "z-scores\n")
cat("  Median I2:", round(median(results$i2_final, na.rm = TRUE), 1), "%\n")

# Category table for all
cat("\nCategory distribution (ALL reviews):\n")
print(table(results$category))
