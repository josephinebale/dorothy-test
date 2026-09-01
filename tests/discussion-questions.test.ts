import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DISCUSSION_QUESTIONS,
  questionById,
  questionsForPage,
} from '../src/data/discussionQuestions.ts';
import {
  createDefaultSessionQuestions,
  formatSessionNotes,
  parseSessionQuestions,
  setSessionQuestionNote,
} from '../src/lib/sessionQuestions.ts';

test('discussion questions have unique ids and element questions have placement hints', () => {
  const ids = DISCUSSION_QUESTIONS.map((question) => question.id);

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(DISCUSSION_QUESTIONS.some((question) => question.type === 'general'));
  assert.ok(DISCUSSION_QUESTIONS.some((question) => question.type === 'element'));
  assert.ok(
    DISCUSSION_QUESTIONS
      .filter((question) => question.type === 'element')
      .every((question) => Boolean(question.elementHint)),
  );
});

test('the catalogue covers every requested research context', () => {
  const pages = new Set(DISCUSSION_QUESTIONS.map((question) => question.page));

  for (const page of [
    '/',
    '/bookings',
    '/request-booking',
    '/notifications',
    '/messages',
    '/manage-location',
    '/organisation-settings',
  ]) {
    assert.ok(pages.has(page), `missing ${page}`);
  }

  for (const hint of ['worker list sort order', 'frequency radios']) {
    assert.ok(
      DISCUSSION_QUESTIONS.some((question) => question.elementHint === hint),
      `missing ${hint}`,
    );
  }
});

test('question lookup and page grouping use the canonical catalogue', () => {
  assert.equal(questionById('request-frequency')?.elementHint, 'frequency radios');
  assert.ok(
    questionsForPage('/', 'general').every(
      (question) => question.page === '/' && question.type === 'general',
    ),
  );
});

test('default and older saved sessions gain every canonical question without losing answers', () => {
  const defaults = createDefaultSessionQuestions();
  const saved = parseSessionQuestions(
    JSON.stringify({
      questions: [
        {
          id: 'question-1',
          text: 'Edited existing question',
          note: 'Existing answer',
        },
      ],
      otherNotes: 'Keep this',
    }),
  );

  assert.equal(defaults.questions.length, DISCUSSION_QUESTIONS.length);
  assert.equal(saved.questions.length, DISCUSSION_QUESTIONS.length);
  assert.equal(saved.questions.find((question) => question.id === 'question-1')?.text, 'Edited existing question');
  assert.equal(saved.questions.find((question) => question.id === 'question-1')?.note, 'Existing answer');
  assert.equal(saved.otherNotes, 'Keep this');
});

test('a pinned answer updates the same question record used by copy all', () => {
  const state = createDefaultSessionQuestions();
  const next = setSessionQuestionNote(state, 'request-frequency', 'Weekly is the usual choice.');

  assert.equal(
    next.questions.find((question) => question.id === 'request-frequency')?.note,
    'Weekly is the usual choice.',
  );
  assert.equal(state.questions.find((question) => question.id === 'request-frequency')?.note, '');
});

test('copy all includes both general and element-pinned answers', () => {
  let state = createDefaultSessionQuestions();
  state = setSessionQuestionNote(state, 'bookings-general', 'I search by worker.');
  state = setSessionQuestionNote(state, 'request-frequency', 'Weekly is familiar.');
  const summary = formatSessionNotes(state);

  assert.match(summary, /General questions/);
  assert.match(summary, /How do you currently find a booking[\s\S]*Notes: I search by worker\./);
  assert.match(summary, /Element-pinned questions/);
  assert.match(summary, /Dashboard — weekly bookings grid/);
  assert.match(summary, /Do these frequency options[\s\S]*Notes: Weekly is familiar\./);
});
