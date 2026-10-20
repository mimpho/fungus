"""Several species scored as one: the mean of the excellent edibles that grow at a point.

What the map shows before a species is chosen is the mean, at each pixel, of the excellent
edibles present there (src/lib/reliefLayer.js, paintReliefMany). The thermometer, the chart and
the calendar of a point with no species chosen must say the same number, so they score the same
way: each member species is scored with its own thermal range and its own altitude / forest / soil
fit (`SpeciesParams.fit_parts`), the members out of their fruiting months that day do not count,
and the day's score is the mean of the rest. The climate behind the score (soil water, rain on
the way, dry days...) does not depend on the species, so it is the one of any member.
"""
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, replace
from datetime import date

from app.services.forest_classes import classes_for
from app.services.scoring_v2 import (
    ClimateDay,
    SpeciesParams,
    V2Factors,
    V2Result,
    compute_v2_multi,
    compute_v2_series,
    round_half_up,
)

ENSEMBLE_SPECIES = "excellent"  # the `species` value that asks for the ensemble


def counts_in_ensemble(forest_types) -> bool:
    """Only the species that grow in forest make the mean. The ones the forest cannot judge
    (meadow, garden, riparian, or no forest type) count nothing: a lawn in a town must not
    paint a place green for someone looking for mushrooms."""
    return classes_for(forest_types) is not None


@dataclass(frozen=True)
class Member:
    params: SpeciesParams
    fruiting_months: tuple[int, ...] = ()  # empty = the whole year


@dataclass(frozen=True)
class Ensemble:
    members: tuple[Member, ...]


def _mean(values: Sequence[float]) -> float:
    return sum(values) / len(values)


def mean_result(results: Sequence[V2Result]) -> V2Result:
    """One result from several scored the same day: mean score and mean species-dependent
    factors; the rest of the climate comes from the first (it is the same for all)."""
    f = [r.factors for r in results]
    factors = V2Factors(
        activation=round_half_up(_mean([x.activation for x in f])),
        moisture=round_half_up(_mean([x.moisture for x in f])),
        temperature=round_half_up(_mean([x.temperature for x in f])),
        season=_mean([x.season for x in f]),
        drying=_mean([x.drying for x in f]),
        heat=_mean([x.heat for x in f]),
        frost=_mean([x.frost for x in f]),
        shock=_mean([x.shock for x in f]),
        needs=_mean([x.needs for x in f]),
        fit=_mean([x.fit for x in f]),
    )
    score = round_half_up(_mean([r.score for r in results]))
    return replace(results[0], score=score, factors=factors)


def score_series(
    days: Iterable[ClimateDay],
    elevation_m: float | None,
    species: SpeciesParams | Ensemble | None,
    output_from: date | None = None,
) -> list[V2Result]:
    """compute_v2_series for one species, or for an Ensemble (a day with none of its members in
    season scores 0, as the map paints nothing there; an Ensemble with no members at all, because
    no excellent species fits the place, gives the score of the general climate model)."""
    if not isinstance(species, Ensemble):
        return compute_v2_series(days, elevation_m, species, output_from)
    days = list(days)
    generic = compute_v2_series(days, elevation_m, None, output_from)
    if not species.members:
        return generic  # no species fits the place: only the general climate can be read
    params = [m.params for m in species.members]
    per_member = compute_v2_multi(days, elevation_m, params, output_from)
    by_day: dict[date, list[V2Result]] = {}
    for member, results in zip(species.members, per_member, strict=True):
        for r in results:
            if not member.fruiting_months or r.date.month in member.fruiting_months:
                by_day.setdefault(r.date, []).append(r)
    return [
        mean_result(by_day[r.date]) if r.date in by_day else replace(r, score=0) for r in generic
    ]
