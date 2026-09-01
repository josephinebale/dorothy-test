import { Layers } from 'lucide-react';
import { variantLabel } from '../lib/pageVariants';
import { IconButton } from './ui/IconButton';

/** Sits opposite the annotations pair so it is never mistaken for one of them. */
export function PageVariantToggle({
  path,
  active,
  onToggle,
}: {
  path: string;
  active: boolean;
  onToggle: () => void;
}) {
  const label = variantLabel(path);
  if (!label) return null;

  return (
    <div className="session-questions-dock pointer-events-none sticky z-50 h-0">
      <div className="page-variant-control pointer-events-auto">
        <IconButton
          type="button"
          bordered
          onClick={onToggle}
          aria-label={label}
          data-tooltip={label}
          aria-pressed={active}
          className="ui-tooltip"
        >
          <Layers className="h-5 w-5" />
        </IconButton>
      </div>
    </div>
  );
}
