import { href } from '../lib/router';
import { Logo } from './Logo';

export function AppFooter() {
  return (
    <footer className="page-footer border-t border-border-subtle bg-surface">
      <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-6 gap-y-2 px-8 py-3 text-xs">
        <a href={href('/')} aria-label="Hireup for Providers dashboard">
          <Logo compact />
        </a>
        <a href="#/help-centre" className="ui-link ui-link--muted">
          Help Centre
        </a>
        <a href="#/knowledge-hub" className="ui-link ui-link--muted">
          Knowledge hub
        </a>
        <a href="#/contact" className="ui-link ui-link--muted">
          Contact Us
        </a>
        <div className="ml-auto flex items-center gap-6 text-text-secondary">
          <a href="#/terms" className="ui-link ui-link--muted">
            Terms of Use
          </a>
          <a href="#/privacy" className="ui-link ui-link--muted">
            Privacy Policy
          </a>
          <span>© {new Date().getFullYear()} Hireup Pty Ltd</span>
        </div>
      </div>
    </footer>
  );
}
