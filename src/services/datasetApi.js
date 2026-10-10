// Shared, defensive fetch helper for the Hugging Face datasets-server (free, no API key, CORS enabled).
const BASE = 'https://datasets-server.huggingface.co/rows';

export async function fetchRows({ dataset, config, split, pageSize = 100, maxPages = 10, timeoutMs = 8000 }) {
  const rows = [];
  let total = Infinity;
  for (let page = 0; page < maxPages && rows.length < total; page += 1) {
    const url = `${BASE}?dataset=${encodeURIComponent(dataset)}&config=${encodeURIComponent(config)}&split=${encodeURIComponent(split)}&offset=${page * pageSize}&length=${pageSize}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`The server answered with status ${res.status}`);
      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error('The response was not valid JSON');
      }
      if (!json || !Array.isArray(json.rows)) throw new Error('The response had an unexpected structure');
      if (json.rows.length === 0) break;
      rows.push(...json.rows.map((r) => r && r.row).filter((r) => r && typeof r === 'object'));
      total = Number.isFinite(json.num_rows_total) ? json.num_rows_total : rows.length;
    } catch (err) {
      if (rows.length === 0) throw new Error(err.name === 'AbortError' ? 'The request timed out' : err.message || 'Network error');
      break; // keep what we already have if a later page fails
    } finally {
      clearTimeout(timer);
    }
  }
  if (rows.length === 0) throw new Error('The response was empty');
  return rows;
}

export const str = (v) => (typeof v === 'string' && v.trim() ? v : '');

export function difficultyFromSolution(solution) {
  const lines = String(solution || '').split('\n').filter((l) => l.trim()).length;
  return lines <= 3 ? 'Easy' : lines <= 8 ? 'Medium' : 'Hard';
}
