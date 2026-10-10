// Transparent frontend heuristic. This is NOT a real enterprise ATS engine.
const ACTION_VERBS = ['built', 'developed', 'designed', 'implemented', 'created', 'led', 'managed', 'optimized', 'improved', 'reduced', 'increased', 'automated', 'deployed', 'tested', 'analyzed', 'integrated', 'launched', 'collaborated', 'delivered', 'migrated', 'refactored', 'debugged', 'architected', 'maintained', 'mentored', 'streamlined', 'achieved', 'engineered', 'configured', 'documented'];
const KEYWORDS = ['python', 'javascript', 'react', 'html', 'css', 'sql', 'git', 'github', 'api', 'rest', 'node', 'java', 'c++', 'typescript', 'tailwind', 'django', 'flask', 'mongodb', 'mysql', 'docker', 'linux', 'aws', 'data structures', 'algorithms', 'oop', 'agile', 'testing', 'json', 'responsive', 'problem solving', 'teamwork', 'communication', 'redux', 'express'];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const keywordRegexes = KEYWORDS.map((k) => ({ k, re: new RegExp(`(^|[^a-z0-9+#])${esc(k)}($|[^a-z0-9+#])`) }));

const filled = (v) => typeof v === 'string' && v.trim().length > 0;
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');

export function resumeText(d) {
  return [
    d.summary, d.skills.join(' '), d.achievements,
    ...d.experience.flatMap((e) => [e.role, e.company, e.description]),
    ...d.projects.flatMap((p) => [p.name, p.tech, p.description]),
    ...d.education.flatMap((e) => [e.degree, e.field]),
    ...d.certifications.map((c) => c.name),
  ].filter(Boolean).join(' ').toLowerCase();
}

export function computeAts(d) {
  const p = d.personal;
  const text = resumeText(d);
  const items = [];
  const add = (label, earned, max) => items.push({ label, earned: Math.round(Math.min(earned, max)), max });

  add('Contact information', (filled(p.name) ? 3 : 0) + (emailOk(p.email) ? 4 : 0) + (filled(p.phone) ? 3 : 0) + (filled(p.location) ? 2 : 0) + (filled(p.linkedin) || filled(p.github) ? 3 : 0), 15);
  const sLen = (d.summary || '').trim().length;
  add('Professional summary', sLen >= 150 ? 10 : sLen >= 60 ? 5 : 0, 10);
  const nSkills = d.skills.length;
  add('Skills', nSkills >= 8 ? 15 : nSkills >= 5 ? 10 : nSkills >= 3 ? 6 : nSkills * 2, 15);
  add('Education', d.education.some((e) => filled(e.school) && filled(e.degree)) ? 10 : 0, 10);
  const exp = d.experience.filter((e) => filled(e.role) && filled(e.company));
  add('Experience', (exp.length ? 10 : 0) + (exp.some((e) => (e.description || '').length > 60) ? 5 : 0), 15);
  const projs = d.projects.filter((x) => filled(x.name) && (x.description || '').length > 30);
  add('Projects', projs.length >= 2 ? 10 : projs.length === 1 ? 6 : 0, 10);
  const words = new Set(text.split(/[^a-z]+/));
  const verbs = ACTION_VERBS.filter((v) => words.has(v)).length;
  add('Action-oriented wording', verbs * 2, 10);
  const kw = keywordRegexes.filter(({ re }) => re.test(text)).length;
  add('Relevant keywords', kw * 1.5, 10);
  add('Completeness', d.certifications.length || filled(d.achievements) ? 5 : 0, 5);

  const score = items.reduce((n, i) => n + i.earned, 0);
  const strengths = [];
  const missing = [];
  const suggestions = [];
  const byLabel = Object.fromEntries(items.map((i) => [i.label, i]));
  const full = (l) => byLabel[l].earned >= byLabel[l].max;

  if (full('Contact information')) strengths.push('Complete contact details'); else suggestions.push('Add a valid email, phone, location and a LinkedIn or GitHub link.');
  if (full('Professional summary')) strengths.push('Solid professional summary'); else { missing.push('Professional summary'); suggestions.push('Write a 2–4 sentence summary of at least 150 characters.'); }
  if (nSkills >= 8) strengths.push(`${nSkills} skills listed`); else { missing.push(nSkills ? 'More skills' : 'Skills'); suggestions.push('List at least 8 relevant technical skills.'); }
  if (byLabel.Education.earned) strengths.push('Education included'); else { missing.push('Education'); suggestions.push('Add your degree and institution.'); }
  if (exp.length) strengths.push('Experience or internship listed'); else { missing.push('Experience'); suggestions.push('Add internships, freelance work or volunteering; use projects to fill the gap.'); }
  if (projs.length >= 2) strengths.push('Two or more described projects'); else { missing.push('Projects'); suggestions.push('Add 2 projects with a 1–2 line description and the tech used.'); }
  if (verbs >= 5) strengths.push('Strong action verbs'); else suggestions.push('Start bullet points with verbs like built, designed, optimized or deployed.');
  if (kw >= 7) strengths.push('Good keyword coverage'); else suggestions.push('Include relevant keywords from the job description (languages, frameworks, tools).');
  if (!byLabel.Completeness.earned) { missing.push('Certifications or achievements'); suggestions.push('Add a certification or an achievement to round out the resume.'); }

  return { score, items, strengths, missing, suggestions };
}
