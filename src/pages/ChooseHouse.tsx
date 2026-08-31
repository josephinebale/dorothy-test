import { ChevronRight } from 'lucide-react';
import { HOUSES } from '../data/houses';
import { AppFooter } from '../components/AppFooter';
import { Logo } from '../components/Logo';
import { PageHeading } from '../components/PageHeading';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';

export function ChooseHouse({ onSelect }: { onSelect: (houseId: string) => void }) {
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
          title="Choose your house"
          description="Select the house you work in. You can change this at any time."
        />

        <Card divided>
          {HOUSES.map((house) => (
            <button
              key={house.id}
              type="button"
              onClick={() => onSelect(house.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-surface-subtle"
            >
              <span>
                <EntityLink as="span" className="block">{house.name}</EntityLink>
                <span className="block text-sm text-text-secondary">
                  {house.suburb}, {house.state}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary" />
            </button>
          ))}
        </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
