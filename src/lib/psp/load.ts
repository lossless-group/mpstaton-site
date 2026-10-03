/**
 * Load a PSP tracking dataset: src/content/psp/tracking/<name>/tracker.yaml
 * plus every log/week-NN.yaml beside it.
 *
 * import.meta.glob with ?raw inlines the files into the server bundle at build
 * time, so the dashboard routes can render per request (to know what "today"
 * is) without a runtime filesystem read on Vercel. Adding a log means
 * committing the file; the next deploy picks it up.
 */
import { parse } from 'yaml';
import { indexLogs, type LogIndex, type Tracker, type WeekLog } from './tracker';

const FILES = import.meta.glob('/src/content/psp/tracking/**/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface Dataset {
  name: string;
  tracker: Tracker;
  logs: WeekLog[];
  idx: LogIndex;
}

export function loadDataset(name: string): Dataset {
  const root = `/src/content/psp/tracking/${name}/`;
  const trackerRaw = FILES[`${root}tracker.yaml`];
  if (!trackerRaw) throw new Error(`No tracker.yaml for PSP dataset "${name}"`);
  const tracker = parse(trackerRaw) as Tracker;
  const logs = Object.entries(FILES)
    .filter(([path]) => path.startsWith(`${root}log/`))
    .map(([, raw]) => (parse(raw) ?? {}) as WeekLog)
    .filter((l) => Number.isFinite(Number(l.week)));
  return { name, tracker, logs, idx: indexLogs(logs) };
}
