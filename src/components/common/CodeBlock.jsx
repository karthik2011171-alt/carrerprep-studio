import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { sql } from '@codemirror/lang-sql';
import { EditorView } from '@codemirror/view';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { useIsLight } from './CodeEditor';

const LANGUAGES = {
  python: () => python(),
  js: () => javascript(),
  jsx: () => javascript({ jsx: true }),
  html: () => html(),
  css: () => css(),
  sql: () => sql(),
};

// Read-only, syntax-highlighted code. Unknown languages (such as shell) render as plain text.
export default function CodeBlock({ code, lang }) {
  const light = useIsLight();
  const extensions = useMemo(() => {
    const make = LANGUAGES[lang];
    return [
      ...(make ? [make()] : []),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': { fontSize: '13px' },
        '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', lineHeight: '1.6' },
      }),
    ];
  }, [lang]);

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-line">
      <CodeMirror
        value={code}
        editable={false}
        readOnly
        theme={light ? vscodeLight : vscodeDark}
        extensions={extensions}
        basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false, highlightActiveLineGutter: false, autocompletion: false }}
      />
    </div>
  );
}
