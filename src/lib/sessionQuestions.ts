import { ROUTES } from './informationArchitecture.ts';
import { TEAM_ROUTE } from './pageContent.ts';

export type SessionQuestion = {
  id: string;
  text: string;
  note: string;
};

export type QuickNote = {
  id: string;
  path: string;
  text: string;
};

export type SessionQuestionsState = {
  quickNotes: QuickNote[];
  questions: SessionQuestion[];
  otherNotes: string;
};

const KEY = 'hm.sessionQuestions';

const PAGE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/bookings': 'Bookings',
  [TEAM_ROUTE]: 'Team',
  '/messages': 'Messages',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/support-plan': 'Support plan',
  '/report-incident': 'Report incident',
  '/knowledge-hub': 'Knowledge hub',
  '/invoices': 'Invoices',
  '/help-centre': 'Help centre',
  '/contact': 'Contact us',
  '/terms': 'Terms of use',
  '/privacy': 'Privacy policy',
  '/request-booking': 'Request booking',
};

const STARTER_QUESTIONS = [
  'What do you expect to find on this dashboard?',
  'How do you keep track of upcoming bookings today?',
  'What would you do if a booking needed attention?',
  'Is anything missing for managing this house?',
];

export function createDefaultSessionQuestions(): SessionQuestionsState {
  return {
    quickNotes: [],
    questions: STARTER_QUESTIONS.map((text, index) => ({
      id: `question-${index + 1}`,
      text,
      note: '',
    })),
    otherNotes: '',
  };
}

export function pageLabel(path: string): string {
  if (
    path === ROUTES.manageHouse ||
    path.startsWith(`${ROUTES.manageHouse}/`)
  ) {
    return 'Manage this house';
  }
  if (
    path === ROUTES.organisationSettings ||
    path.startsWith(`${ROUTES.organisationSettings}/`)
  ) {
    return 'Organisation settings';
  }
  if (
    path === ROUTES.yourAccount ||
    path.startsWith(`${ROUTES.yourAccount}/`)
  ) {
    return 'Your account';
  }
  return PAGE_LABELS[path] ?? path;
}

function isQuestion(value: unknown): value is SessionQuestion {
  if (typeof value !== 'object' || value === null) return false;
  const question = value as Partial<SessionQuestion>;
  return (
    typeof question.id === 'string' &&
    typeof question.text === 'string' &&
    typeof question.note === 'string'
  );
}

function isQuickNote(value: unknown): value is QuickNote {
  if (typeof value !== 'object' || value === null) return false;
  const note = value as Partial<QuickNote>;
  return (
    typeof note.id === 'string' &&
    typeof note.path === 'string' &&
    typeof note.text === 'string'
  );
}

export function parseSessionQuestions(raw: string | null): SessionQuestionsState {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (typeof parsed !== 'object' || parsed === null) return createDefaultSessionQuestions();

    const state = parsed as Partial<SessionQuestionsState>;
    if (
      !Array.isArray(state.questions) ||
      state.questions.length === 0 ||
      !state.questions.every(isQuestion) ||
      typeof state.otherNotes !== 'string'
    ) {
      return createDefaultSessionQuestions();
    }

    const quickNotes = state.quickNotes ?? [];
    if (!Array.isArray(quickNotes) || !quickNotes.every(isQuickNote)) {
      return createDefaultSessionQuestions();
    }

    return { quickNotes, questions: state.questions, otherNotes: state.otherNotes };
  } catch {
    return createDefaultSessionQuestions();
  }
}

export function readSessionQuestions(): SessionQuestionsState {
  try {
    return parseSessionQuestions(window.localStorage.getItem(KEY));
  } catch {
    return createDefaultSessionQuestions();
  }
}

export function writeSessionQuestions(state: SessionQuestionsState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Prototype only; a blocked storage API just means session notes are not remembered.
  }
}

export function formatSessionNotes(state: SessionQuestionsState): string {
  const lines = ['Quick notes'];

  if (state.quickNotes.length === 0) {
    lines.push('None');
  } else {
    lines.push('');
    state.quickNotes.forEach((note, index) => {
      lines.push(`${index + 1}. ${pageLabel(note.path)} — ${note.text.trim()}`);
    });
  }

  lines.push('');
  lines.push('Session questions');
  lines.push('');

  state.questions.forEach((question, index) => {
    lines.push(`${index + 1}. ${question.text.trim() || 'Untitled question'}`);
    lines.push(`Notes: ${question.note.trim() || '—'}`);
    lines.push('');
  });

  lines.push('Other notes');
  lines.push(state.otherNotes.trim() || '—');

  return lines.join('\n');
}
