import { KEYS, read, write } from './localStorage';

export const ACTIVITY_TYPES = {
  coding: 'Coding practice',
  debugging: 'Debugging',
  resume: 'Resume',
  interview: 'Mock interview',
  question: 'Interview questions',
  flashcard: 'Flashcards',
  company: 'Company prep',
  readiness: 'Readiness checklist',
};

// Dates are always stored as local calendar days: YYYY-MM-DD
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const dayNumber = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};

// A day is "active" when at least one meaningful activity was logged on it.
export function logActivity(type, label) {
  const today = dayKey();
  const list = read(KEYS.activity, []);
  const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, label, date: today, at: new Date().toISOString() };
  write(KEYS.activity, [entry, ...list].slice(0, 500));
  const streak = read(KEYS.streak, { days: {} });
  const days = { ...(streak.days || {}) };
  days[today] = (days[today] || 0) + 1;
  write(KEYS.streak, { days });
}

export function computeStreak(days = {}) {
  const keys = Object.keys(days).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k) && days[k] > 0).sort();
  if (!keys.length) return { current: 0, longest: 0, todayActive: false };
  const nums = keys.map(dayNumber);
  let longest = 1;
  let run = 1;
  for (let i = 1; i < nums.length; i += 1) {
    run = nums[i] - nums[i - 1] === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  const today = dayNumber(dayKey());
  const last = nums[nums.length - 1];
  let current = 0;
  if (today - last <= 1) {
    current = 1;
    for (let i = nums.length - 2; i >= 0 && nums[i + 1] - nums[i] === 1; i -= 1) current += 1;
  }
  return { current, longest, todayActive: last === today };
}

export function lastDays(count) {
  const out = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ key: dayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'short' }) });
  }
  return out;
}
