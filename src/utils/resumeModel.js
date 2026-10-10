export const EMPTY_RESUME = {
  personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
  summary: '',
  skills: [],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: '',
};

const list = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []);

// Makes any stored value safe to render, even if localStorage was edited or corrupted.
export function normalize(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  return {
    personal: { ...EMPTY_RESUME.personal, ...(r.personal && typeof r.personal === 'object' ? r.personal : {}) },
    summary: typeof r.summary === 'string' ? r.summary : '',
    skills: Array.isArray(r.skills) ? r.skills.filter((s) => typeof s === 'string') : [],
    education: list(r.education),
    experience: list(r.experience),
    projects: list(r.projects),
    certifications: list(r.certifications),
    achievements: typeof r.achievements === 'string' ? r.achievements : '',
  };
}

export const SAMPLE_RESUME = {
  personal: { name: 'Asha Raman', title: 'Junior Full-Stack Developer', email: 'asha@example.com', phone: '+91 98765 43210', location: 'Coimbatore, India', linkedin: 'linkedin.com/in/asha', github: 'github.com/asha', website: '' },
  summary: 'Final-year computer science student who builds responsive web apps with React and Python. Comfortable with data structures, REST APIs and Git, and eager to ship real features in a product team.',
  skills: ['Python', 'JavaScript', 'React', 'HTML', 'CSS', 'SQL', 'Git', 'REST APIs'],
  education: [{ school: 'PSG College of Technology', degree: 'B.E.', field: 'Computer Science', start: '2022', end: '2026', grade: 'CGPA 8.4' }],
  experience: [{ company: 'Tech Interns Co.', role: 'Web Development Intern', location: '', start: 'Jun 2025', end: 'Aug 2025', description: 'Built a dashboard in React used by 40 staff\nReduced page load time by 30% by optimizing API calls' }],
  projects: [{ name: 'Task Tracker', tech: 'React, Tailwind', link: '', description: 'Developed a task manager with filters and local persistence.' }],
  certifications: [{ name: 'Python for Everybody', issuer: 'Coursera', year: '2024' }],
  achievements: 'Finalist, college hackathon 2025',
};
