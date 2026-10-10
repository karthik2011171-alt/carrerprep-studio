// layout: single | sidebar   header: left | center | band   heading: underline | bar | prefix | plain
export const TEMPLATES = [
  { id: 'modern', name: 'Modern', accent: '#2563eb', font: 'sans', layout: 'single', header: 'band', heading: 'bar' },
  { id: 'minimalist', name: 'Minimalist', accent: '#374151', font: 'sans', layout: 'single', header: 'left', heading: 'underline' },
  { id: 'tech', name: 'Tech', accent: '#0f766e', font: 'mono', layout: 'single', header: 'left', heading: 'prefix' },
  { id: 'executive', name: 'Executive', accent: '#1e3a5f', font: 'serif', layout: 'single', header: 'center', heading: 'underline', caps: true },
  { id: 'classic', name: 'Classic', accent: '#111827', font: 'serif', layout: 'single', header: 'center', heading: 'underline' },
  { id: 'creative', name: 'Creative', accent: '#7c3aed', font: 'sans', layout: 'sidebar', header: 'left', heading: 'bar' },
  { id: 'professional', name: 'Professional', accent: '#334e68', font: 'sans', layout: 'single', header: 'left', heading: 'underline', caps: true },
  { id: 'clean', name: 'Clean', accent: '#15803d', font: 'sans', layout: 'single', header: 'left', heading: 'plain' },
  { id: 'developer', name: 'Developer', accent: '#c2410c', font: 'mono', layout: 'single', header: 'band', heading: 'prefix' },
  { id: 'corporate', name: 'Corporate', accent: '#7f1d1d', font: 'sans', layout: 'sidebar', header: 'left', heading: 'underline' },
];

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
