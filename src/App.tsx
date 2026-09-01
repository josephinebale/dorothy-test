import { useCallback, useState } from 'react';
import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { SessionQuestions } from './components/SessionQuestions';
import { findLocation, getLocationData } from './data/locations';
import { ROUTES } from './lib/informationArchitecture';
import { TEAM_ROUTE } from './lib/pageContent';
import { navigate, useHashRoute } from './lib/router';
import {
  clearLastLocationId,
  readLastLocationId,
  readSignedIn,
  writeLastLocationId,
  writeSignedIn,
} from './lib/session';
import { ChooseLocation } from './pages/ChooseLocation';
import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import {
  ManageLocationSettings,
  OrganisationSettings,
  YourAccountSettings,
} from './pages/Settings';
import { SignedOut } from './pages/SignedOut';
import { STUB_TITLES, Stub } from './pages/Stub';
import { Team } from './pages/Team';

export default function App() {
  const path = useHashRoute();
  const [signedIn, setSignedIn] = useState(readSignedIn);
  const [locationId, setLocationId] = useState<string | null>(
    () => findLocation(readLastLocationId())?.id ?? null,
  );
  const [unreadOverride, setUnreadOverride] = useState<number | null>(null);

  const selectLocation = useCallback((nextLocationId: string) => {
    writeLastLocationId(nextLocationId);
    setLocationId(nextLocationId);
    setUnreadOverride(null);
  }, []);

  const onUnreadChange = useCallback((count: number) => {
    setUnreadOverride(count);
  }, []);

  const signOut = useCallback(() => {
    writeSignedIn(false);
    setSignedIn(false);
  }, []);

  if (!signedIn) {
    return (
      <SignedOut
        lastLocationId={locationId}
        onSignInAsReturning={() => {
          writeSignedIn(true);
          setSignedIn(true);
          navigate('/');
        }}
        onSignInAsNewUser={() => {
          clearLastLocationId();
          writeSignedIn(true);
          setLocationId(null);
          setSignedIn(true);
          navigate('/');
        }}
      />
    );
  }

  if (!locationId) {
    return (
      <ChooseLocation
        onSelect={(nextLocationId) => {
          selectLocation(nextLocationId);
          navigate('/');
        }}
      />
    );
  }

  const data = getLocationData(locationId);
  const stubTitle = STUB_TITLES[path];

  return (
    <div className="relative flex min-h-screen flex-col">
      <AppHeader
        location={data.location}
        path={path}
        unreadMessages={unreadOverride ?? data.unreadMessages}
        bookingsBadge={data.bookingsToApprove}
        unreadNotifications={
          [
            unreadOverride ?? data.unreadMessages,
            data.requestsToAccept,
            data.bookingsToApprove,
            data.plansToReview,
          ].filter((count) => count > 0).length
        }
        onSelectLocation={selectLocation}
        onSignOut={signOut}
      />

      <div className="relative flex flex-1 flex-col">
        <main className="mx-auto w-full max-w-page flex-1 px-8 pt-8 pb-4">
          {path === '/bookings' ? (
            <Bookings data={data} />
          ) : path === TEAM_ROUTE ? (
            <Team data={data} />
          ) : path === '/messages' ? (
            <Messages data={data} onUnreadChange={onUnreadChange} />
          ) : path === '/notifications' ? (
            <Notifications data={data} />
          ) : path.startsWith(ROUTES.manageLocation) ? (
            <ManageLocationSettings data={data} path={path} />
          ) : path.startsWith(ROUTES.organisationSettings) ? (
            <OrganisationSettings data={data} path={path} />
          ) : path.startsWith(ROUTES.yourAccount) || path === '/settings' ? (
            <YourAccountSettings path={path} />
          ) : stubTitle ? (
            <Stub title={stubTitle} location={data.location} />
          ) : (
            <Dashboard data={data} />
          )}
        </main>

        <SessionQuestions path={path} />
      </div>

      <AppFooter />
    </div>
  );
}
