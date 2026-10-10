export const KEYS = {
  resume: 'careerprep_resume',
  bookmarks: 'careerprep_bookmarks',
  notes: 'careerprep_notes',
  activity: 'careerprep_activity',
  streak: 'careerprep_streak',
  coding: 'careerprep_coding_progress',
  debugging: 'careerprep_debugging_progress',
  flashcards: 'careerprep_flashcards',
  flashcardSrs: 'careerprep_flashcard_srs',
  flashcardDaily: 'careerprep_flashcard_daily',
  readiness: 'careerprep_readiness',
  settings: 'careerprep_settings',
  questions: 'careerprep_question_progress',
  interviews: 'careerprep_interviews',
  company: 'careerprep_company',
};

const EVENT = 'careerprep:storage';
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// Reads JSON safely. If the stored shape doesn't match the fallback's shape, the fallback is used.
export function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    if (Array.isArray(fallback)) return Array.isArray(value) ? value : fallback;
    if (isPlainObject(fallback)) return isPlainObject(value) ? value : fallback;
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function notify(key) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

export function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: keep running */
  }
  notify(key);
}

export function remove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  notify(key);
}

export function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function exportAll() {
  const out = {};
  Object.values(KEYS).forEach((k) => {
    out[k] = read(k, null);
  });
  return out;
}

export const DEFAULT_SETTINGS = { name: '', role: 'Fresher', theme: 'dark' };
