const q = (id, category, text, tip) => ({ id, category, text, tip });

export const MOCK_CATEGORIES = ['HR', 'Python', 'JavaScript', 'React', 'Projects'];

export const mockQuestions = [
  q('m-hr-1', 'HR', 'Tell me about yourself.', 'Present, past, future in about a minute.'),
  q('m-hr-2', 'HR', 'Why should we hire you?', 'Match one strength to the role and back it with an example.'),
  q('m-hr-3', 'HR', 'What are your strengths?', 'Pick two, each with a short example.'),
  q('m-hr-4', 'HR', 'What are your weaknesses?', 'Be honest, then explain how you are improving.'),
  q('m-hr-5', 'HR', 'Why do you want this role?', 'Show you researched the company and the work.'),
  q('m-py-1', 'Python', 'Explain the difference between a list and a tuple, and when you would use each.', 'Mention mutability and a real use case.'),
  q('m-py-2', 'Python', 'What is a dictionary and how does lookup stay fast?', 'Hash table, average O(1).'),
  q('m-py-3', 'Python', 'How do you handle errors in Python?', 'try, except, finally and raising your own errors.'),
  q('m-py-4', 'Python', 'What is a decorator? Give a simple example.', 'A function that wraps another function.'),
  q('m-js-1', 'JavaScript', 'What is the difference between var, let and const?', 'Scope, hoisting and reassignment.'),
  q('m-js-2', 'JavaScript', 'Explain closures with an example.', 'A function remembering its outer variables.'),
  q('m-js-3', 'JavaScript', 'How do promises and async/await work?', 'Mention error handling with try/catch.'),
  q('m-js-4', 'JavaScript', 'What is the event loop?', 'Call stack, queues, microtasks first.'),
  q('m-re-1', 'React', 'What is the virtual DOM and why does React use it?', 'Diffing and minimal real DOM updates.'),
  q('m-re-2', 'React', 'Explain props versus state.', 'Ownership and who can change them.'),
  q('m-re-3', 'React', 'How does useEffect work and when would you use cleanup?', 'Dependency array, timers, subscriptions.'),
  q('m-re-4', 'React', 'How do you share data between components?', 'Props, lifting state, context.'),
  q('m-pr-1', 'Projects', 'Walk me through your best project.', 'Problem, solution, your role, result.'),
  q('m-pr-2', 'Projects', 'What was the hardest bug in your project and how did you solve it?', 'Show your debugging process.'),
  q('m-pr-3', 'Projects', 'If you had two more weeks, what would you improve in your project?', 'Show product thinking and honesty about gaps.'),
];

export const SELF_REVIEW_CHECKS = ['Spoke clearly and at a steady pace', 'Looked at the camera', 'Structured my answer', 'Gave a concrete example', 'Finished within about two minutes'];
