import { useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { indentUnit } from '@codemirror/language';
import { EditorView, keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import useSettings from '../../hooks/useSettings';
import { cx } from '../../utils/cx';

export function useIsLight() {
  const [settings] = useSettings();
  const [systemLight, setSystemLight] = useState(() => window.matchMedia('(prefers-color-scheme: light)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => setSystemLight(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return settings.theme === 'light' || (settings.theme === 'system' && systemLight);
}

// VS Code-style Python editor: syntax colours, line numbers, auto-indent, auto-close brackets and
// quotes, bracket matching and Ctrl+Space suggestions. Ctrl/Cmd+Enter runs the code.
export default function CodeEditor({ value, onChange, onRun, label = 'Python code editor', className, height = '380px' }) {
  const light = useIsLight();
  const runRef = useRef(onRun);
  runRef.current = onRun;

  const extensions = useMemo(
    () => [
      python(),
      indentUnit.of('    '),
      Prec.highest(keymap.of([{ key: 'Mod-Enter', run: () => { runRef.current?.(); return true; } }])),
      EditorView.contentAttributes.of({ 'aria-label': label, autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false' }),
      EditorView.theme({
        '&': { fontSize: '14px' },
        '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', lineHeight: '1.6' },
      }),
    ],
    [label]
  );

  return (
    <div className={cx('overflow-hidden rounded-xl border border-line focus-within:border-accent', className)}>
      <CodeMirror
        value={value}
        onChange={onChange}
        height={height}
        theme={light ? vscodeLight : vscodeDark}
        extensions={extensions}
        indentWithTab
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          foldGutter: false,
          autocompletion: true,
          closeBrackets: true,
          bracketMatching: true,
          indentOnInput: true,
          tabSize: 4,
        }}
      />
    </div>
  );
}
