/**
 * Diary schedule helpers.
 *
 * The itinerary pages render two views of the same day: a proportional
 * availability bar and a session timeline. Both need "what fraction of the
 * day-window is this?", so the arithmetic lives here rather than in the
 * frontmatter.
 *
 * An earlier pass hand-wrote the percentages into the markup. That is fine
 * until a session moves — then every downstream width is silently wrong and
 * nothing fails loudly, because percentages that no longer sum to 100 still
 * render as a plausible-looking bar. Times are the source of truth; widths
 * are derived. `assertBandsCover` makes a mismatch a build error instead.
 */

export type BandState = 'locked' | 'open' | 'free' | 'transit';

export interface Band {
  from: string;
  to: string;
  state: BandState;
  label?: string;
}

/** "17:00" | "9:05" -> minutes past midnight. */
export function toMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) throw new Error(`diary: expected a "HH:MM" time, got ${JSON.stringify(hhmm)}`);
  const [, h, min] = m;
  const total = Number(h) * 60 + Number(min);
  if (Number(h) > 23 || Number(min) > 59) throw new Error(`diary: "${hhmm}" is not a real time`);
  return total;
}

/** "17:00" -> "5:00 PM". Keeps the frontmatter in unambiguous 24h. */
export function toDisplayTime(hhmm: string): string {
  const total = toMinutes(hhmm);
  const h24 = Math.floor(total / 60);
  const min = total % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(min).padStart(2, '0')} ${suffix}`;
}

/** Short axis label: "7a", "1p". */
export function toTickLabel(hhmm: string): string {
  const total = toMinutes(hhmm);
  const h24 = Math.floor(total / 60);
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}${h24 >= 12 ? 'p' : 'a'}`;
}

export interface Window {
  start: string;
  end: string;
}

/** Percentage of the day-window that [from, to) occupies. */
export function spanPercent(win: Window, from: string, to: string): number {
  const total = toMinutes(win.end) - toMinutes(win.start);
  if (total <= 0) throw new Error('diary: day window must end after it starts');
  return ((toMinutes(to) - toMinutes(from)) / total) * 100;
}

/** Offset of a time from the window start, as a percentage. */
export function offsetPercent(win: Window, at: string): number {
  return spanPercent(win, win.start, at);
}

/**
 * Bands must tile the window exactly — no gaps, no overlaps, no drift past the
 * end. A gap renders as a transparent slot that reads as "no information" when
 * it actually means "the author forgot an hour", so this throws rather than
 * degrading.
 */
export function assertBandsCover(win: Window, bands: Band[], dayLabel: string): void {
  if (!bands.length) throw new Error(`diary: ${dayLabel} has no availability bands`);
  let cursor = toMinutes(win.start);
  for (const band of bands) {
    const from = toMinutes(band.from);
    const to = toMinutes(band.to);
    if (to <= from) throw new Error(`diary: ${dayLabel} band ${band.from}–${band.to} ends before it starts`);
    if (from !== cursor) {
      throw new Error(
        `diary: ${dayLabel} bands are not contiguous — expected the next band to start at ` +
          `${minutesToHhmm(cursor)} but it starts at ${band.from}`
      );
    }
    cursor = to;
  }
  if (cursor !== toMinutes(win.end)) {
    throw new Error(
      `diary: ${dayLabel} bands stop at ${minutesToHhmm(cursor)} but the window ends at ${win.end}`
    );
  }
}

function minutesToHhmm(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Every `stepHours` mark across the window, for the bar's axis. */
export function axisTicks(win: Window, stepHours = 2): { at: string; label: string; percent: number }[] {
  const start = toMinutes(win.start);
  const end = toMinutes(win.end);
  const ticks: { at: string; label: string; percent: number }[] = [];
  for (let t = start; t <= end; t += stepHours * 60) {
    const at = minutesToHhmm(t);
    ticks.push({ at, label: toTickLabel(at), percent: spanPercent(win, win.start, at) });
  }
  return ticks;
}

/** Human copy for the legend and for band tooltips. */
export const BAND_COPY: Record<BandState, string> = {
  locked: 'In session — don’t schedule',
  open: 'At the venue — free to meet',
  free: 'Off-site — can reach the city',
  transit: 'Travel buffer',
};

/** Is this event still ahead of `now`? Drives the upcoming/past split. */
export function isUpcoming(dateEnd: Date | string, now = new Date()): boolean {
  const end = dateEnd instanceof Date ? dateEnd : new Date(dateEnd);
  // An event is "upcoming" through the end of its final day, not from midnight
  // of it — otherwise a three-day conference drops off the list on its last
  // morning, while you are still standing in it.
  const endOfDay = new Date(end);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() >= now.getTime();
}

/**
 * Pack a set of day-bands into a query-string-safe string for the OG endpoint.
 *
 * Format: one letter per state (l/o/f/t) followed by that segment's percentage;
 * days separated by "|". The letters are their own delimiters, so no separator
 * is needed between segments and three days fit in ~80 characters — short
 * enough to live in an og:image URL that Slack, iMessage and WhatsApp all have
 * to fetch. Round to one decimal: the card is 1200px wide, so 0.1% is a tenth
 * of a pixel and anything finer is bytes spent on nothing.
 */
const STATE_CODE: Record<BandState, string> = { locked: 'l', open: 'o', free: 'f', transit: 't' };

export function packBands(win: Window, days: { bands?: Band[] }[]): string {
  return days
    .filter((day) => day.bands?.length)
    .map((day) =>
      day.bands!
        .map((b) => `${STATE_CODE[b.state]}${spanPercent(win, b.from, b.to).toFixed(1)}`)
        .join('')
    )
    .join('|');
}

/** Inverse of packBands, for the OG renderer. Unknown letters are dropped. */
export function unpackBands(packed: string): { state: BandState; percent: number }[][] {
  const byCode: Record<string, BandState> = { l: 'locked', o: 'open', f: 'free', t: 'transit' };
  return packed
    .split('|')
    .map((day) => {
      const out: { state: BandState; percent: number }[] = [];
      for (const [, code, pct] of day.matchAll(/([loft])(\d+(?:\.\d+)?)/g)) {
        const state = byCode[code];
        const percent = Number(pct);
        if (state && Number.isFinite(percent) && percent > 0) out.push({ state, percent });
      }
      return out;
    })
    .filter((day) => day.length > 0);
}
