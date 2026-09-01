import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDefaultSessionQuestions,
  pageLabel,
  parseSessionQuestions,
} from '../src/lib/sessionQuestions.ts';

test('session storage defaults to annotations visible', () => {
  assert.deepEqual(createDefaultSessionQuestions(), {
    annotationsVisible: true,
  });
});

test('falls back to annotations visible when saved data is invalid', () => {
  assert.deepEqual(parseSessionQuestions('not-json'), {
    annotationsVisible: true,
  });
  assert.deepEqual(parseSessionQuestions('{}'), {
    annotationsVisible: true,
  });
});

test('older session payloads keep only the annotations visibility flag', () => {
  const saved = JSON.stringify({
    quickNotes: [{ id: 'q1', path: '/bookings', text: 'Existing quick note' }],
    questions: [{ id: 'question-1', text: 'Existing question', note: 'Old answer' }],
    otherNotes: 'Existing other notes',
    annotationsVisible: false,
  });

  assert.deepEqual(parseSessionQuestions(saved), {
    annotationsVisible: false,
  });
});

test('new settings routes keep readable research-note labels', () => {
  assert.equal(pageLabel('/manage-location/people'), 'Location settings');
  assert.equal(pageLabel('/manage-house/people'), 'Location settings');
  assert.equal(pageLabel('/organisation-settings/documents'), 'Organisation settings');
  assert.equal(pageLabel('/your-account/privacy'), 'Your account');
});
