import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDefaultSessionQuestions,
  formatSessionNotes,
  pageLabel,
  parseSessionQuestions,
} from '../src/lib/sessionQuestions.ts';

test('starts with four editable research questions', () => {
  const state = createDefaultSessionQuestions();

  assert.equal(state.questions.length, 4);
  assert.ok(state.questions.every((question) => question.text.length > 0));
  assert.ok(state.questions.every((question) => question.note === ''));
  assert.deepEqual(state.quickNotes, []);
  assert.equal(state.otherNotes, '');
});

test('falls back to starter questions when saved data is invalid', () => {
  assert.equal(parseSessionQuestions('not-json').questions.length, 4);
  assert.equal(parseSessionQuestions('{"questions":[]}').questions.length, 4);
});

test('older saved questions load with an empty quick-notes list', () => {
  const saved = JSON.stringify({
    questions: [{ id: 'q1', text: 'Existing question', note: 'Existing answer' }],
    otherNotes: 'Existing notes',
  });

  assert.deepEqual(parseSessionQuestions(saved).quickNotes, []);
});

test('copy summary includes page-tagged quick notes, questions, and other notes', () => {
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

  assert.equal(
    formatSessionNotes(state),
    [
      'Quick notes',
      '',
      '1. Dashboard — Participant paused here.',
      '2. Bookings — Check this wording.',
      '',
      'Session questions',
      '',
      '1. What stood out?',
      'Notes: The booking count.',
      '',
      '2. What was unclear?',
      'Notes: —',
      '',
      'Other notes',
      'Follow up next week.',
    ].join('\n'),
  );
});

test('new settings routes keep readable research-note labels', () => {
  assert.equal(pageLabel('/manage-house/people'), 'Manage this house');
  assert.equal(pageLabel('/organisation-settings/documents'), 'Organisation settings');
  assert.equal(pageLabel('/your-account/privacy'), 'Your account');
});
