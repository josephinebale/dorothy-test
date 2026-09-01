import { useEffect, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { SessionQuestionsPanel } from './SessionQuestionsPanel';
import { IconButton } from './ui/IconButton';

export function SessionQuestions({ path }: { path: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      {open && <SessionQuestionsPanel path={path} onClose={() => setOpen(false)} />}

      {/* Sticky rather than fixed so the button stops above the footer instead of covering it */}
      <div className="session-questions-dock pointer-events-none sticky z-50 h-0">
        <IconButton
          type="button"
          bordered
          onClick={() => setOpen((current) => !current)}
          aria-label="Session questions"
          data-tooltip="Session questions"
          aria-expanded={open}
          className="session-questions-button pointer-events-auto ui-tooltip"
        >
          <CircleHelp className="h-5 w-5" />
        </IconButton>
      </div>
    </>
  );
}
