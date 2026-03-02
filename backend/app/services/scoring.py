"""
Outbreak Index (OI) algorithm.

Replaces and extends the current frontend overallScore.
Operates on real historical data instead of a single point-in-time reading.

Formula:
    OI = PA21_score  × 0.30
       + Thermal_score × 0.25
       + Seasonal      × 0.25
       + Ripening_score × 0.12
       + Humidity_score × 0.08
"""
from dataclasses import dataclass
from datetime import date

# ── Seasonal factor (inherited from frontend, calibrated by observations) ─────

SEASONAL_FACTOR: dict[int, int] = {
    1: 15, 2: 20, 3: 38, 4: 58,  5: 62,
    6: 28, 7: 18, 8: 48, 9: 80, 10: 100, 11: 88, 12: 42,
}


# ── Score components ──────────────────────────────────────────────────────────

def score_pa21(mm: float) -> int:
    """
    Accumulated precipitation over the last 21 days (PA21).
    Optimum range: 60–120 mm.
    """
    if mm < 15:
        return 0
    if mm < 30:
        return int(mm / 30 * 40)
    if mm < 60:
        return 40 + int((mm - 30) / 30 * 35)
    if mm <= 120:
        return 75 + int((mm - 60) / 60 * 25)
    # Penalise excess rain
    return max(0, 100 - int((mm - 120) / 20 * 15))


def score_thermal(
    temp_avg: float,
    frost_hours_72h: int,
    temp_min_c: float = 5.0,
    temp_opt_c: float = 14.0,
    temp_max_c: float = 22.0,
) -> int:
    """
    Thermal window score + frost penalty.

    temp_avg:       average temperature over the last 7 days.
    frost_hours_72h: hours with T < 0°C in the last 72 h.
    temp_*_c:       species-specific biological thresholds (defaults are generic).
    """
    base = _score_temperature(temp_avg, temp_min_c, temp_opt_c, temp_max_c)
    frost_penalty = min(40, frost_hours_72h * 3)  # -3 pts per frost hour, max -40
    return max(0, base - frost_penalty)


def score_ripening(days_since_rain: int, cycle_days: int = 8) -> int:
    """
    Ripening score: peaks when days since last significant rain event (≥10 mm)
    matches the species' biological cycle.

    cycle_days: species-specific days from rain to fruiting (default 8 = generic).
    """
    delta = abs(days_since_rain - cycle_days)
    if delta == 0:
        return 100
    if delta <= 2:
        return 85
    if delta <= 5:
        return 60
    if delta <= 8:
        return 30
    return 0


def score_humidity(humidity_pct: int) -> int:
    """Ambient relative humidity score. Optimum: 70–90%."""
    if humidity_pct < 40:
        return 0
    if humidity_pct < 60:
        return int((humidity_pct - 40) / 20 * 50)
    if humidity_pct <= 90:
        return 50 + int((humidity_pct - 60) / 30 * 50)
    # Very high humidity (>90%) is still good, slight plateau
    return 95


# ── Main OI calculator ────────────────────────────────────────────────────────

@dataclass
class OIResult:
    """Result of the Outbreak Index calculation."""
    score: int                    # 0-100 final score
    pa21: int
    thermal: int
    seasonal: int
    ripening: int
    humidity: int
    pa21_mm: float                # raw accumulated precipitation
    days_since_rain: int          # raw ripening input


def compute_oi(
    *,
    reference_date: date,
    pa21_mm: float,
    temp_avg_7d: float,
    frost_hours_72h: int,
    days_since_rain: int,
    humidity_pct: int,
    # Optional species-specific overrides
    temp_min_c: float = 5.0,
    temp_opt_c: float = 14.0,
    temp_max_c: float = 22.0,
    cycle_days: int = 8,
) -> OIResult:
    """
    Compute the Outbreak Index for a zone on a given date.

    All inputs are derived from climate_history rows by the ingestion service
    before calling this function.
    """
    s_pa21 = score_pa21(pa21_mm)
    s_thermal = score_thermal(
        temp_avg_7d, frost_hours_72h, temp_min_c, temp_opt_c, temp_max_c
    )
    s_seasonal = SEASONAL_FACTOR[reference_date.month]
    s_ripening = score_ripening(days_since_rain, cycle_days)
    s_humidity = score_humidity(humidity_pct)

    raw = (
        s_pa21     * 0.30
        + s_thermal  * 0.25
        + s_seasonal * 0.25
        + s_ripening * 0.12
        + s_humidity * 0.08
    )

    return OIResult(
        score=min(100, round(raw)),
        pa21=s_pa21,
        thermal=s_thermal,
        seasonal=s_seasonal,
        ripening=s_ripening,
        humidity=s_humidity,
        pa21_mm=pa21_mm,
        days_since_rain=days_since_rain,
    )


# ── UI helpers ────────────────────────────────────────────────────────────────

def score_label(score: int) -> str:
    if score >= 85:
        return "Excellent"
    if score >= 70:
        return "Very good"
    if score >= 55:
        return "Good"
    return "Poor"


# ── Internal helpers ──────────────────────────────────────────────────────────

def _score_temperature(
    temp: float, t_min: float, t_opt: float, t_max: float
) -> int:
    """Generic temperature score based on min/opt/max thresholds."""
    if temp < t_min or temp > t_max:
        return 0
    if temp <= t_opt:
        return int((temp - t_min) / (t_opt - t_min) * 100)
    return int((t_max - temp) / (t_max - t_opt) * 100)
