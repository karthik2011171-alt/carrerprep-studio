import { dayKey } from './activity';

// Spaced repetition for "Need revision" cards: first review tomorrow, then in 3 days, then weekly.
export const INTERVALS = [1, 3, 7];

export const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dayKey(d);
};

export const isDue = (rec) => Boolean(rec && rec.due && rec.due <= dayKey());

// Returns the new schedule record after a card is marked "need revision".
// A card that is not due yet keeps its schedule, so extra practice today does not skip ahead.
export function scheduleRevision(rec) {
  if (rec && rec.due && rec.due > dayKey()) return rec;
  const step = rec && Number.isFinite(rec.step) ? Math.min(rec.step + 1, INTERVALS.length - 1) : 0;
  return { step, due: addDays(INTERVALS[step]) };
}
