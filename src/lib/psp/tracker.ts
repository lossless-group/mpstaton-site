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

export type Cadence = 'daily' | 'weekly' | 'biweekly';
export type Measure = 'check' | 'count' | 'minutes' | 'amount';
export type Direction = 'up' | 'down';

export interface Standard {
  floor?: number | null;
  target?: number | null;
}

export interface Habit extends Standard {
  id: string;
  label: string;
  short?: string;
  cadence: Cadence;
  measure: Measure;
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
}

// ─── Statuses ─────────────────────────────────────────────────────────────

/** One habit in one week (or biweekly window). */
export type HabitStatus = 'target' | 'floor' | 'miss' | 'bonus' | 'progress' | 'unlogged' | 'future';
/** One goal in one week. */
export type GoalWeekStatus = 'target' | 'floor' | 'miss' | 'progress' | 'unlogged' | 'future';
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
export const totalWeeks = (t: Tracker) => Math.ceil(lengthDays(t) / 7);
export const weekOfDay = (day: number) => Math.ceil(day / 7);

/** The dates in a program week, capped at the program's last day. */
export function weekDates(t: Tracker, week: number): string[] {
  const first = (week - 1) * 7 + 1;
  const last = Math.min(week * 7, lengthDays(t));
  const out: string[] = [];
  for (let d = first; d <= last; d++) out.push(dateOfDay(t, d));
  return out;
}

export function isDeload(t: Tracker, week: number): boolean {
  return (t.deload_weeks ?? [8, 12]).includes(week);
}

/** The current program week, clamped to the program. 0 before Day 1. */
export function currentWeek(t: Tracker, today: string): number {
  const d = dayNumber(t, today);
  if (d < 1) return 0;
  return Math.min(weekOfDay(d), totalWeeks(t));
}

// ─── Standards (the ramp) ─────────────────────────────────────────────────

/** Floor and target for a habit in a program week; `weeks:` overrides carry forward. */
export function standardFor(h: Habit, week: number): { floor: number | null; target: number | null } {
  let floor = h.floor ?? null;
  let target = h.target ?? null;
  const keys = Object.keys(h.weeks ?? {})
    .map(Number)
    .filter((k) => k <= week)
    .sort((a, b) => a - b);
  for (const k of keys) {
    const o = h.weeks![String(k)];
    if (o && 'floor' in o) floor = o.floor ?? null;
    if (o && 'target' in o) target = o.target ?? null;
  }
  return { floor, target };
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
}

export function indexLogs(logs: WeekLog[]): LogIndex {
  const days = new Map<string, DayEntry>();
  const totals = new Map<number, Record<string, number>>();
  const readings: LogIndex['readings'] = [];
  for (const l of logs) {
    for (const [date, entry] of Object.entries(l.days ?? {})) {
      days.set(normDate(date), entry ?? {});
    }
    if (l.totals && Object.keys(l.totals).length) totals.set(Number(l.week), l.totals);
    for (const r of l.readings ?? []) readings.push({ ...r, date: normDate(r.date) });
  }
  return { days, totals, readings };
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
  /** Weeks scored together: [w] or a biweekly window [w1, w2]. */
  window: number[];
  floor: number | null;
  target: number | null;
  value: number;
  status: HabitStatus;
  /** Status the value would earn if the week ended now. */
  provisional: HabitStatus | null;
  complete: boolean;
  partlyLogged: boolean;
  loggedDays: number;
  cells: DayCell[];
}

function scoreValue(h: Habit, value: number, floor: number | null, target: number | null): HabitStatus {
  if (h.direction === 'down') {
    if (target === null) return 'bonus';
    return value <= target ? 'target' : 'miss';
  }
  if (target !== null && value >= target) return 'target';
  if (floor === null) return 'bonus';
  return value >= floor ? 'floor' : 'miss';
}

export function habitWeek(t: Tracker, idx: LogIndex, h: Habit, week: number, today: string): HabitWeek {
  const window = h.cadence === 'biweekly' ? (week % 2 === 1 ? [week, week + 1] : [week - 1, week]) : [week];
  const validWindow = window.filter((w) => w >= 1 && w <= totalWeeks(t));
  const dates = validWindow.flatMap((w) => weekDates(t, w));

  // Standards come from the window's first week; a short final week is prorated.
  let { floor, target } = standardFor(h, validWindow[0]);
  const span = h.cadence === 'biweekly' ? 14 : 7;
  if (dates.length < span) {
    const k = dates.length / span;
    if (floor !== null) floor = Math.ceil(floor * k);
    if (target !== null) target = h.direction === 'down' ? Math.floor(target * k) : Math.ceil(target * k);
  }

  const shownDates = weekDates(t, week);
  let value = 0;
  let loggedDays = 0;
  for (const date of dates) {
    if (date > today) continue;
    const entry = idx.days.get(date);
    if (entry === undefined) continue;
    loggedDays += 1;
    value += dayValue(h, entry);
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
  const scored = scoreValue(h, value, floor, target);

  let status: HabitStatus;
  if (firstDate > today) status = 'future';
  else if (!complete) status = 'progress';
  else if (!anyData) status = 'unlogged';
  else status = scored;

  return {
    habit: h,
    week,
    window: validWindow,
    floor,
    target,
    value,
    status,
    provisional: status === 'progress' && anyData ? scored : null,
    complete,
    partlyLogged: complete && !hasTotals && anyData && loggedDays < dates.length,
    loggedDays,
    cells,
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
}

export function goalWeek(t: Tracker, idx: LogIndex, g: Goal, week: number, today: string): GoalWeek {
  const habits = g.process.map((h) => habitWeek(t, idx, h, week, today));
  // A biweekly habit is only scored in the second week of its window.
  const scored = habits.filter(
    (hw) => hw.habit.cadence !== 'biweekly' || hw.window[hw.window.length - 1] === week,
  );
  const dates = weekDates(t, week);
  let status: GoalWeekStatus;
  if (dates[0] > today) status = 'future';
  else if (dates[dates.length - 1] >= today) status = 'progress';
  else if (scored.every((hw) => hw.status === 'unlogged')) status = 'unlogged';
  else if (scored.some((hw) => hw.status === 'miss')) status = 'miss';
  else if (scored.some((hw) => hw.status === 'floor')) status = 'floor';
  else status = 'target';
  return {
    goal: g,
    week,
    status,
    partlyLogged: status !== 'progress' && scored.some((hw) => hw.partlyLogged || hw.status === 'unlogged'),
    habits,
  };
}

// ─── Checkpoints ──────────────────────────────────────────────────────────

export interface HabitPace {
  habit: Habit;
  actual: number;
  expectedFloor: number | null;
  expectedTarget: number | null;
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
  /** Share of the paced target done so far, 0..1+, across scored habits. */
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
      .filter((hp) => hp.habit.direction !== 'down' && hp.expectedTarget)
      .map((hp) => Math.min(hp.actual / (hp.expectedTarget as number), 1.5));
    const share = shares.length ? shares.reduce((a, b) => a + b, 0) / shares.length : null;
    const outcomes = (g.outcomes ?? []).map((o) => outcomePace(t, idx, o, day));
    return { goal: g, process, share, habits, outcomes };
  });

  return { day, date: dateOfDay(t, day), throughDay, reached, goals };
}

function habitPace(t: Tracker, idx: LogIndex, h: Habit, throughDay: number, throughDate: string): HabitPace {
  let expFloor: number | null = 0;
  let expTarget: number | null = 0;
  let actual = 0;
  let anyLogged = false;

  for (let w = 1; w <= weekOfDay(Math.max(throughDay, 1)); w++) {
    const dates = weekDates(t, w).filter((d) => d <= throughDate);
    if (!dates.length) break;
    const { floor, target } = standardFor(h, h.cadence === 'biweekly' ? (w % 2 ? w : w - 1) : w);
    const share = (dates.length / 7) * (h.cadence === 'biweekly' ? 0.5 : 1);
    expFloor = floor === null || expFloor === null ? null : expFloor + floor * share;
    expTarget = target === null || expTarget === null ? null : expTarget + target * share;

    const total = idx.totals.get(w)?.[h.id];
    if (total !== undefined && total !== null) {
      actual += Number(total);
      anyLogged = true;
    } else {
      for (const d of dates) {
        const e = idx.days.get(d);
        if (e !== undefined) {
          anyLogged = true;
          actual += dayValue(h, e);
        }
      }
    }
  }

  let status: PaceStatus;
  if (throughDay < 1 || !anyLogged) status = 'no-data';
  else if (h.direction === 'down') {
    status = expTarget === null ? 'not-paced' : actual <= expTarget ? 'on-pace' : 'behind';
  } else if (expTarget !== null && actual >= expTarget) status = 'ahead';
  else if (expFloor === null) status = 'not-paced';
  else status = actual >= expFloor ? 'on-pace' : 'behind';

  return {
    habit: h,
    actual,
    expectedFloor: expFloor === null ? null : Math.round(expFloor * 10) / 10,
    expectedTarget: expTarget === null ? null : Math.round(expTarget * 10) / 10,
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

// ─── Labels ───────────────────────────────────────────────────────────────

export const STATUS_LABEL: Record<HabitStatus | GoalWeekStatus | PaceStatus, string> = {
  target: 'Target hit',
  floor: 'Floor met',
  miss: 'Below floor',
  bonus: 'Bonus',
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
