import { useEffect, useState } from 'react';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import {
  readSessionQuestions,
  SESSION_QUESTIONS_CHANGE_EVENT,
  writeSessionQuestions,
  type SessionQuestionsState,
} from '../lib/sessionQuestions';
import { IconButton } from './ui/IconButton';

export function SessionQuestions({ onRestart }: { onRestart: () => void }) {
  const [annotationsVisible, setAnnotationsVisible] = useState(
    () => readSessionQuestions().annotationsVisible,
  );

  useEffect(() => {
    const syncSession = (event: Event) => {
      const state = (event as CustomEvent<SessionQuestionsState>).detail;
      if (state) setAnnotationsVisible(state.annotationsVisible);
    };

    window.addEventListener(SESSION_QUESTIONS_CHANGE_EVENT, syncSession);
    return () => {
      window.removeEventListener(SESSION_QUESTIONS_CHANGE_EVENT, syncSession);
    };
  }, []);

  const toggleAnnotations = () => {
    const current = readSessionQuestions();
    const next = !current.annotationsVisible;
    setAnnotationsVisible(next);
    writeSessionQuestions({ ...current, annotationsVisible: next });
  };

  /* This control sits beside one the moderator uses mid-session, and it throws
     the run away, so it asks first. */
  const confirmRestart = () => {
    const confirmed = window.confirm(
      'Restart the prototype? This clears the chosen location and anything created during this session.',
    );
    if (confirmed) onRestart();
  };

  return (
    <div className="session-questions-dock pointer-events-none sticky z-50 h-0">
      <div className="session-questions-controls pointer-events-auto">
        <IconButton
          type="button"
          bordered
          onClick={toggleAnnotations}
          aria-label={annotationsVisible ? 'Hide annotations' : 'Show annotations'}
          data-tooltip={annotationsVisible ? 'Hide annotations' : 'Show annotations'}
          aria-pressed={annotationsVisible}
          className="ui-tooltip"
        >
          {/* The icon names the action, like the label: struck-out eye to hide. */}
          {annotationsVisible ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </IconButton>

        <IconButton
          type="button"
          bordered
          onClick={confirmRestart}
          aria-label="Restart prototype"
          data-tooltip="Restart prototype"
          className="ui-tooltip"
        >
          <RotateCcw className="h-5 w-5" />
        </IconButton>
      </div>
    </div>
  );
}
