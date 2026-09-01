import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('PinnedQuestion uses existing primitives and a neutral dot marker', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');
  const css = source('../src/index.css');

  assert.match(pinned, /<IconButton/);
  assert.match(pinned, /<Card\s+as="section"/);
  assert.match(pinned, /bg-text-tertiary/);
  assert.doesNotMatch(pinned, /ui-badge|bg-badge|text-badge/);
  assert.doesNotMatch(pinned, /shadow-/);
  assert.match(css, /\.pinned-question-trigger[\s\S]*?height: 1\.5rem;/);
  assert.match(css, /\.pinned-question-trigger[\s\S]*?width: 1\.5rem;/);
});

test('PinnedQuestion shows the canonical question and saves its answer', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');

  assert.match(pinned, /questionById\(questionId\)/);
  assert.match(pinned, /<textarea/);
  assert.match(pinned, /setSessionQuestionNote/);
  assert.match(pinned, /writeSessionQuestions/);
});

test('PinnedQuestion popovers close with Escape and outside clicks', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');

  assert.match(pinned, /event\.key === 'Escape'/);
  assert.match(pinned, /rootRef\.current\?\.contains/);
  assert.match(pinned, /pointerdown/);
});

test('PinnedQuestion renders its popover outside clipping cards and panes', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');

  assert.match(pinned, /createPortal/);
  assert.match(pinned, /position: 'fixed'/);
  assert.match(pinned, /popoverRef\.current\?\.contains/);
  assert.doesNotMatch(pinned, /className=\{`relative inline-flex/);
});

test('element questions are pinned to every requested page and context', () => {
  const placements: Record<string, string[]> = {
    '../src/pages/dashboard/NotificationStrip.tsx': ['dashboard-attention'],
    '../src/pages/dashboard/BookingsWeek.tsx': ['dashboard-week'],
    '../src/pages/dashboard/TeamPanel.tsx': ['dashboard-worker-order'],
    '../src/pages/Bookings.tsx': ['bookings-status', 'bookings-filters'],
    '../src/pages/BookingRequest.tsx': [
      'request-location',
      'request-frequency',
      'request-workers',
    ],
    '../src/pages/Notifications.tsx': ['notifications-list'],
    '../src/pages/Messages.tsx': ['messages-conversations'],
    '../src/pages/Settings.tsx': ['settings-sections'],
    '../src/components/LocationSwitcher.tsx': ['access-context'],
  };

  for (const [path, questionIds] of Object.entries(placements)) {
    const contents = source(path);
    for (const questionId of questionIds) {
      assert.match(contents, new RegExp(`questionId="${questionId}"`), `${path} lacks ${questionId}`);
    }
  }
});

test('the question panel groups only general discussion questions by page', () => {
  const panel = source('../src/components/SessionQuestionsPanel.tsx');

  assert.match(panel, /DISCUSSION_QUESTIONS/);
  assert.match(panel, /question\.type === 'general'/);
  assert.match(panel, /pageLabel\(page\)/);
  assert.match(panel, /generalQuestionGroups\.map/);
  assert.doesNotMatch(panel, /state\.questions\.map\(\(question, index\)/);
});

test('the question panel synchronises answers entered through pinned popovers', () => {
  const panel = source('../src/components/SessionQuestionsPanel.tsx');

  assert.match(panel, /SESSION_QUESTIONS_CHANGE_EVENT/);
  assert.match(panel, /window\.addEventListener\(SESSION_QUESTIONS_CHANGE_EVENT/);
});

test('the copy-all control follows the label-only button rule', () => {
  const panel = source('../src/components/SessionQuestionsPanel.tsx');
  const copyButton = panel.slice(
    panel.indexOf('onClick={copyAll}') - 120,
    panel.indexOf('onClick={copyAll}') + 260,
  );

  assert.doesNotMatch(copyButton, /<Copy/);
});
