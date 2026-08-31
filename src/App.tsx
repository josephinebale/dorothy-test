import { useCallback, useState } from 'react';
import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { SessionQuestions } from './components/SessionQuestions';
import { getHouseData } from './data/houses';
import { findHouse } from './data/houses';
import { ROUTES } from './lib/informationArchitecture';
import { TEAM_ROUTE } from './lib/pageContent';
import { navigate, useHashRoute } from './lib/router';
import {
  clearLastHouseId,
  readLastHouseId,
  readSignedIn,
  writeLastHouseId,
  writeSignedIn,
} from './lib/session';
import { ChooseHouse } from './pages/ChooseHouse';
import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import {
  ManageHouseSettings,
  OrganisationSettings,
  YourAccountSettings,
} from './pages/Settings';
import { SignedOut } from './pages/SignedOut';
import { STUB_TITLES, Stub } from './pages/Stub';
import { Team } from './pages/Team';

export default function App() {
  const path = useHashRoute();
  const [signedIn, setSignedIn] = useState(readSignedIn);
  const [houseId, setHouseId] = useState<string | null>(() => findHouse(readLastHouseId())?.id ?? null);
  const [unreadOverride, setUnreadOverride] = useState<number | null>(null);

  const selectHouse = useCallback((nextHouseId: string) => {
    writeLastHouseId(nextHouseId);
    setHouseId(nextHouseId);
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
        lastHouseId={houseId}
        onSignInAsReturning={() => {
          writeSignedIn(true);
          setSignedIn(true);
          navigate('/');
        }}
        onSignInAsNewUser={() => {
          clearLastHouseId();
          writeSignedIn(true);
          setHouseId(null);
          setSignedIn(true);
          navigate('/');
        }}
      />
    );
  }

  if (!houseId) {
    return (
      <ChooseHouse
        onSelect={(nextHouseId) => {
          selectHouse(nextHouseId);
          navigate('/');
        }}
      />
    );
  }

  const data = getHouseData(houseId);
  const stubTitle = STUB_TITLES[path];

  return (
    <div className="relative flex min-h-screen flex-col">
      <AppHeader
        house={data.house}
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
        onSelectHouse={selectHouse}
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
          ) : path.startsWith(ROUTES.manageHouse) ? (
            <ManageHouseSettings data={data} path={path} />
          ) : path.startsWith(ROUTES.organisationSettings) ? (
            <OrganisationSettings data={data} path={path} />
          ) : path.startsWith(ROUTES.yourAccount) || path === '/settings' ? (
            <YourAccountSettings path={path} />
          ) : stubTitle ? (
            <Stub title={stubTitle} house={data.house} />
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
