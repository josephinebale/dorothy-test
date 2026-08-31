import { useEffect, useState } from 'react';
import { Copy, Trash2, X } from 'lucide-react';
import {
  formatSessionNotes,
  pageLabel,
  readSessionQuestions,
  writeSessionQuestions,
  type SessionQuestionsState,
} from '../lib/sessionQuestions';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { IconButton } from './ui/IconButton';

type SessionQuestionsPanelProps = {
  path: string;
  onClose: () => void;
};

export function SessionQuestionsPanel({ path, onClose }: SessionQuestionsPanelProps) {
  const [state, setState] = useState<SessionQuestionsState>(readSessionQuestions);
  const [quickNote, setQuickNote] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    writeSessionQuestions(state);
  }, [state]);

  const updateQuestion = (
    id: string,
    field: 'text' | 'note',
    value: string,
  ) => {
    setState((current) => ({
      ...current,
      questions: current.questions.map((question) =>
        question.id === id ? { ...question, [field]: value } : question,
      ),
    }));
    setCopyStatus('idle');
  };

  const addQuickNote = () => {
    const text = quickNote.trim();
    if (!text) return;

    setState((current) => ({
      ...current,
      quickNotes: [
        ...current.quickNotes,
        { id: `quick-note-${Date.now()}`, path, text },
      ],
    }));
    setQuickNote('');
    setCopyStatus('idle');
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(formatSessionNotes(state));
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <Card as="section" className="fixed right-4 bottom-16 z-50 flex width-session-panel flex-col">
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
        <h2 className="text-sm font-bold text-text">Session questions</h2>
        <IconButton
          type="button"
          onClick={onClose}
          aria-label="Close session questions"
          className="ml-auto text-text-secondary"
        >
          <X className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              addQuickNote();
            }}
            className="flex gap-2"
          >
            <label className="min-w-0 flex-1 text-sm font-medium text-text">
              Quick note
              <input
                value={quickNote}
                onChange={(event) => setQuickNote(event.target.value)}
                placeholder={`Add a note about ${pageLabel(path)}`}
                className="mt-1 h-10 w-full rounded border border-border bg-surface px-3 text-sm font-normal text-text"
              />
            </label>
            <Button
              type="submit"
              variant="primary"
              disabled={!quickNote.trim()}
              className="mt-6"
            >
              Add
            </Button>
          </form>

          {state.quickNotes.length > 0 && (
            <Card as="ul" divided className="mt-3">
              {state.quickNotes.map((note) => (
                <li key={note.id} className="flex items-start gap-2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded bg-surface-selected px-2 py-1 text-xs font-medium text-text-strong">
                      {pageLabel(note.path)}
                    </span>
                    <p className="mt-1 text-sm text-text">{note.text}</p>
                  </div>
                  <IconButton
                    type="button"
                    onClick={() => {
                      setState((current) => ({
                        ...current,
                        quickNotes: current.quickNotes.filter((item) => item.id !== note.id),
                      }));
                      setCopyStatus('idle');
                    }}
                    aria-label={`Delete quick note from ${pageLabel(note.path)}`}
                    className="text-text-secondary"
                  >
                    <Trash2 className="h-5 w-5" />
                  </IconButton>
                </li>
              ))}
            </Card>
          )}
        </div>

        <div className="border-t border-border-subtle pt-4">
          <h3 className="text-sm font-bold text-text">Planned questions</h3>
        </div>

        {state.questions.map((question, index) => (
          <div key={question.id}>
            <label className="block text-sm font-medium text-text">
              Question {index + 1}
              <textarea
                value={question.text}
                onChange={(event) => updateQuestion(question.id, 'text', event.target.value)}
                rows={2}
                className="mt-1 w-full resize-y rounded border border-border bg-surface px-3 py-2 text-sm font-normal text-text"
              />
            </label>
            <label className="mt-2 block text-xs font-medium text-text-secondary">
              Notes
              <textarea
                value={question.note}
                onChange={(event) => updateQuestion(question.id, 'note', event.target.value)}
                placeholder="Add what was said"
                rows={3}
                className="mt-1 w-full resize-y rounded border border-border bg-surface px-3 py-2 text-sm font-normal text-text"
              />
            </label>
          </div>
        ))}

        <label className="block border-t border-border-subtle pt-4 text-sm font-medium text-text">
          Other notes
          <textarea
            value={state.otherNotes}
            onChange={(event) => {
              setState((current) => ({ ...current, otherNotes: event.target.value }));
              setCopyStatus('idle');
            }}
            placeholder="Add anything unplanned that comes up"
            rows={5}
            className="mt-1 w-full resize-y rounded border border-border bg-surface px-3 py-2 text-sm font-normal text-text"
          />
        </label>
      </div>

      <div className="flex items-center gap-3 border-t border-border-subtle px-4 py-3">
        <Button
          type="button"
          onClick={copyAll}
          size="small"
        >
          <Copy className="h-4 w-4" />
          Copy all notes
        </Button>
        {copyStatus === 'copied' && (
          <span role="status" className="text-sm text-text-secondary">
            Copied
          </span>
        )}
        {copyStatus === 'failed' && (
          <span role="status" className="text-sm text-text-secondary">
            Couldn’t copy
          </span>
        )}
      </div>
    </Card>
  );
}
