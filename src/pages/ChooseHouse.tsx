import { ChevronRight } from 'lucide-react';
import { HOUSES } from '../data/houses';
import { AppFooter } from '../components/AppFooter';
import { HouseMarker } from '../components/HouseMarker';
import { Logo } from '../components/Logo';
import { PageHeading } from '../components/PageHeading';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';

export function ChooseHouse({ onSelect }: { onSelect: (houseId: string) => void }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="app-header">
        <div className="app-header-row mx-auto flex max-w-page items-center px-8">
          <Logo />
        </div>
      </header>

      <main className="mx-auto w-full max-w-page flex-1 px-8 py-8">
        <div className="width-main-column">
        <PageHeading
          title="Choose your location"
          description="Select the location you typically manage supports for. You can change this at any time."
        />

        <Card divided>
          {HOUSES.map((house) => (
            <button
              key={house.id}
              type="button"
              onClick={() => onSelect(house.id)}
            className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-surface-subtle"
          >
            <HouseMarker house={house} />
            <span className="min-w-0 flex-1">
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
