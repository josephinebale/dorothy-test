import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

test('PinnedQuestion uses existing primitives and a calm prominent marker', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');
  const css = source('../src/index.css');

  assert.match(pinned, /<IconButton/);
  assert.match(pinned, /<Card\s+as="section"/);
  assert.match(pinned, /rounded-full bg-text-secondary/);
  assert.doesNotMatch(pinned, /ui-badge|bg-badge|text-badge/);
  assert.doesNotMatch(pinned, /shadow-/);
  assert.match(css, /\.pinned-question-trigger[\s\S]*?height: 1\.75rem;/);
  assert.match(css, /\.pinned-question-trigger[\s\S]*?width: 1\.75rem;/);
  assert.match(css, /\.pinned-question-trigger[\s\S]*?background: var\(--color-neutral-surface\);/);
});

test('PinnedQuestion shows only the canonical question text', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');

  assert.match(pinned, /questionById\(questionId\)/);
  assert.match(pinned, /\{question\.text\}/);
  assert.doesNotMatch(pinned, /<textarea|Answer|Jot down|setSessionQuestionNote/);
});

test('PinnedQuestion follows the persisted annotations visibility state', () => {
  const pinned = source('../src/components/PinnedQuestion.tsx');

  assert.match(pinned, /annotationsVisible/);
  assert.match(pinned, /SESSION_QUESTIONS_CHANGE_EVENT/);
  assert.match(pinned, /if \(!question \|\| !annotationsVisible\) return null/);
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

test('the research dock is an annotations toggle only', () => {
  const dock = source('../src/components/SessionQuestions.tsx');
  const app = source('../src/App.tsx');

  assert.match(dock, /annotationsVisible/);
  assert.match(dock, /aria-pressed=\{annotationsVisible\}/);
  assert.match(dock, /writeSessionQuestions/);
  assert.match(dock, /Show annotations|Hide annotations/);
  assert.doesNotMatch(dock, /Session questions|CircleHelp|SessionQuestionsPanel|path/);
  assert.match(app, /<SessionQuestions onRestart=\{restart\} \/>/);
  assert.equal(
    existsSync(new URL('../src/components/SessionQuestionsPanel.tsx', import.meta.url)),
    false,
  );
});

test('the dock offers a restart beside the annotations toggle', () => {
  const dock = source('../src/components/SessionQuestions.tsx');

  const eyeAt = dock.indexOf('annotationsVisible ? \'Hide annotations\'');
  const restartAt = dock.indexOf('Restart prototype');

  assert.ok(eyeAt > -1 && restartAt > eyeAt, 'restart should follow the eye');
  assert.match(dock, /<RotateCcw className="h-5 w-5" \/>/);
  assert.match(dock, /onClick=\{confirmRestart\}/);
  assert.match(dock, /window\.confirm/);
});

test('restart returns the prototype to a location that has never been chosen', () => {
  const app = source('../src/App.tsx');
  const session = source('../src/lib/session.ts');
  const profiles = source('../src/lib/locationProfiles.ts');

  assert.match(session, /export function clearSession\(\)/);
  assert.match(session, /remove\(SIGNED_IN_KEY\)/);
  assert.match(profiles, /export function clearLocationProfiles\(\)/);

  const restart = app.slice(app.indexOf('const restart ='), app.indexOf('const signOut ='));
  assert.match(restart, /clearSession\(\)/);
  assert.match(restart, /clearLocationProfiles\(\)/);
  assert.match(restart, /setLocationId\(null\)/);
  assert.match(restart, /setCreatedBookings\(\[\]\)/);
  assert.match(restart, /setUnreadOverride\(null\)/);
  assert.match(restart, /navigate\('\/'\)/);
});
