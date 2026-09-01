import { addDays, startOfDay } from '../lib/date';

export type BookingStatus = 'confirmed' | 'requested' | 'ended';

export type Location = {
  id: string;
  name: string;
  suburb: string;
  state: string;
};

export type Worker = {
  id: string;
  name: string;
  bookingCount: number;
  planConfirmed: boolean;
};

export type Booking = {
  id: string;
  locationId: string;
  workerName: string;
  start: Date;
  end: Date;
  status: BookingStatus;
  sleepover: boolean;
  createdByMe: boolean;
};

export type LocationData = {
  location: Location;
  workers: Worker[];
  bookings: Booking[];
  requestsToAccept: number;
  bookingsToApprove: number;
  plansToReview: number;
  unreadMessages: number;
};

export const LOCATIONS: Location[] = [
  { id: 'dee-why-1', name: 'Dee Why 1', suburb: 'Dee Why', state: 'NSW' },
  { id: 'galston-1', name: 'Galston 1', suburb: 'Galston', state: 'NSW' },
  { id: 'hornsby', name: 'Hornsby', suburb: 'Hornsby', state: 'NSW' },
  { id: 'north-ryde-1', name: 'North Ryde 1', suburb: 'North Ryde', state: 'NSW' },
  { id: 'wahroonga', name: 'Wahroonga', suburb: 'Wahroonga', state: 'NSW' },
];

const WORKER_POOL = [
  'Eleni P',
  'Angela O',
  'Maxine R',
  'Erica O',
  'Scarlett O',
  'Mandii Z',
  'Geoffrey L',
  'Brian R',
  'Charlies K',
  'Ira J',
  'Ginger N',
  'Han Hendrick P',
  'John M',
  'Pete C',
  'Sally M',
  'Venessa S',
];

const WORKERS_PER_LOCATION = [9, 7, 8, 6, 10];

/** Seeded so the placeholder roster and shifts stay identical between reloads. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function at(day: Date, hours: number, minutes: number): Date {
  const d = startOfDay(day);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function rosterFor(locationIndex: number): string[] {
  const size = WORKERS_PER_LOCATION[locationIndex];
  const names: string[] = [];
  for (let i = 0; i < size; i += 1) {
    names.push(WORKER_POOL[(locationIndex * 3 + i) % WORKER_POOL.length]);
  }
  return names;
}

const SHIFTS_PER_DAY = [0, 1, 1, 2, 2, 2, 3];
const START_MINUTES = [0, 0, 30, 45];

function buildBookings(location: Location, locationIndex: number, roster: string[]): Booking[] {
  const random = seededRandom(4801 + locationIndex * 977);
  const today = startOfDay(new Date());
  const now = new Date();
  const bookings: Booking[] = [];

  for (let offset = -14; offset <= 27; offset += 1) {
    const day = addDays(today, offset);
    const drawn = SHIFTS_PER_DAY[Math.floor(random() * SHIFTS_PER_DAY.length)];
    // Today always has shifts so the "Today" column is never blank during testing.
    // Yesterday always has one so the week shows a completed shift, unless today is
    // Monday, when no earlier day falls inside the displayed week.
    const guaranteesEndedShift = offset === -1 && today.getDay() !== 1;
    const count =
      offset === 0 ? Math.max(drawn, 2) : guaranteesEndedShift ? Math.max(drawn, 1) : drawn;

    for (let i = 0; i < count; i += 1) {
      const workerName = roster[Math.floor(random() * roster.length)];
      const sleepover = random() < 0.18;

      let start: Date;
      let end: Date;
      if (sleepover) {
        start = at(day, 19 + Math.floor(random() * 2), 0);
        end = at(addDays(day, 1), 7, 0);
      } else {
        start = at(day, 6 + Math.floor(random() * 10), START_MINUTES[Math.floor(random() * 4)]);
        end = new Date(start.getTime() + (2 + Math.floor(random() * 7)) * 3600 * 1000);
      }

      let status: BookingStatus;
      if (offset < 0 || (offset === 0 && end < now)) {
        status = 'ended';
      } else {
        status = random() < 0.25 ? 'requested' : 'confirmed';
      }

      bookings.push({
        id: `${location.id}-${offset}-${i}`,
        locationId: location.id,
        workerName,
        start,
        end,
        status,
        sleepover,
        createdByMe: random() < 0.7,
      });
    }
  }

  return bookings.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function buildLocationData(location: Location, locationIndex: number): LocationData {
  const roster = rosterFor(locationIndex);
  const bookings = buildBookings(location, locationIndex, roster);
  const today = startOfDay(new Date());

  const counts = new Map<string, number>();
  roster.forEach((name) => counts.set(name, 0));
  bookings.forEach((booking) => {
    counts.set(booking.workerName, (counts.get(booking.workerName) ?? 0) + 1);
  });

  const workers: Worker[] = roster
    .map((name, index) => ({
      id: `${location.id}-worker-${index}`,
      name,
      bookingCount: counts.get(name) ?? 0,
      planConfirmed: (locationIndex + index) % 3 !== 0,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount || a.name.localeCompare(b.name));

  const endedRecently = bookings.filter(
    (booking) => booking.status === 'ended' && booking.start >= addDays(today, -7),
  );

  return {
    location,
    workers,
    bookings,
    requestsToAccept: bookings.filter((b) => b.status === 'requested' && b.start >= today).length,
    bookingsToApprove: endedRecently.filter((_, index) => index % 3 === 0).length,
    plansToReview: workers.filter((worker) => !worker.planConfirmed).length,
    unreadMessages: (locationIndex % 3) + 1,
  };
}

const cache = new Map<string, LocationData>();

export function getLocationData(locationId: string): LocationData {
  const cached = cache.get(locationId);
  if (cached) return cached;

  const locationIndex = Math.max(
    0,
    LOCATIONS.findIndex((location) => location.id === locationId),
  );
  const data = buildLocationData(LOCATIONS[locationIndex], locationIndex);
  cache.set(locationId, data);
  return data;
}

export function findLocation(locationId: string | null): Location | null {
  if (!locationId) return null;
  return LOCATIONS.find((location) => location.id === locationId) ?? null;
}
