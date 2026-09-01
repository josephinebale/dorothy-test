import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function PrototypeStart({ onStart }: { onStart: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6 py-10">
      <Card className="w-full max-w-md px-8 py-10 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-8 text-xl font-bold text-text">
          Log in to Hireup
        </h1>
        <p className="mx-auto mt-2 max-w-prose text-sm text-text-secondary">
          Australia’s leading online NDIS registered provider
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={onStart}
          className="mt-8 w-full"
        >
          Login
        </Button>
      </Card>
    </main>
  );
}
