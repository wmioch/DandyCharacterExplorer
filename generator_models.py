"""
generator_models.py

Purpose
-------
Models machine-completion timing in your game, including:
  • Base extraction speed (units repaired per real second).
  • Randomly timed skill checks that pause new spawns for a duration + grace period.
  • Skill check success probability (chance the player hits the check and earns its bonus).

Two drop-in functions are exposed:
    calc_continuous_model(...)   # skill checks can fire immediately once grace ends
    calc_discrete_model(...)     # skill checks are only polled once per real-world second

Each returns a ModelResult describing default/average completion times, expected number of
skill checks triggered, and so on.

Model assumptions
-----------------
• Machines require `total_units` (default 45) units of progress to finish.
• Extraction speed U is constant (no pausing while a skill check animation plays).
• Every skill check triggers the same “dead time” (duration + grace) regardless of success.
• Skill check success chance is independent per check; failures simply forfeit the S-unit bonus.
• Skill check success awards progress instantly (no partials or penalties on failure).
  If failures should impose penalties, wire that into the spot marked TODO in the code.

Parameter glossary
------------------
Extraction speed (U):         Units per real second the character repairs without help.
Skill check chance (p):       Probability a check begins in the next second (0 ≤ p ≤ 1). Interpreted
                              differently in each model (Poisson hazard vs. discrete tick).
Skill check units (S):        Bonus units granted on a successful check.
Skill check success (q):      Chance (0–1) the player hits the check once it appears.
Skill check duration:         Random length of the check UI; we model it uniform between min and max.
Grace period (g):             Extra time after a check resolves where no new check can spawn.
Dead time (D):                Expected lockout per check: mean duration + grace = E[L] + g.
"""

from dataclasses import dataclass
from math import log
from typing import Optional

# ---------------------------------------------------------------------------
# Configuration dataclasses
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ModelInputs:
    """
    Collects all knobs used by the timing models.

    extraction_speed (U):
        Base repair speed in units per second (must be > 0).

    skill_check_chance (p):
        Chance that a skill check begins during the next second (0 ≤ p ≤ 1).
        • Continuous model converts this into a Poisson hazard λ = -ln(1 - p).
        • Discrete model treats it as the probability on each 1-second polling tick.

    skill_check_units (S):
        Units awarded immediately upon success (must be ≥ 0).

    skill_check_success (q):
        Probability (0–1) the player succeeds once a skill check triggers.
        The expected bonus per check is S * q. Failures currently have no extra penalty
        beyond missing the bonus (add one where indicated below if needed).

    total_units:
        Total progress required to finish the machine (default 45 units).

    min_skill_check_duration / max_skill_check_duration:
        Lower/upper bounds (in seconds) of the skill check animation/interaction.
        An equal-weight (uniform) distribution is assumed; mean duration is their midpoint.

    grace_period (g):
        Additional seconds after a skill check resolves during which no new check can spawn.

    epsilon:
        Tiny positive constant that keeps p numerically away from 1 when taking ln(1 - p).
    """
    extraction_speed: float
    skill_check_chance: float
    skill_check_units: float
    skill_check_success: float = 1.0
    total_units: float = 45.0
    min_skill_check_duration: float = 0.75
    max_skill_check_duration: float = 2.5
    grace_period: float = 2.0
    epsilon: float = 1e-12

    @property
    def mean_skill_check_duration(self) -> float:
        """Expected skill check duration, E[L] = (min + max) / 2."""
        return 0.5 * (self.min_skill_check_duration + self.max_skill_check_duration)

    @property
    def dead_time(self) -> float:
        """Expected lockout after a check starts: duration + grace."""
        return self.mean_skill_check_duration + self.grace_period


@dataclass(frozen=True)
class ModelResult:
    """
    Outputs for agents/UI:
        default_time                  Time with zero skill checks (total_units / U).
        average_time                  Expected completion time under the chosen model.
        expected_skill_checks         Mean number of checks triggered.
        expected_successful_checks    Mean number of checks successfully passed.
        effective_check_rate          Observed check trigger rate (per real second).
        effective_progress_rate       Net progress rate (units/second) including bonuses.
        hazard_rate                   λ for the continuous model (None otherwise).
    """
    default_time: float
    average_time: float
    expected_skill_checks: float
    expected_successful_checks: float
    effective_check_rate: float
    effective_progress_rate: float
    hazard_rate: Optional[float] = None


# ---------------------------------------------------------------------------
# Core computations
# ---------------------------------------------------------------------------

def _sanitize_inputs(params: ModelInputs) -> None:
    """Fail fast on invalid inputs so agents don’t propagate NaNs."""
    if params.extraction_speed <= 0:
        raise ValueError("extraction_speed (U) must be > 0.")
    if not (0.0 <= params.skill_check_chance <= 1.0):
        raise ValueError("skill_check_chance (p) must be in [0, 1].")
    if params.skill_check_units < 0:
        raise ValueError("skill_check_units (S) must be ≥ 0.")
    if not (0.0 <= params.skill_check_success <= 1.0):
        raise ValueError("skill_check_success (q) must be in [0, 1].")
    if params.total_units <= 0:
        raise ValueError("total_units must be > 0.")
    if params.min_skill_check_duration < 0 or params.max_skill_check_duration < 0:
        raise ValueError("Skill check durations must be ≥ 0.")
    if params.max_skill_check_duration < params.min_skill_check_duration:
        raise ValueError("max_skill_check_duration must be ≥ min_skill_check_duration.")
    if params.grace_period < 0:
        raise ValueError("grace_period must be ≥ 0.")
    if params.epsilon <= 0:
        raise ValueError("epsilon must be > 0.")


def calc_continuous_model(params: ModelInputs) -> ModelResult:
    """
    Continuous-time model (Poisson arrivals with non-paralyzable dead time):
        • After grace ends, a new check can spawn immediately.
        • p is mapped to hazard λ = -ln(1 - p).
        • Observed rate r = λ / (1 + λ * D), where D = dead_time.
        • Expected progress bonus per check = S * q.
        • Repair progress continues during the check UI.

    Use if playtesting shows checks arrive without a forced 1-second polling delay.
    """
    _sanitize_inputs(params)

    U = params.extraction_speed
    p = params.skill_check_chance
    S = params.skill_check_units
    q = params.skill_check_success
    D = params.dead_time
    total = params.total_units

    default_time = total / U

    if p >= 1.0 - params.epsilon:
        hazard = float("inf")
        effective_check_rate = 1.0 / D
    elif p == 0.0:
        hazard = 0.0
        effective_check_rate = 0.0
    else:
        hazard = -log(1.0 - p)  # λ
        effective_check_rate = hazard / (1.0 + hazard * D)

    expected_bonus_per_check = S * q
    effective_progress_rate = U + expected_bonus_per_check * effective_check_rate

    # TODO: If failures impose a penalty (e.g., regression), subtract its expected value here.

    average_time = total / effective_progress_rate
    expected_checks = effective_check_rate * average_time
    expected_successful_checks = expected_checks * q

    return ModelResult(
        default_time=default_time,
        average_time=average_time,
        expected_skill_checks=expected_checks,
        expected_successful_checks=expected_successful_checks,
        effective_check_rate=effective_check_rate,
        effective_progress_rate=effective_progress_rate,
        hazard_rate=None if hazard == float("inf") else hazard,
    )


def calc_discrete_model(params: ModelInputs) -> ModelResult:
    """
    Discrete 1-second polling model:
        • After grace ends, the system waits until the next whole second tick.
        • Each second, a Bernoulli(p) trial decides whether a check begins.
        • Effective rate r = p / (1 + p * D).
        • Expected bonus per check = S * q (same success probability assumption).
    """
    _sanitize_inputs(params)

    U = params.extraction_speed
    p = params.skill_check_chance
    S = params.skill_check_units
    q = params.skill_check_success
    D = params.dead_time
    total = params.total_units

    default_time = total / U

    effective_check_rate = p / (1.0 + p * D) if p > 0.0 else 0.0
    expected_bonus_per_check = S * q
    effective_progress_rate = U + expected_bonus_per_check * effective_check_rate

    # TODO: If failed checks impose penalties, subtract expected loss from effective_progress_rate.

    average_time = total / effective_progress_rate
    expected_checks = effective_check_rate * average_time
    expected_successful_checks = expected_checks * q

    return ModelResult(
        default_time=default_time,
        average_time=average_time,
        expected_skill_checks=expected_checks,
        expected_successful_checks=expected_successful_checks,
        effective_check_rate=effective_check_rate,
        effective_progress_rate=effective_progress_rate,
        hazard_rate=None,
    )


# ---------------------------------------------------------------------------
# Manual smoke test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    params = ModelInputs(
        extraction_speed=1.5,
        skill_check_chance=0.25,
        skill_check_units=3.0,
        skill_check_success=0.9,
    )

    print("Continuous-time model:")
    print(calc_continuous_model(params))

    print("\nDiscrete 1-second tick model:")
    print(calc_discrete_model(params))