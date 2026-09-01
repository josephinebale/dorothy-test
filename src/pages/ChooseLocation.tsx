import { ChevronRight } from 'lucide-react';
import { LOCATIONS } from '../data/locations';
import { AppFooter } from '../components/AppFooter';
import { LocationMarker } from '../components/LocationMarker';
import { Logo } from '../components/Logo';
import { PageHeading } from '../components/PageHeading';
import { Card } from '../components/ui/Card';
import { EntityLink } from '../components/ui/EntityLink';

export function ChooseLocation({
  onSelect,
}: {
  onSelect: (locationId: string) => void;
}) {
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
          {LOCATIONS.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => onSelect(location.id)}
            className="flex w-full items-center gap-3 px-4 py-4 text-left hover:bg-surface-subtle"
          >
            <LocationMarker location={location} />
            <span className="min-w-0 flex-1">
              <EntityLink as="span" className="block">{location.name}</EntityLink>
              <span className="block text-sm text-text-secondary">
                {location.suburb}, {location.state}
              </span>
            </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-text-tertiary" />
            </button>
          ))}
        </Card>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
