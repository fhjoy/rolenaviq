export const checklist = [
  { id: 'company-research', label: 'Research the company and its product' },
  { id: 'role-research', label: 'Review the role and its requirements' },
  { id: 'examples', label: 'Prepare examples from your experience' },
  { id: 'questions', label: 'Write questions to ask the interviewer' },
] as const;

export const questions = [
  { id: 'introduction', category: 'Your story', prompt: 'Tell me about yourself.', hint: 'Connect your experience to the role.' },
  { id: 'interest', category: 'Your story', prompt: 'Why are you interested in this role?', hint: 'Mention the team or product and what you can contribute.' },
  { id: 'challenge', category: 'Your story', prompt: 'Tell me about a challenge you solved.', hint: 'Explain the situation, your actions, and the result.' },
  { id: 'teamwork', category: 'Your story', prompt: 'How do you work with a team?', hint: 'Use a specific example of collaboration.' },
  { id: 'javascript', category: 'Frontend', prompt: 'How does the JavaScript event loop affect an interface?', hint: 'Consider tasks, promises, and user interactions.' },
  { id: 'react', category: 'Frontend', prompt: 'How would you prevent unnecessary renders in React?', hint: 'Start with measuring, then consider state placement and memoization.' },
  { id: 'angular', category: 'Frontend', prompt: 'How do Angular signals and change detection work together?', hint: 'Think about reactive values and where they are read.' },
  { id: 'accessibility', category: 'Frontend', prompt: 'How would you make a form accessible?', hint: 'Discuss labels, errors, keyboard use, and testing.' },
  { id: 'testing', category: 'Engineering', prompt: 'What would you test in an application form?', hint: 'Cover validation, network errors, and the user journey.' },
  { id: 'api-design', category: 'Engineering', prompt: 'How would you design an API for saved applications?', hint: 'Consider authorization, validation, and error responses.' },
  { id: 'architecture', category: 'Engineering', prompt: 'When would you split a frontend into separate applications?', hint: 'Consider ownership, deployment, and shared dependencies.' },
  { id: 'tradeoffs', category: 'Engineering', prompt: 'Describe a technical decision with a difficult trade-off.', hint: 'Explain the alternatives and why you chose one.' },
] as const;

export type QuestionId = (typeof questions)[number]['id'];
