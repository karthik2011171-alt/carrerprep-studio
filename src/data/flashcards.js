import { moreFlashcards } from './flashcardsMore';
import { growFlashcards } from './flashcardsGrow';
import { stackFlashcards } from './flashcardsStack';

const c = (id, topic, q, a, code = '') => ({ id, subject: 'React', topic, q, a, code });

export const flashcards = [
  c('fc-1', 'Components', 'What is a React component?', 'A reusable function that returns UI (JSX). Component names start with a capital letter.', 'function Hello() {\n  return <h1>Hello</h1>;\n}'),
  c('fc-2', 'Components', 'Why split UI into small components?', 'Smaller components are easier to reuse, test and reason about. Each one should do one job.'),
  c('fc-3', 'JSX', 'What is JSX?', 'A syntax that looks like HTML but is JavaScript. Use {} to embed expressions and className instead of class.', 'const el = <p className="note">{1 + 1}</p>;'),
  c('fc-4', 'JSX', 'Why must JSX return a single root?', 'A function returns one value. Wrap siblings in a parent element or a Fragment.', 'return (\n  <>\n    <h1>Title</h1>\n    <p>Text</p>\n  </>\n);'),
  c('fc-5', 'Props', 'What are props?', 'Read-only inputs passed from a parent to a child component.', 'function Greet({ name }) {\n  return <p>Hi {name}</p>;\n}\n<Greet name="Asha" />'),
  c('fc-6', 'Props', 'What is the children prop?', 'Whatever you place between a component\'s opening and closing tags.', 'function Box({ children }) {\n  return <div className="box">{children}</div>;\n}'),
  c('fc-7', 'State', 'What is state?', 'Data a component remembers between renders. Updating it re-renders the component.'),
  c('fc-8', 'State', 'Why not modify state directly?', 'React only re-renders when you call the setter with a new value. Copy arrays and objects instead of mutating them.', 'setItems([...items, newItem]);'),
  c('fc-9', 'Events', 'How do you handle a click?', 'Pass a function to onClick. Do not call it inline, or it runs during render.', '<button onClick={handleClick}>Save</button>'),
  c('fc-10', 'Conditional rendering', 'How do you render conditionally?', 'Use ternaries, && or early returns.', '{isLoggedIn ? <Dashboard /> : <Login />}\n{items.length > 0 && <List />}'),
  c('fc-11', 'Lists', 'How do you render a list?', 'Use map and give each item a stable key.', '{todos.map((t) => (\n  <li key={t.id}>{t.text}</li>\n))}'),
  c('fc-12', 'Forms', 'What is a controlled input?', 'An input whose value comes from state and updates through onChange.', '<input value={name} onChange={(e) => setName(e.target.value)} />'),
  c('fc-13', 'Forms', 'How do you handle form submit?', 'Use onSubmit and call preventDefault to stop the page reload.', 'function onSubmit(e) {\n  e.preventDefault();\n  save(values);\n}'),
  c('fc-14', 'useState', 'How does useState work?', 'Returns the current value and a setter. Use the functional form when the new value depends on the old one.', 'const [count, setCount] = useState(0);\nsetCount((c) => c + 1);'),
  c('fc-15', 'useEffect', 'When does useEffect run?', 'After render. The dependency array decides when it runs again: [] once, [a] when a changes, none every render.', 'useEffect(() => {\n  document.title = title;\n}, [title]);'),
  c('fc-16', 'useEffect', 'How do you clean up an effect?', 'Return a function. React runs it before the next effect and on unmount.', 'useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);\n}, []);'),
  c('fc-17', 'useRef', 'What is useRef for?', 'Holds a mutable value that survives renders without causing re-renders. Often used to reach DOM elements.', 'const inputRef = useRef(null);\n<input ref={inputRef} />\ninputRef.current.focus();'),
  c('fc-18', 'useContext', 'What problem does useContext solve?', 'Shares data with deeply nested components without passing props through every level (prop drilling).', 'const theme = useContext(ThemeContext);'),
  c('fc-19', 'useMemo', 'What does useMemo do?', 'Caches a calculated value until its dependencies change. Use it for expensive calculations.', 'const sorted = useMemo(() => sortItems(items), [items]);'),
  c('fc-20', 'useCallback', 'What does useCallback do?', 'Caches a function so its reference stays the same between renders, which helps memoized children.', 'const onSave = useCallback(() => save(id), [id]);'),
  c('fc-21', 'React Router', 'How do you set up routes?', 'Wrap the app in BrowserRouter and describe routes with Routes and Route.', '<Routes>\n  <Route path="/" element={<Home />} />\n  <Route path="*" element={<NotFound />} />\n</Routes>'),
  c('fc-22', 'React Router', 'Link vs a tag?', 'Link navigates without a full page reload. NavLink adds an active style.', '<Link to="/about">About</Link>'),
  c('fc-23', 'React Router', 'How do you read URL params?', 'Define :id in the path and read it with useParams.', 'const { id } = useParams();'),
  c('fc-24', 'Component communication', 'How does a child talk to its parent?', 'The parent passes a callback as a prop and the child calls it.', '<Child onSelect={(id) => setSelected(id)} />'),
  c('fc-25', 'Component communication', 'What is lifting state up?', 'Move shared state to the closest common parent and pass it down as props.'),
  c('fc-26', 'API calls', 'How do you fetch data on load?', 'Call fetch inside useEffect, track loading and error state, and clean up if needed.', 'useEffect(() => {\n  const load = async () => {\n    const res = await fetch(url);\n    setData(await res.json());\n  };\n  load();\n}, []);'),
  c('fc-27', 'API calls', 'Why handle loading and error states?', 'Networks fail. Show a loader while waiting and a clear message with a retry option on failure.'),
  c('fc-28', 'Common concepts', 'What is React.memo?', 'Skips re-rendering a component when its props have not changed.', 'const Row = React.memo(function Row({ item }) {\n  return <li>{item}</li>;\n});'),
  c('fc-29', 'Common concepts', 'What is a custom hook?', 'A function starting with "use" that reuses stateful logic between components.', 'function useToggle(initial = false) {\n  const [on, setOn] = useState(initial);\n  return [on, () => setOn((v) => !v)];\n}'),
  c('fc-30', 'Common concepts', 'What is the difference between state and a ref?', 'Changing state re-renders. Changing ref.current does not.'),
];

export const FLASHCARD_SUBJECTS = ['React', 'HTML', 'CSS', 'JavaScript', 'Python', 'SQL', 'Django', 'Node.js', 'Project Concepts'];

// Default syntax-highlighting language per subject (a card can override it with `lang`)
export const SUBJECT_LANG = { React: 'jsx', HTML: 'html', CSS: 'css', JavaScript: 'js', Python: 'python', SQL: 'sql', Django: 'python', 'Node.js': 'js', 'Project Concepts': 'js' };

export const allFlashcards = [...flashcards, ...moreFlashcards, ...growFlashcards, ...stackFlashcards];
