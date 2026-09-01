import assert from 'node:assert/strict';
import test from 'node:test';
import { DISCUSSION_QUESTIONS } from '../src/data/discussionQuestions.ts';
import {
  createDefaultSessionQuestions,
  formatSessionNotes,
  pageLabel,
  parseSessionQuestions,
} from '../src/lib/sessionQuestions.ts';

test('starts with the canonical guide and preserves the four original dashboard questions', () => {
  const state = createDefaultSessionQuestions();

  assert.equal(state.questions.length, DISCUSSION_QUESTIONS.length);
  assert.deepEqual(
    state.questions.slice(0, 4).map((question) => question.id),
    ['question-1', 'question-2', 'question-3', 'question-4'],
  );
  assert.ok(state.questions.every((question) => question.text.length > 0));
  assert.ok(state.questions.every((question) => question.note === ''));
  assert.deepEqual(state.quickNotes, []);
  assert.equal(state.otherNotes, '');
});

test('falls back to the canonical guide when saved data is invalid', () => {
  assert.equal(
    parseSessionQuestions('not-json').questions.length,
    DISCUSSION_QUESTIONS.length,
  );
  assert.equal(
    parseSessionQuestions('{"questions":[]}').questions.length,
    DISCUSSION_QUESTIONS.length,
  );
});

test('older saved questions load with an empty quick-notes list', () => {
  const saved = JSON.stringify({
    questions: [{ id: 'q1', text: 'Existing question', note: 'Existing answer' }],
    otherNotes: 'Existing notes',
  });

  assert.deepEqual(parseSessionQuestions(saved).quickNotes, []);
});

test('copy summary keeps page-tagged quick notes, legacy questions, and other notes', () => {
  const state = {
    quickNotes: [
      { id: 'note-1', path: '/', text: 'Participant paused here.' },
      { id: 'note-2', path: '/bookings', text: 'Check this wording.' },
    ],
    questions: [
      { id: 'q1', text: 'What stood out?', note: 'The booking count.' },
      { id: 'q2', text: 'What was unclear?', note: '' },
    ],
    otherNotes: 'Follow up next week.',
  };

  const summary = formatSessionNotes(state);

  assert.match(summary, /1\. Dashboard — Participant paused here\./);
  assert.match(summary, /2\. Bookings — Check this wording\./);
  assert.match(summary, /Other planned questions[\s\S]*What stood out\?[\s\S]*Notes: The booking count\./);
  assert.match(summary, /What was unclear\?[\s\S]*Notes: —/);
  assert.match(summary, /Other notes\nFollow up next week\./);
});

test('new settings routes keep readable research-note labels', () => {
  assert.equal(pageLabel('/manage-location/people'), 'Location settings');
  assert.equal(pageLabel('/manage-house/people'), 'Location settings');
  assert.equal(pageLabel('/organisation-settings/documents'), 'Organisation settings');
  assert.equal(pageLabel('/your-account/privacy'), 'Your account');
});
