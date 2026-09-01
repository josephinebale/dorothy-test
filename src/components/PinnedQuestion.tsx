import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { questionById } from '../data/discussionQuestions';
import {
  readSessionQuestions,
  SESSION_QUESTIONS_CHANGE_EVENT,
  setSessionQuestionNote,
  writeSessionQuestions,
  type SessionQuestionsState,
} from '../lib/sessionQuestions';
import { Card } from './ui/Card';
import { IconButton } from './ui/IconButton';

function answerFor(state: SessionQuestionsState, questionId: string): string {
  return state.questions.find((question) => question.id === questionId)?.note ?? '';
}

export function PinnedQuestion({
  questionId,
  className = '',
}: {
  questionId: string;
  className?: string;
}) {
  const question = questionById(questionId);
  const popoverId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [answer, setAnswer] = useState(() =>
    answerFor(readSessionQuestions(), questionId),
  );

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current?.getBoundingClientRect();
    if (!trigger) return;

    const width = 288;
    const viewportGap = 16;
    setPosition({
      top: trigger.bottom + 8,
      left: Math.min(
        window.innerWidth - width - viewportGap,
        Math.max(viewportGap, trigger.right - width),
      ),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const syncAnswer = (event: Event) => {
      const state = (event as CustomEvent<SessionQuestionsState>).detail;
      if (state) setAnswer(answerFor(state, questionId));
    };

    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener(SESSION_QUESTIONS_CHANGE_EVENT, syncAnswer);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener(SESSION_QUESTIONS_CHANGE_EVENT, syncAnswer);
    };
  }, [questionId]);

  if (!question) return null;

  const saveAnswer = (value: string) => {
    setAnswer(value);
    writeSessionQuestions(
      setSessionQuestionNote(readSessionQuestions(), questionId, value),
    );
  };

  return (
    <span ref={rootRef} className={`inline-flex shrink-0 ${className}`.trim()}>
      <IconButton
        ref={triggerRef}
        type="button"
        size="small"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Discussion question about ${question.elementHint}`}
        aria-expanded={open}
        aria-controls={popoverId}
        className="pinned-question-trigger text-text-tertiary"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary" />
      </IconButton>

      {open && createPortal(
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: position.top, left: position.left }}
          className="z-50 w-72"
        >
          <Card as="section" id={popoverId} className="p-4 text-left">
            <p className="text-sm font-bold text-text">{question.text}</p>
            <label className="mt-3 block text-xs font-medium text-text-secondary">
              Answer
              <textarea
                value={answer}
                onChange={(event) => saveAnswer(event.target.value)}
                placeholder="Jot down what was said"
                rows={4}
                className="mt-1 w-full resize-y rounded border border-border bg-surface px-3 py-2 text-sm font-normal text-text"
              />
            </label>
          </Card>
        </div>,
        document.body,
      )}
    </span>
  );
}
