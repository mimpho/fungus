"""Unit tests for the Outbreak Index scoring algorithm.

Pure function tests — no database, no HTTP, no fixtures required.
These run in milliseconds and cover the core business logic.
"""
from datetime import date

import pytest

from app.services.scoring import (
    SEASONAL_FACTOR,
    OIResult,
    compute_oi,
    score_humidity,
    score_pa21,
    score_ripening,
    score_thermal,
    score_label,
)


# ── score_pa21 ────────────────────────────────────────────────────────────────

class TestScorePa21:
    def test_below_minimum_returns_zero(self):
        assert score_pa21(0) == 0
        assert score_pa21(14.9) == 0

    def test_low_rain_ramps_up(self):
        # 15mm → start of ramp, 30mm → 40
        assert score_pa21(15) > 0
        assert score_pa21(30) == 40

    def test_mid_rain_ramps_further(self):
        # 60mm → 75, the top of the mid ramp
        assert score_pa21(60) == 75

    def test_optimum_range_reaches_100(self):
        assert score_pa21(120) == 100

    def test_excess_rain_penalises(self):
        assert score_pa21(140) < 100
        assert score_pa21(200) < score_pa21(140)

    def test_extreme_excess_does_not_go_negative(self):
        assert score_pa21(10_000) >= 0

    def test_monotonic_in_normal_range(self):
        # Should increase from 15 to 120
        scores = [score_pa21(mm) for mm in range(15, 121, 5)]
        assert scores == sorted(scores)


# ── score_thermal ─────────────────────────────────────────────────────────────

class TestScoreThermal:
    def test_below_min_temp_returns_zero(self):
        assert score_thermal(temp_avg=0.0, frost_hours_72h=0) == 0

    def test_above_max_temp_returns_zero(self):
        assert score_thermal(temp_avg=25.0, frost_hours_72h=0) == 0

    def test_optimal_temp_no_frost_returns_100(self):
        # At t_opt (14°C default) with no frost → 100
        assert score_thermal(temp_avg=14.0, frost_hours_72h=0) == 100

    def test_frost_penalty_applied(self):
        base = score_thermal(temp_avg=14.0, frost_hours_72h=0)
        with_frost = score_thermal(temp_avg=14.0, frost_hours_72h=5)
        assert with_frost == base - 15  # 5 hours × 3 pts

    def test_frost_penalty_capped_at_40(self):
        # 20 frost hours × 3 = 60, but cap is 40
        result = score_thermal(temp_avg=14.0, frost_hours_72h=20)
        assert result == 60  # 100 - 40

    def test_score_never_negative(self):
        # base at 6°C ≈ 11 pts; 14 frost hours × 3 = 42, capped at 40 → max(0, 11-40) = 0
        assert score_thermal(temp_avg=6.0, frost_hours_72h=14) == 0

    def test_custom_species_thresholds(self):
        # Species that likes cold: min=0, opt=8, max=15
        cold_species = score_thermal(
            temp_avg=8.0, frost_hours_72h=0,
            temp_min_c=0.0, temp_opt_c=8.0, temp_max_c=15.0,
        )
        assert cold_species == 100


# ── score_ripening ────────────────────────────────────────────────────────────

class TestScoreRipening:
    def test_exact_cycle_returns_100(self):
        assert score_ripening(days_since_rain=8, cycle_days=8) == 100

    def test_delta_1_returns_85(self):
        assert score_ripening(days_since_rain=7, cycle_days=8) == 85
        assert score_ripening(days_since_rain=9, cycle_days=8) == 85

    def test_delta_3_returns_60(self):
        assert score_ripening(days_since_rain=5, cycle_days=8) == 60

    def test_delta_6_returns_30(self):
        assert score_ripening(days_since_rain=2, cycle_days=8) == 30

    def test_large_delta_returns_zero(self):
        # delta must be > 8 to return 0; delta=8 returns 30, delta=9+ returns 0
        assert score_ripening(days_since_rain=17, cycle_days=8) == 0
        assert score_ripening(days_since_rain=30, cycle_days=8) == 0

    def test_custom_cycle(self):
        # Boletus edulis: cycle ~10 days
        assert score_ripening(days_since_rain=10, cycle_days=10) == 100
        assert score_ripening(days_since_rain=8, cycle_days=10) == 85


# ── score_humidity ────────────────────────────────────────────────────────────

class TestScoreHumidity:
    def test_very_dry_returns_zero(self):
        assert score_humidity(0) == 0
        assert score_humidity(39) == 0

    def test_optimum_range_returns_high_score(self):
        # 70-90% → should be in 50-100 range
        assert score_humidity(70) >= 50
        assert score_humidity(90) >= 90

    def test_very_high_humidity_plateaus(self):
        assert score_humidity(95) == 95
        assert score_humidity(100) == 95  # plateau, does not keep climbing

    def test_monotonic_up_to_90(self):
        scores = [score_humidity(h) for h in range(40, 91, 5)]
        assert scores == sorted(scores)


# ── SEASONAL_FACTOR ───────────────────────────────────────────────────────────

class TestSeasonalFactor:
    def test_all_months_present(self):
        assert set(SEASONAL_FACTOR.keys()) == set(range(1, 13))

    def test_october_is_peak(self):
        assert SEASONAL_FACTOR[10] == 100

    def test_january_is_low(self):
        assert SEASONAL_FACTOR[1] < 25

    def test_all_values_in_range(self):
        for month, value in SEASONAL_FACTOR.items():
            assert 0 <= value <= 100, f"Month {month} out of range: {value}"


# ── compute_oi ────────────────────────────────────────────────────────────────

class TestComputeOi:
    def _good_conditions(self, **overrides):
        """Base kwargs representing ideal October mushrooming conditions."""
        base = dict(
            reference_date=date(2026, 10, 15),
            pa21_mm=90.0,
            temp_avg_7d=12.0,
            frost_hours_72h=0,
            days_since_rain=8,
            humidity_pct=80,
        )
        base.update(overrides)
        return base

    def test_returns_oi_result(self):
        result = compute_oi(**self._good_conditions())
        assert isinstance(result, OIResult)

    def test_score_in_valid_range(self):
        result = compute_oi(**self._good_conditions())
        assert 0 <= result.score <= 100

    def test_ideal_october_scores_high(self):
        result = compute_oi(**self._good_conditions())
        assert result.score >= 75

    def test_poor_february_scores_low(self):
        result = compute_oi(**self._good_conditions(
            reference_date=date(2026, 2, 15),
            pa21_mm=5.0,       # barely any rain
            temp_avg_7d=1.0,   # cold
            humidity_pct=35,   # dry
        ))
        assert result.score < 30

    def test_components_stored_in_result(self):
        result = compute_oi(**self._good_conditions())
        assert result.pa21 >= 0
        assert result.thermal >= 0
        assert result.seasonal == SEASONAL_FACTOR[10]
        assert result.ripening >= 0
        assert result.humidity >= 0

    def test_raw_inputs_preserved(self):
        result = compute_oi(**self._good_conditions(pa21_mm=77.5, days_since_rain=6))
        assert result.pa21_mm == 77.5
        assert result.days_since_rain == 6

    def test_frost_degrades_score(self):
        no_frost = compute_oi(**self._good_conditions(frost_hours_72h=0))
        heavy_frost = compute_oi(**self._good_conditions(frost_hours_72h=15))
        assert heavy_frost.score < no_frost.score

    def test_score_capped_at_100(self):
        # Even with perfect inputs the score should not exceed 100
        result = compute_oi(**self._good_conditions(
            pa21_mm=90.0,
            temp_avg_7d=14.0,
            humidity_pct=85,
            days_since_rain=8,
        ))
        assert result.score <= 100

    def test_weights_sum_correctly(self):
        """Manual calculation matches compute_oi output."""
        kwargs = self._good_conditions(
            pa21_mm=90.0,
            temp_avg_7d=14.0,
            frost_hours_72h=0,
            days_since_rain=8,
            humidity_pct=80,
        )
        result = compute_oi(**kwargs)
        expected_raw = (
            result.pa21     * 0.30
            + result.thermal  * 0.25
            + result.seasonal * 0.25
            + result.ripening * 0.12
            + result.humidity * 0.08
        )
        assert result.score == min(100, round(expected_raw))


# ── score_label ───────────────────────────────────────────────────────────────

class TestScoreLabel:
    def test_excellent(self):
        assert score_label(85) == "Excellent"
        assert score_label(100) == "Excellent"

    def test_very_good(self):
        assert score_label(70) == "Very good"
        assert score_label(84) == "Very good"

    def test_good(self):
        assert score_label(55) == "Good"
        assert score_label(69) == "Good"

    def test_poor(self):
        assert score_label(0) == "Poor"
        assert score_label(54) == "Poor"
