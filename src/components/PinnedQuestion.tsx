import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { questionById } from '../data/discussionQuestions';
import {
  readSessionQuestions,
  SESSION_QUESTIONS_CHANGE_EVENT,
  type SessionQuestionsState,
} from '../lib/sessionQuestions';
import { Card } from './ui/Card';
import { IconButton } from './ui/IconButton';

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
  const [annotationsVisible, setAnnotationsVisible] = useState(
    () => readSessionQuestions().annotationsVisible,
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
    const syncVisibility = (event: Event) => {
      const state = (event as CustomEvent<SessionQuestionsState>).detail;
      if (!state) return;
      setAnnotationsVisible(state.annotationsVisible);
      if (!state.annotationsVisible) setOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener(SESSION_QUESTIONS_CHANGE_EVENT, syncVisibility);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener(SESSION_QUESTIONS_CHANGE_EVENT, syncVisibility);
    };
  }, []);

  if (!question || !annotationsVisible) return null;

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
        <span className="h-2 w-2 rounded-full bg-text-secondary" />
      </IconButton>

      {open && createPortal(
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: position.top, left: position.left }}
          className="z-50 w-72"
        >
          <Card as="section" id={popoverId} className="p-4 text-left">
            <p className="text-sm font-bold text-text">{question.text}</p>
          </Card>
        </div>,
        document.body,
      )}
    </span>
  );
}
