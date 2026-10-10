import { useEffect, useRef, useState } from 'react';
import { getTemplate } from '../../data/resumeTemplates';

const FONTS = {
  sans: '"Instrument Sans", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, Menlo, Consolas, monospace',
};
const PAGE_W = 794;
const bulletLines = (txt = '') => String(txt).split('\n').map((s) => s.replace(/^[-•*\s]+/, '').trim()).filter(Boolean);
const range = (a, b) => (a && b ? `${a} – ${b}` : a ? `${a} – Present` : b || '');

function Bullets({ text }) {
  const l = bulletLines(text);
  if (!l.length) return null;
  if (l.length === 1) return <p style={{ margin: '3px 0 0' }}>{l[0]}</p>;
  return <ul style={{ margin: '3px 0 0 16px', padding: 0, listStyle: 'disc' }}>{l.map((x, i) => <li key={i} style={{ marginBottom: 1 }}>{x}</li>)}</ul>;
}

function Row({ left, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <div>{left}</div>
      {right ? <div style={{ color: '#6b7280', whiteSpace: 'nowrap' }}>{right}</div> : null}
    </div>
  );
}

export function ResumePage({ data, template }) {
  const t = getTemplate(template);
  const p = data.personal;
  const contacts = [p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean);
  const name = p.name || 'Your Name';

  const Heading = ({ children, light }) => {
    const color = light ? '#fff' : t.accent;
    const style = { fontSize: 13, fontWeight: 700, margin: '0 0 6px', color, letterSpacing: t.caps ? '.08em' : 0, textTransform: t.caps ? 'uppercase' : 'none' };
    if (t.heading === 'underline') Object.assign(style, { borderBottom: `1.5px solid ${light ? 'rgba(255,255,255,.5)' : t.accent}`, paddingBottom: 3 });
    if (t.heading === 'bar') Object.assign(style, { borderLeft: `4px solid ${color}`, paddingLeft: 8 });
    return <h2 style={style}>{t.heading === 'prefix' ? '// ' : ''}{children}</h2>;
  };
  const Sec = ({ title, children, light }) => <section style={{ marginBottom: 14 }}><Heading light={light}>{title}</Heading>{children}</section>;

  const summary = data.summary && <Sec title="Summary"><p style={{ margin: 0 }}>{data.summary}</p></Sec>;
  const skills = data.skills.length > 0 && <Sec title="Skills"><p style={{ margin: 0 }}>{data.skills.join(', ')}</p></Sec>;
  const experience = data.experience.length > 0 && (
    <Sec title="Experience">
      {data.experience.map((e, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <Row left={<><b>{e.role}</b>{e.company ? ` · ${e.company}` : ''}{e.location ? `, ${e.location}` : ''}</>} right={range(e.start, e.end)} />
          <Bullets text={e.description} />
        </div>
      ))}
    </Sec>
  );
  const projects = data.projects.length > 0 && (
    <Sec title="Projects">
      {data.projects.map((x, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <Row left={<><b>{x.name}</b>{x.tech ? ` · ${x.tech}` : ''}</>} right={x.link} />
          <Bullets text={x.description} />
        </div>
      ))}
    </Sec>
  );
  const education = data.education.length > 0 && (
    <Sec title="Education">
      {data.education.map((e, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <Row left={<><b>{[e.degree, e.field].filter(Boolean).join(' in ')}</b>{e.school ? ` · ${e.school}` : ''}</>} right={range(e.start, e.end)} />
          {e.grade ? <div style={{ color: '#6b7280' }}>{e.grade}</div> : null}
        </div>
      ))}
    </Sec>
  );
  const certs = data.certifications.length > 0 && (
    <Sec title="Certifications">
      {data.certifications.map((c, i) => <Row key={i} left={<><b>{c.name}</b>{c.issuer ? ` · ${c.issuer}` : ''}</>} right={c.year} />)}
    </Sec>
  );
  const extra = bulletLines(data.achievements).length > 0 && <Sec title="Achievements"><Bullets text={data.achievements} /></Sec>;

  const base = { width: '100%', minHeight: 1123, background: '#fff', color: '#1a1a1a', fontFamily: FONTS[t.font], fontSize: 12.5, lineHeight: 1.45, boxSizing: 'border-box' };

  if (t.layout === 'sidebar') {
    return (
      <div style={{ ...base, display: 'grid', gridTemplateColumns: '230px 1fr' }}>
        <aside style={{ background: t.accent, color: '#fff', padding: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{name}</h1>
          {p.title && <p style={{ margin: '4px 0 16px', opacity: 0.9 }}>{p.title}</p>}
          {contacts.length > 0 && <Sec title="Contact" light>{contacts.map((c) => <p key={c} style={{ margin: '0 0 3px', wordBreak: 'break-word' }}>{c}</p>)}</Sec>}
          {data.skills.length > 0 && <Sec title="Skills" light>{data.skills.map((s) => <p key={s} style={{ margin: '0 0 2px' }}>{s}</p>)}</Sec>}
          {data.certifications.length > 0 && <Sec title="Certifications" light>{data.certifications.map((c, i) => <p key={i} style={{ margin: '0 0 4px' }}>{c.name}<br /><span style={{ opacity: 0.8 }}>{[c.issuer, c.year].filter(Boolean).join(' · ')}</span></p>)}</Sec>}
        </aside>
        <div style={{ padding: 32 }}>{summary}{experience}{projects}{education}{extra}</div>
      </div>
    );
  }

  const centered = t.header === 'center';
  const band = t.header === 'band';
  return (
    <div style={{ ...base, padding: 40 }}>
      <header style={{ textAlign: centered ? 'center' : 'left', marginBottom: 18, ...(band ? { background: t.accent, color: '#fff', margin: '-40px -40px 20px', padding: '28px 40px' } : { borderBottom: `2px solid ${t.accent}`, paddingBottom: 12 }) }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.15, color: band ? '#fff' : '#111' }}>{name}</h1>
        {p.title && <p style={{ margin: '4px 0 0', fontSize: 14, color: band ? '#fff' : t.accent }}>{p.title}</p>}
        {contacts.length > 0 && <p style={{ margin: '8px 0 0', color: band ? 'rgba(255,255,255,.9)' : '#4b5563' }}>{contacts.join('  |  ')}</p>}
      </header>
      {summary}{skills}{experience}{projects}{education}{certs}{extra}
    </div>
  );
}

// Scales the fixed-width page down on small screens. The inner element carries the print id.
export function ScaledPage({ children }) {
  const wrap = useRef(null);
  const inner = useRef(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(1123);

  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, el.clientWidth / PAGE_W) || 1);
      if (inner.current) setHeight(inner.current.offsetHeight);
    });
    ro.observe(el);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrap} className="w-full overflow-hidden rounded-lg border border-line shadow-xl shadow-black/20" style={{ height: height * scale }}>
      <div ref={inner} id="resume-print" style={{ width: PAGE_W, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
}

export function TemplateThumb({ data, template }) {
  return (
    <div className="pointer-events-none overflow-hidden rounded-md border border-line" style={{ width: 150, height: 212 }} aria-hidden="true">
      <div style={{ width: PAGE_W, height: 1123, transform: 'scale(0.189)', transformOrigin: 'top left' }}>
        <ResumePage data={data} template={template} />
      </div>
    </div>
  );
}
