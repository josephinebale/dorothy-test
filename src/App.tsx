import { useCallback, useState } from 'react';
import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { SessionQuestions } from './components/SessionQuestions';
import { totalUnreadMessages } from './data/conversations';
import { findLocation, getLocationData, type Booking } from './data/locations';
import { ROUTES } from './lib/informationArchitecture';
import {
  LOCATION_PROFILE_PREVIEW_ROUTE,
  clearLocationProfiles,
} from './lib/locationProfiles';
import {
  BOOKING_DETAIL_ROUTE,
  TEAM_ROUTE,
  bookingViewFromPath,
  workerIdFromPath,
} from './lib/pageContent';
import { navigate, useHashRoute } from './lib/router';
import {
  clearLastLocationId,
  clearSession,
  readLastLocationId,
  readPrototypeStarted,
  readSignedIn,
  writeLastLocationId,
  writePrototypeStarted,
  writeSignedIn,
} from './lib/session';
import { ChooseLocation } from './pages/ChooseLocation';
import { Dashboard } from './pages/Dashboard';
import { Bookings } from './pages/Bookings';
import { BookingRequest } from './pages/BookingRequest';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { LocationProfilePreview } from './pages/LocationProfilePreview';
import { PageVariantToggle } from './components/PageVariantToggle';
import { PrototypeStart } from './pages/PrototypeStart';
import {
  ManageLocationSettings,
  OrganisationSettings,
  YourAccountSettings,
} from './pages/Settings';
import { SignedOut } from './pages/SignedOut';
import { STUB_TITLES, Stub } from './pages/Stub';
import { Team } from './pages/Team';
import { WorkerProfile } from './pages/WorkerProfile';

export default function App() {
  const path = useHashRoute();
  const [started, setStarted] = useState(readPrototypeStarted);
  const [signedIn, setSignedIn] = useState(readSignedIn);
  const [locationId, setLocationId] = useState<string | null>(
    () => findLocation(readLastLocationId())?.id ?? null,
  );
  const [unreadOverride, setUnreadOverride] = useState<number | null>(null);
  const [pageVariant, setPageVariant] = useState(false);
  const [createdBookings, setCreatedBookings] = useState<Booking[]>([]);

  const selectLocation = useCallback((nextLocationId: string) => {
    writeLastLocationId(nextLocationId);
    setLocationId(nextLocationId);
    setUnreadOverride(null);
  }, []);

  const onUnreadChange = useCallback((count: number) => {
    setUnreadOverride(count);
  }, []);

  /* Between participants: drop everything the last session wrote, so the run
     starts where no location has been chosen. The moderator's annotation
     preference is deliberately left alone. */
  const restart = useCallback(() => {
    clearSession();
    clearLocationProfiles();
    setStarted(false);
    setSignedIn(readSignedIn());
    setLocationId(null);
    setCreatedBookings([]);
    setUnreadOverride(null);
    setPageVariant(false);
    navigate('/');
  }, []);

  const signOut = useCallback(() => {
    writeSignedIn(false);
    setSignedIn(false);
  }, []);

  if (!started) {
    return (
      <PrototypeStart
        onStart={() => {
          clearLastLocationId();
          writePrototypeStarted(true);
          writeSignedIn(true);
          setLocationId(null);
          setSignedIn(true);
          setStarted(true);
          navigate('/');
        }}
      />
    );
  }

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
  const createdForLocation = createdBookings.filter(
    (booking) => booking.locationId === locationId,
  );
  const visibleData = {
    ...data,
    bookings: [...createdForLocation, ...data.bookings],
    requestsToAccept: data.requestsToAccept + createdForLocation.length,
  };
  const stubTitle = STUB_TITLES[path];

  return (
    <div className="relative flex min-h-screen flex-col">
      <AppHeader
        location={visibleData.location}
        path={path}
        unreadMessages={unreadOverride ?? totalUnreadMessages()}
        bookingsBadge={visibleData.bookingsToApprove}
        unreadNotifications={
          [
            unreadOverride ?? visibleData.unreadMessages,
            visibleData.requestsToAccept,
            visibleData.bookingsToApprove,
            visibleData.plansToReview,
          ].filter((count) => count > 0).length
        }
        onSelectLocation={selectLocation}
        onSignOut={signOut}
      />

      <div className="relative flex flex-1 flex-col">
        <main className="mx-auto w-full max-w-page flex-1 px-8 pt-8 pb-4">
          {path === '/request-booking' ||
          path.startsWith('/bookings/request/') ||
          path.startsWith(BOOKING_DETAIL_ROUTE) ? (
            <BookingRequest
              path={path}
              data={visibleData}
              onSelectLocation={selectLocation}
              onCreateBooking={(booking) => {
                setCreatedBookings((current) => [booking, ...current]);
              }}
              workerDetail={pageVariant}
            />
          ) : path === '/bookings' || bookingViewFromPath(path) ? (
            <Bookings data={visibleData} view={bookingViewFromPath(path) ?? 'confirmed'} />
          ) : path === TEAM_ROUTE ? (
            <Team data={visibleData} />
          ) : path.startsWith(`${TEAM_ROUTE}/`) ? (
            <WorkerProfile data={visibleData} workerId={workerIdFromPath(path)} />
          ) : path === '/messages' ? (
            <Messages onUnreadChange={onUnreadChange} />
          ) : path === '/notifications' ? (
            <Notifications data={visibleData} />
          ) : path === LOCATION_PROFILE_PREVIEW_ROUTE ? (
            <LocationProfilePreview data={visibleData} />
          ) : path.startsWith(ROUTES.manageLocation) ? (
            <ManageLocationSettings data={visibleData} path={path} />
          ) : path.startsWith(ROUTES.organisationSettings) ? (
            <OrganisationSettings data={visibleData} path={path} />
          ) : path.startsWith(ROUTES.yourAccount) || path === '/settings' ? (
            <YourAccountSettings path={path} />
          ) : stubTitle ? (
            <Stub title={stubTitle} location={visibleData.location} />
          ) : (
            <Dashboard data={visibleData} />
          )}
        </main>

        <PageVariantToggle
          path={path}
          active={pageVariant}
          onToggle={() => setPageVariant(!pageVariant)}
        />

        <SessionQuestions onRestart={restart} />
      </div>

      <AppFooter />
    </div>
  );
}
