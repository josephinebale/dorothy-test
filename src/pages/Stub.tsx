import type { Location } from '../data/locations';
import { PageHeading } from '../components/PageHeading';
import { Card } from '../components/ui/Card';

export const STUB_TITLES: Record<string, string> = {
  '/profile': 'Profile',
  '/support-plan': 'Support plan',
  '/report-incident': 'Report incident',
  '/knowledge-hub': 'Knowledge hub',
  '/invoices': 'Invoices',
  '/help-centre': 'Help centre',
  '/contact': 'Contact us',
  '/terms': 'Terms of use',
  '/privacy': 'Privacy policy',
  '/request-booking': 'Request booking',
};

type StubProps = {
  title: string;
  location: Location;
};

export function Stub({ title, location }: StubProps) {
  return (
    <div className="width-main-column">
      <PageHeading title={title} />
      <Card className="p-6">
        <p className="max-w-content text-sm text-text-strong">
          Placeholder page for {location.name}. This section is not built in this prototype, it is here
          so the structure can be navigated end to end.
        </p>
      </Card>
    </div>
  );
}
