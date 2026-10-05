/**
 * PSP tracker rollups: days → program weeks → Day 30/60/90 checkpoints.
 *
 * Plain TypeScript with no framework imports, so the same logic can drive this
 * site, an assistant-generated artifact, or anything else. The data contract
 * (tracker.yaml + log/week-NN.yaml) and the status rules are specified in
 * hope-ai/references/dashboard-guidelines.md; keep the two in step.
 *
 * Dates are ISO `YYYY-MM-DD` strings throughout and compared as strings,
 * which sorts correctly. Day arithmetic goes through UTC so a DST change can
 * never shift a day.
 */

// ─── Data contract ────────────────────────────────────────────────────────

export type Cadence = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type Measure = 'check' | 'count' | 'minutes' | 'hours' | 'amount';
export type Direction = 'up' | 'down';

/**
 * The weekly bars, in the program's words: `base` (a good-enough week) and
 * `stretch` (a great one). For a `direction: down` habit, `stretch` is the
 * limit. `floor` / `target` are the toolkit's older names, read as aliases.
 */
export interface Standard {
  base?: number | null;
  stretch?: number | null;
  /** @deprecated alias of `base` */
  floor?: number | null;
  /** @deprecated alias of `stretch` */
  target?: number | null;
}

export interface Habit extends Standard {
  id: string;
  label: string;
  short?: string;
  cadence: Cadence;
  measure: Measure;
  /**
   * How logged days add up to the week: `sum` (default) or `max`, the best
   * single entry. Use `max` for something continuous, like the longest fast
   * in hours: a 24-hour fast is two-thirds of a 36-hour bar, not a miss, and
   * two 20-hour fasts are not a 40-hour one. A `max` bar is never prorated.
   */
  aggregate?: 'sum' | 'max';
  direction?: Direction;
  unit?: string;
  note?: string;
  weeks?: Record<string, Standard>;
}

export type Milestone = number | [number, number];

export interface Outcome {
  id: string;
  label: string;
  unit?: string;
  direction?: Direction;
  baseline?: { date: string; value: number } | null;
  milestones?: Record<string, Milestone>;
  /** Measured and shown, never scored against a milestone (a "thermometer"). */
  track_only?: boolean;
  /**
   * How to project it forward: `linear` (default) extends the rate from the
   * baseline to the latest reading, for things that accumulate or drift
   * (weight, words drafted). `none` for a level that's read as it stands,
   * like a monthly income run-rate: progress only, no projection.
   */
  projection?: 'linear' | 'none';
  note?: string;
}

export interface Goal {
  id: string;
  number: number;
  kind?: string;
  area: string;
  title: string;
  process: Habit[];
  outcomes?: Outcome[];
}

export interface Tracker {
  person: string;
  cohort?: string;
  day_one: string;
  length_days?: number;
  timezone?: string;
  /**
   * The weekday a week starts on, when the cohort runs on a fixed clock
   * (e.g. `sunday` for a Sunday-to-Sunday cohort week). Week 1 is then the
   * part-week from Day 1 to the first boundary. Omit it and weeks run seven
   * days from Day 1, whatever weekday that is.
   */
  week_starts?: string;
  checkpoints?: number[];
  deload_weeks?: number[];
  goals: Goal[];
}

export type DayEntry = Record<string, unknown>;

export interface WeekLog {
  week: number;
  days?: Record<string, DayEntry | null>;
  totals?: Record<string, number>;
  readings?: Array<{ date: string } & Record<string, unknown>>;
  /**
   * Context for a week's result, keyed by habit id (or goal id): why a bar
   * was missed, what got in the way, what changed. Shown beside the status,
   * never instead of it.
   */
  reasons?: Record<string, string>;
}

// ─── Statuses ─────────────────────────────────────────────────────────────

/** One habit in one week (or biweekly window). */
export type HabitStatus = 'stretch' | 'base' | 'miss' | 'bonus' | 'optional' | 'progress' | 'unlogged' | 'future';
/** One goal in one week. */
export type GoalWeekStatus = 'stretch' | 'base' | 'miss' | 'progress' | 'unlogged' | 'future';
/** Process or outcome at a checkpoint. */
export type PaceStatus = 'ahead' | 'on-pace' | 'behind' | 'not-paced' | 'tracked' | 'no-reading' | 'no-data';

export type CellState = 'done' | 'not-done' | 'unlogged' | 'future' | 'outside';

// ─── Dates ────────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;

function toUtc(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  return new Date(toUtc(iso) + n * DAY_MS).toISOString().slice(0, 10);
}

/** Day 1 is `day_one`. */
export function dayNumber(t: Tracker, iso: string): number {
  return Math.round((toUtc(iso) - toUtc(normDate(t.day_one))) / DAY_MS) + 1;
}

export function dateOfDay(t: Tracker, day: number): string {
  return addDays(normDate(t.day_one), day - 1);
}

/** Today in the person's time zone, so "today" doesn't flip at UTC midnight. */
export function todayIso(t: Tracker, now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: t.timezone ?? 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function weekday(iso: string): string {
  return new Date(toUtc(iso)).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

export function shortDate(iso: string): string {
  return new Date(toUtc(iso)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/** YAML may hand dates back as Date objects depending on schema; normalize. */
function normDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

// ─── Program weeks ────────────────────────────────────────────────────────

export const lengthDays = (t: Tracker) => t.length_days ?? 100;

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Days between the start of Week 1's clock and Day 1: 0 when weeks run from
 * Day 1, otherwise how far Day 1 sits past the cohort's week boundary.
 */
export function weekOffset(t: Tracker): number {
  const name = String(t.week_starts ?? '').trim().toLowerCase();
  const start = name.length >= 3 ? WEEKDAYS.findIndex((w) => w.startsWith(name.slice(0, 3))) : -1;
  if (start < 0) return 0;
  const dow = new Date(toUtc(normDate(t.day_one))).getUTCDay();
  return (dow - start + 7) % 7;
}

export const totalWeeks = (t: Tracker) => Math.ceil((lengthDays(t) + weekOffset(t)) / 7);
export const weekOfDay = (t: Tracker, day: number) => Math.ceil((day + weekOffset(t)) / 7);

/** The dates in a program week, from Day 1 to the program's last day. */
export function weekDates(t: Tracker, week: number): string[] {
  const off = weekOffset(t);
  const first = Math.max((week - 1) * 7 + 1 - off, 1);
  const last = Math.min(week * 7 - off, lengthDays(t));
  const out: string[] = [];
  for (let d = first; d <= last; d++) out.push(dateOfDay(t, d));
  return out;
}

export function isDeload(t: Tracker, week: number): boolean {
  return (t.deload_weeks ?? [8, 12]).includes(week);
}

/** Program weeks scored together: 1 (daily, weekly), 2 (biweekly), 4 (monthly). */
export function spanWeeks(c: Cadence): number {
  return c === 'monthly' ? 4 : c === 'biweekly' ? 2 : 1;
}

/** The first week of the window a week falls in (Weeks 1–4, 5–8, … for monthly). */
export function windowStart(c: Cadence, week: number): number {
  const n = spanWeeks(c);
  return Math.floor((week - 1) / n) * n + 1;
}

/** The current program week, clamped to the program. 0 before Day 1. */
export function currentWeek(t: Tracker, today: string): number {
  const d = dayNumber(t, today);
  if (d < 1) return 0;
  return Math.min(weekOfDay(t, d), totalWeeks(t));
}

// ─── Standards (the ramp) ─────────────────────────────────────────────────

const baseOf = (o: Standard) => ('base' in o ? o.base : o.floor) ?? null;
const stretchOf = (o: Standard) => ('stretch' in o ? o.stretch : o.target) ?? null;

/** Base and stretch for a habit in a program week; `weeks:` overrides carry forward. */
export function standardFor(h: Habit, week: number): { base: number | null; stretch: number | null } {
  let base = baseOf(h);
  let stretch = stretchOf(h);
  const keys = Object.keys(h.weeks ?? {})
    .map(Number)
    .filter((k) => k <= week)
    .sort((a, b) => a - b);
  for (const k of keys) {
    const o = h.weeks![String(k)];
    if (o && ('base' in o || 'floor' in o)) base = baseOf(o);
    if (o && ('stretch' in o || 'target' in o)) stretch = stretchOf(o);
  }
  return { base, stretch };
}

// ─── Values ───────────────────────────────────────────────────────────────

function dayValue(h: Habit, entry: DayEntry | null | undefined): number {
  const raw = entry?.[h.id];
  if (raw === undefined || raw === null || raw === false) return 0;
  if (h.measure === 'check') {
    if (typeof raw === 'number') return raw > 0 ? 1 : 0;
    if (typeof raw === 'string') return /^(no|false|0|)$/i.test(raw.trim()) ? 0 : 1;
    return raw ? 1 : 0;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Index all logs by date and by week. */
export interface LogIndex {
  days: Map<string, DayEntry>;
  totals: Map<number, Record<string, number>>;
  readings: Array<{ date: string } & Record<string, unknown>>;
  reasons: Map<number, Record<string, string>>;
}

export function indexLogs(logs: WeekLog[]): LogIndex {
  const days = new Map<string, DayEntry>();
  const totals = new Map<number, Record<string, number>>();
  const readings: LogIndex['readings'] = [];
  const reasons = new Map<number, Record<string, string>>();
  for (const l of logs) {
    for (const [date, entry] of Object.entries(l.days ?? {})) {
      days.set(normDate(date), entry ?? {});
    }
    if (l.totals && Object.keys(l.totals).length) totals.set(Number(l.week), l.totals);
    for (const r of l.readings ?? []) readings.push({ ...r, date: normDate(r.date) });
    if (l.reasons && Object.keys(l.reasons).length) reasons.set(Number(l.week), l.reasons);
  }
  return { days, totals, readings, reasons };
}

/** The reasons logged for an id across some weeks, oldest first. */
export function reasonsFor(idx: LogIndex, id: string, weeks: number[]): string | null {
  const out = weeks.map((w) => idx.reasons.get(w)?.[id]).filter((r): r is string => !!r && !!r.trim());
  return out.length ? out.join(' · ') : null;
}

// ─── Habit in a week ──────────────────────────────────────────────────────

export interface DayCell {
  date: string;
  day: number;
  state: CellState;
  value: number;
  /** Second logged miss in a row for a daily habit: "never miss twice". */
  missedTwice?: boolean;
}

export interface HabitWeek {
  habit: Habit;
  week: number;
  /** Weeks scored together: [w], a biweekly [w1, w2], or a monthly [w1..w4]. */
  window: number[];
  base: number | null;
  stretch: number | null;
  value: number;
  status: HabitStatus;
  /** Status the value would earn if the week ended now. */
  provisional: HabitStatus | null;
  complete: boolean;
  partlyLogged: boolean;
  loggedDays: number;
  cells: DayCell[];
  /** The person's own context for this result, if they logged one. */
  reason: string | null;
}

/**
 * A habit with no base this week can't be missed. Doing it anyway is a
 * `bonus`, shown green like any other win; not doing it is `optional`,
 * shown neutral.
 */
function scoreValue(h: Habit, value: number, base: number | null, stretch: number | null): HabitStatus {
  if (h.direction === 'down') {
    if (stretch === null) return 'optional';
    return value <= stretch ? 'stretch' : 'miss';
  }
  if (stretch !== null && value >= stretch) return 'stretch';
  if (base === null) return value > 0 ? 'bonus' : 'optional';
  return value >= base ? 'base' : 'miss';
}

export function habitWeek(t: Tracker, idx: LogIndex, h: Habit, week: number, today: string): HabitWeek {
  const start = windowStart(h.cadence, week);
  const window = Array.from({ length: spanWeeks(h.cadence) }, (_, i) => start + i);
  const validWindow = window.filter((w) => w >= 1 && w <= totalWeeks(t));
  const dates = validWindow.flatMap((w) => weekDates(t, w));

  // Standards come from the window's first week; a short final window is prorated.
  let { base, stretch } = standardFor(h, validWindow[0]);
  const span = spanWeeks(h.cadence) * 7;
  const isMax = h.aggregate === 'max';
  if (dates.length < span && !isMax) {
    const k = dates.length / span;
    if (base !== null) base = Math.ceil(base * k);
    if (stretch !== null) stretch = h.direction === 'down' ? Math.floor(stretch * k) : Math.ceil(stretch * k);
  }

  const shownDates = weekDates(t, week);
  let value = 0;
  let loggedDays = 0;
  for (const date of dates) {
    if (date > today) continue;
    const entry = idx.days.get(date);
    if (entry === undefined) continue;
    loggedDays += 1;
    value = isMax ? Math.max(value, dayValue(h, entry)) : value + dayValue(h, entry);
  }
  let hasTotals = false;
  const totalsSum = validWindow.reduce((s, w) => {
    const v = idx.totals.get(w)?.[h.id];
    if (v !== undefined && v !== null) {
      hasTotals = true;
      return s + Number(v);
    }
    return s;
  }, 0);
  if (hasTotals) value = totalsSum;

  const cells: DayCell[] = shownDates.map((date) => {
    const entry = idx.days.get(date);
    const v = dayValue(h, entry);
    const state: CellState =
      date > today ? 'future' : entry === undefined ? 'unlogged' : v > 0 ? 'done' : 'not-done';
    return { date, day: dayNumber(t, date), state, value: v };
  });
  if (h.cadence === 'daily') markMissedTwice(t, idx, h, cells);

  const lastDate = dates[dates.length - 1];
  const firstDate = dates[0];
  const complete = lastDate < today;
  const anyData = loggedDays > 0 || hasTotals;
  const scored = scoreValue(h, value, base, stretch);

  let status: HabitStatus;
  if (firstDate > today) status = 'future';
  else if (!complete) status = 'progress';
  else if (!anyData) status = 'unlogged';
  else status = scored;

  return {
    habit: h,
    week,
    window: validWindow,
    base,
    stretch,
    value,
    status,
    provisional: status === 'progress' && anyData ? scored : null,
    complete,
    partlyLogged: complete && !hasTotals && anyData && loggedDays < dates.length,
    loggedDays,
    cells,
    reason: reasonsFor(idx, h.id, validWindow),
  };
}

function markMissedTwice(t: Tracker, idx: LogIndex, h: Habit, cells: DayCell[]) {
  for (const c of cells) {
    if (c.state !== 'not-done') continue;
    const prev = idx.days.get(addDays(c.date, -1));
    if (prev !== undefined && dayValue(h, prev) === 0 && dayNumber(t, c.date) > 1) c.missedTwice = true;
  }
}

// ─── Goal in a week ───────────────────────────────────────────────────────

export interface GoalWeek {
  goal: Goal;
  week: number;
  status: GoalWeekStatus;
  partlyLogged: boolean;
  habits: HabitWeek[];
  /** Goal-level and habit-level reasons for this week, as "Label: reason". */
  reasons: string[];
}

export function goalWeek(t: Tracker, idx: LogIndex, g: Goal, week: number, today: string): GoalWeek {
  const habits = g.process.map((h) => habitWeek(t, idx, h, week, today));
  // A biweekly or monthly habit is only scored in the last week of its window.
  const scored = habits.filter((hw) => hw.window[hw.window.length - 1] === week);
  const dates = weekDates(t, week);
  let status: GoalWeekStatus;
  if (dates[0] > today) status = 'future';
  else if (dates[dates.length - 1] >= today) status = 'progress';
  else if (scored.every((hw) => hw.status === 'unlogged')) status = 'unlogged';
  else if (scored.some((hw) => hw.status === 'miss')) status = 'miss';
  else if (scored.some((hw) => hw.status === 'base')) status = 'base';
  else status = 'stretch';
  return {
    goal: g,
    week,
    status,
    partlyLogged: status !== 'progress' && scored.some((hw) => hw.partlyLogged || hw.status === 'unlogged'),
    habits,
    reasons: [
      reasonsFor(idx, g.id, [week]),
      ...habits.filter((hw) => hw.reason && hw.window[hw.window.length - 1] === week).map((hw) => `${hw.habit.label}: ${hw.reason}`),
    ].filter((r): r is string => !!r),
  };
}

// ─── Checkpoints ──────────────────────────────────────────────────────────

export interface HabitPace {
  habit: Habit;
  actual: number;
  expectedBase: number | null;
  expectedStretch: number | null;
  status: PaceStatus;
}

export interface OutcomePace {
  outcome: Outcome;
  milestone: Milestone | null;
  reading: { date: string; value: number } | null;
  status: PaceStatus;
}

export interface GoalCheckpoint {
  goal: Goal;
  process: PaceStatus;
  /** Share of the paced stretch done so far, 0..1+, across scored habits. */
  share: number | null;
  habits: HabitPace[];
  outcomes: OutcomePace[];
}

export interface Checkpoint {
  day: number;
  date: string;
  /** Day the numbers run through: the checkpoint, or yesterday if it's still ahead. */
  throughDay: number;
  reached: boolean;
  goals: GoalCheckpoint[];
}

export function checkpoint(t: Tracker, idx: LogIndex, day: number, today: string): Checkpoint {
  const todayDay = dayNumber(t, today);
  const reached = todayDay > day;
  const throughDay = Math.max(0, Math.min(day, todayDay - 1));
  const throughDate = dateOfDay(t, throughDay);

  const goals = t.goals.map((g) => {
    const habits = g.process.map((h) => habitPace(t, idx, h, throughDay, throughDate));
    const scored = habits.filter((hp) => hp.status !== 'not-paced' && hp.status !== 'no-data');
    let process: PaceStatus;
    if (throughDay < 1 || scored.length === 0) process = 'no-data';
    else if (scored.some((hp) => hp.status === 'behind')) process = 'behind';
    else if (scored.every((hp) => hp.status === 'ahead')) process = 'ahead';
    else process = 'on-pace';
    const shares = habits
      .filter((hp) => hp.habit.direction !== 'down' && hp.expectedStretch)
      .map((hp) => Math.min(hp.actual / (hp.expectedStretch as number), 1.5));
    const share = shares.length ? shares.reduce((a, b) => a + b, 0) / shares.length : null;
    const outcomes = (g.outcomes ?? []).map((o) => outcomePace(t, idx, o, day));
    return { goal: g, process, share, habits, outcomes };
  });

  return { day, date: dateOfDay(t, day), throughDay, reached, goals };
}

function habitPace(t: Tracker, idx: LogIndex, h: Habit, throughDay: number, throughDate: string): HabitPace {
  let expBase: number | null = 0;
  let expStretch: number | null = 0;
  let actual = 0;
  let anyLogged = false;

  for (let w = 1; w <= weekOfDay(t, Math.max(throughDay, 1)); w++) {
    const dates = weekDates(t, w).filter((d) => d <= throughDate);
    if (!dates.length) break;
    const { base, stretch } = standardFor(h, windowStart(h.cadence, w));
    const share = h.aggregate === 'max' ? 1 / spanWeeks(h.cadence) : dates.length / 7 / spanWeeks(h.cadence);
    expBase = base === null || expBase === null ? null : expBase + base * share;
    expStretch = stretch === null || expStretch === null ? null : expStretch + stretch * share;

    const total = idx.totals.get(w)?.[h.id];
    if (total !== undefined && total !== null) {
      actual += Number(total);
      anyLogged = true;
    } else {
      let best = 0;
      for (const d of dates) {
        const e = idx.days.get(d);
        if (e !== undefined) {
          anyLogged = true;
          if (h.aggregate === 'max') best = Math.max(best, dayValue(h, e));
          else actual += dayValue(h, e);
        }
      }
      actual += best;
    }
  }

  let status: PaceStatus;
  if (throughDay < 1 || !anyLogged) status = 'no-data';
  else if (h.direction === 'down') {
    status = expStretch === null ? 'not-paced' : actual <= expStretch ? 'on-pace' : 'behind';
  } else if (expStretch !== null && actual >= expStretch) status = 'ahead';
  else if (expBase === null) status = 'not-paced';
  else status = actual >= expBase ? 'on-pace' : 'behind';

  return {
    habit: h,
    actual,
    expectedBase: expBase === null ? null : Math.round(expBase * 10) / 10,
    expectedStretch: expStretch === null ? null : Math.round(expStretch * 10) / 10,
    status,
  };
}

function outcomePace(t: Tracker, idx: LogIndex, o: Outcome, day: number): OutcomePace {
  const milestone = o.milestones?.[String(day)] ?? null;
  const target = dateOfDay(t, day);
  // Closest reading within a week either side of the checkpoint.
  let best: { date: string; value: number } | null = null;
  for (const r of idx.readings) {
    const v = r[o.id];
    if (v === undefined || v === null || v === '') continue;
    const dist = Math.abs(toUtc(r.date) - toUtc(target)) / DAY_MS;
    if (dist > 7) continue;
    if (!best || dist < Math.abs(toUtc(best.date) - toUtc(target)) / DAY_MS) {
      best = { date: r.date, value: Number(v) };
    }
  }
  let status: PaceStatus;
  if (o.track_only) status = 'tracked';
  else if (milestone === null) status = 'not-paced';
  else if (!best) status = 'no-reading';
  else {
    const [lo, hi] = Array.isArray(milestone) ? milestone : [milestone, milestone];
    const v = best.value;
    if (o.direction === 'down') status = v <= lo ? 'ahead' : v <= hi ? 'on-pace' : 'behind';
    else status = v >= hi && hi !== lo ? 'ahead' : v >= lo ? 'on-pace' : 'behind';
  }
  return { outcome: o, milestone, reading: best, status };
}

// ─── Outcomes, week by week ───────────────────────────────────────────────

export interface OutcomePoint {
  date: string;
  day: number;
  value: number;
}

export interface OutcomeSeries {
  outcome: Outcome;
  /** Every reading, oldest first. The baseline counts as the first point. */
  points: OutcomePoint[];
  /**
   * The paced band: baseline, then each milestone's [lo, hi] at its day.
   * Read straight across between them. Empty if nothing is paced yet.
   */
  band: Array<{ day: number; lo: number; hi: number }>;
  latest: OutcomePoint | null;
  /** The next checkpoint still ahead, and its milestone, if paced. */
  next: { day: number; milestone: Milestone } | null;
}

/**
 * An outcome's readings over time against its paced band. This is for
 * showing progress every week; it carries no status. Outcomes are only
 * scored at the checkpoints (see `checkpoint`).
 */
export function outcomeSeries(t: Tracker, idx: LogIndex, o: Outcome, today: string): OutcomeSeries {
  const points: OutcomePoint[] = [];
  if (o.baseline) {
    const date = normDate(o.baseline.date);
    points.push({ date, day: dayNumber(t, date), value: o.baseline.value });
  }
  for (const r of idx.readings) {
    const v = r[o.id];
    if (v === undefined || v === null || v === '') continue;
    if (points.some((p) => p.date === r.date)) continue;
    points.push({ date: r.date, day: dayNumber(t, r.date), value: Number(v) });
  }
  points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const band: OutcomeSeries['band'] = [];
  const paced = Object.entries(o.milestones ?? {})
    .map(([d, m]) => ({ day: Number(d), m }))
    .filter((x) => Number.isFinite(x.day))
    .sort((a, b) => a.day - b.day);
  if (!o.track_only && paced.length && o.baseline) {
    const d0 = dayNumber(t, normDate(o.baseline.date));
    band.push({ day: d0, lo: o.baseline.value, hi: o.baseline.value });
    for (const { day, m } of paced) {
      const [a, b] = Array.isArray(m) ? m : [m, m];
      band.push({ day, lo: Math.min(a, b), hi: Math.max(a, b) });
    }
  }

  const todayDay = dayNumber(t, today);
  const ahead = paced.find((x) => x.day >= todayDay);
  return {
    outcome: o,
    points,
    band,
    latest: points.length ? points[points.length - 1] : null,
    next: !o.track_only && ahead ? { day: ahead.day, milestone: ahead.m } : null,
  };
}

// ─── Outcome progress: how far, and where it's heading ────────────────────

export interface OutcomeProgress {
  outcome: Outcome;
  baseline: OutcomePoint | null;
  latest: OutcomePoint | null;
  /** The far milestone: the last checkpoint's stretch end (lo for down, hi for up). */
  goal: { day: number; value: number; band: [number, number] } | null;
  /** Share of the way from baseline to goal, 0..1+ (null without both ends). */
  share: number | null;
  /** Linear projection to the goal's day, from baseline → latest. */
  projected: number | null;
  /** projected − goal, signed so positive means beyond the goal. */
  variance: number | null;
  /** Projection against the goal's band. Information, not the checkpoint verdict. */
  status: PaceStatus;
  /** Why there's no number yet, in words. */
  reason: string | null;
}

export function outcomeProgress(t: Tracker, idx: LogIndex, o: Outcome, today: string): OutcomeProgress {
  const s = outcomeSeries(t, idx, o, today);
  const baseline = o.baseline ? s.points.find((p) => p.date === normDate(o.baseline!.date)) ?? null : null;
  const latest = s.latest;
  const ms = Object.entries(o.milestones ?? {})
    .map(([d, m]) => ({ day: Number(d), m }))
    .filter((x) => Number.isFinite(x.day))
    .sort((a, b) => a.day - b.day);
  const far = ms[ms.length - 1];
  const down = o.direction === 'down';
  const goal = far
    ? (() => {
        const [a, b] = Array.isArray(far.m) ? far.m : [far.m, far.m];
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        return { day: far.day, value: down ? lo : hi, band: [lo, hi] as [number, number] };
      })()
    : null;

  const sign = down ? -1 : 1;
  let share: number | null = null;
  let projected: number | null = null;
  let variance: number | null = null;
  let status: PaceStatus = 'no-data';
  let reason: string | null = null;

  if (o.track_only) {
    status = 'tracked';
  } else if (!goal) {
    status = 'not-paced';
    reason = 'No goal set yet';
  } else if (!baseline) {
    reason = 'No starting point yet';
    share = 0;
  } else if (!latest || latest.date === baseline.date) {
    reason = 'No reading since the start';
    share = 0;
  } else {
    const span = goal.value - baseline.value;
    share = span === 0 ? 1 : Math.max(0, (latest.value - baseline.value) / span);
    const [lo, hi] = goal.band;
    const rank = (v: number) =>
      down ? (v <= lo ? 'ahead' : v <= hi ? 'on-pace' : 'behind') : v >= hi && hi !== lo ? 'ahead' : v >= lo ? 'on-pace' : 'behind';
    if (o.projection === 'none') {
      // A level: where it stands now against the goal's band.
      status = rank(latest.value);
    } else {
      const days = latest.day - baseline.day;
      if (days > 0) {
        const rate = (latest.value - baseline.value) / days;
        projected = latest.value + rate * (goal.day - latest.day);
        variance = sign * (projected - goal.value);
        status = rank(projected);
      } else {
        reason = 'Readings on one day only';
      }
    }
  }
  return { outcome: o, baseline, latest, goal, share, projected, variance, status, reason };
}

// ─── Labels ───────────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<HabitStatus | GoalWeekStatus | PaceStatus, string> = {
  stretch: 'Stretch hit',
  base: 'Base met',
  miss: 'Below base',
  bonus: 'Bonus',
  optional: 'Optional',
  progress: 'In progress',
  unlogged: 'Not logged',
  future: 'Ahead',
  ahead: 'Ahead of pace',
  'on-pace': 'On pace',
  behind: 'Behind pace',
  'not-paced': 'Not paced yet',
  tracked: 'Tracked, not scored',
  'no-reading': 'No reading',
  'no-data': 'No data yet',
};

export function formatMilestone(m: Milestone | null, unit?: string): string {
  if (m === null) return '—';
  const u = unit ? ` ${unit}` : '';
  return Array.isArray(m) ? `${fmt(m[0])}–${fmt(m[1])}${u}` : `${fmt(m)}${u}`;
}

export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { maximumFractionDigits: 1 });
}
