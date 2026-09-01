import { ROUTES } from './informationArchitecture.ts';
import { TEAM_ROUTE } from './pageContent.ts';
import { DISCUSSION_QUESTIONS } from '../data/discussionQuestions.ts';

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
export const SESSION_QUESTIONS_CHANGE_EVENT = 'hm.sessionQuestions:change';

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

function mergeCanonicalQuestions(saved: SessionQuestion[]): SessionQuestion[] {
  const savedById = new Map(saved.map((question) => [question.id, question]));
  const canonicalIds = new Set(DISCUSSION_QUESTIONS.map((question) => question.id));

  return [
    ...DISCUSSION_QUESTIONS.map((question) => {
      const existing = savedById.get(question.id);
      return existing ?? { id: question.id, text: question.text, note: '' };
    }),
    ...saved.filter((question) => !canonicalIds.has(question.id)),
  ];
}

export function createDefaultSessionQuestions(): SessionQuestionsState {
  return {
    quickNotes: [],
    questions: DISCUSSION_QUESTIONS.map((question) => ({
      id: question.id,
      text: question.text,
      note: '',
    })),
    otherNotes: '',
  };
}

export function pageLabel(path: string): string {
  if (path === '/request-booking') return 'Request booking';
  if (path.startsWith('/bookings/request/')) return 'Requested booking';
  if (
    path === ROUTES.manageLocation ||
    path.startsWith(`${ROUTES.manageLocation}/`) ||
    path === '/manage-house' ||
    path.startsWith('/manage-house/')
  ) {
    return 'Location settings';
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

    return {
      quickNotes,
      questions: mergeCanonicalQuestions(state.questions),
      otherNotes: state.otherNotes,
    };
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
    window.dispatchEvent(
      new CustomEvent<SessionQuestionsState>(SESSION_QUESTIONS_CHANGE_EVENT, {
        detail: state,
      }),
    );
  } catch {
    // Prototype only; a blocked storage API just means session notes are not remembered.
  }
}

export function setSessionQuestionNote(
  state: SessionQuestionsState,
  id: string,
  note: string,
): SessionQuestionsState {
  return {
    ...state,
    questions: state.questions.map((question) =>
      question.id === id ? { ...question, note } : question,
    ),
  };
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

  const answersById = new Map(state.questions.map((question) => [question.id, question]));
  const canonicalIds = new Set(DISCUSSION_QUESTIONS.map((question) => question.id));
  const general = DISCUSSION_QUESTIONS.filter(
    (question) => question.type === 'general' && answersById.has(question.id),
  );
  const pinned = DISCUSSION_QUESTIONS.filter(
    (question) => question.type === 'element' && answersById.has(question.id),
  );
  const custom = state.questions.filter((question) => !canonicalIds.has(question.id));

  lines.push('', 'General questions');
  let currentPage = '';
  general.forEach((question, index) => {
    if (question.page !== currentPage) {
      currentPage = question.page;
      lines.push('', pageLabel(question.page));
    }
    const answer = answersById.get(question.id);
    lines.push(`${index + 1}. ${answer?.text.trim() || question.text}`);
    lines.push(`Notes: ${answer?.note.trim() || '—'}`);
  });

  lines.push('', 'Element-pinned questions');
  pinned.forEach((question, index) => {
    const answer = answersById.get(question.id);
    lines.push('');
    lines.push(`${index + 1}. ${pageLabel(question.page)} — ${question.elementHint}`);
    lines.push(answer?.text.trim() || question.text);
    lines.push(`Notes: ${answer?.note.trim() || '—'}`);
  });

  if (custom.length > 0) {
    lines.push('', 'Other planned questions');
    custom.forEach((question, index) => {
      lines.push('');
      lines.push(`${index + 1}. ${question.text.trim() || 'Untitled question'}`);
      lines.push(`Notes: ${question.note.trim() || '—'}`);
    });
  }

  lines.push('', 'Other notes');
  lines.push(state.otherNotes.trim() || '—');

  return lines.join('\n');
}
