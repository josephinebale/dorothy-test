import { AppFooter } from '../components/AppFooter';
import { Logo } from '../components/Logo';
import { PageHeading } from '../components/PageHeading';
import { Button } from '../components/ui/Button';
import { findHouse } from '../data/houses';

type SignedOutProps = {
  lastHouseId: string | null;
  onSignInAsReturning: () => void;
  onSignInAsNewUser: () => void;
};

export function SignedOut({
  lastHouseId,
  onSignInAsReturning,
  onSignInAsNewUser,
}: SignedOutProps) {
  const lastHouse = findHouse(lastHouseId);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border-subtle bg-surface">
        <div className="header-identity mx-auto flex max-w-page items-center px-8">
          <Logo />
        </div>
      </header>

      <main className="mx-auto w-full max-w-page flex-1 px-8 py-8">
        <div className="mx-auto max-w-content">
        <PageHeading
          title="You are logged out"
          description="Log back in to continue, or start as a new user to see the first-time experience."
        />

        <div className="space-y-4">
          <Button
            type="button"
            variant="primary"
            onClick={onSignInAsReturning}
            className="w-full"
          >
            Log back in
            {lastHouse && (
              <span className="ml-1 font-normal opacity-90">— returns to {lastHouse.name}</span>
            )}
          </Button>
          <Button
            type="button"
            onClick={onSignInAsNewUser}
            className="w-full"
          >
            Log in as a new user
          </Button>
        </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
