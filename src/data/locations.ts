import { addDays, startOfDay } from '../lib/date.ts';

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
  'Priya N',
  'Tom W',
  'Aisha K',
  'Daniel F',
  'Mei L',
  'Chris B',
];

/** Regulars a CPA SIL house would typically book with (core plus casuals). */
const WORKERS_PER_LOCATION = [14, 11, 15, 13, 16];

/** Daytime shifts before the overnight sleepover. 24/7 houses run 2–4 overlapping day staff. */
const DAYTIME_COUNTS = [4, 2, 4, 3, 4];

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

const DAYTIME_SHIFTS: Record<number, { hour: number; minutes: number; hours: number }[]> = {
  2: [
    { hour: 7, minutes: 0, hours: 9 },
    { hour: 16, minutes: 0, hours: 6 },
  ],
  3: [
    { hour: 7, minutes: 0, hours: 8 },
    { hour: 15, minutes: 0, hours: 6 },
    { hour: 15, minutes: 30, hours: 6 },
  ],
  4: [
    { hour: 7, minutes: 0, hours: 8 },
    { hour: 7, minutes: 30, hours: 8 },
    { hour: 15, minutes: 0, hours: 6 },
    { hour: 15, minutes: 0, hours: 6 },
  ],
};

function pickWorker(roster: string[], used: Set<string>, random: () => number): string {
  const available = roster.filter((name) => !used.has(name));
  const pool = available.length > 0 ? available : roster;
  const coreEnd = Math.max(1, Math.ceil(pool.length * 0.6));
  const slice = random() < 0.72 ? pool.slice(0, coreEnd) : pool;
  return slice[Math.floor(random() * slice.length)];
}

function statusFor(offset: number, end: Date, now: Date, random: () => number): BookingStatus {
  if (offset < 0 || (offset === 0 && end < now)) return 'ended';
  return random() < 0.1 ? 'requested' : 'confirmed';
}

function buildBookings(location: Location, locationIndex: number, roster: string[]): Booking[] {
  const random = seededRandom(4801 + locationIndex * 977);
  const today = startOfDay(new Date());
  const now = new Date();
  const bookings: Booking[] = [];
  const daytime = DAYTIME_SHIFTS[DAYTIME_COUNTS[locationIndex]];

  for (let offset = -14; offset <= 27; offset += 1) {
    const day = addDays(today, offset);
    const used = new Set<string>();
    let slot = 0;

    for (const shift of daytime) {
      const workerName = pickWorker(roster, used, random);
      used.add(workerName);
      const start = at(day, shift.hour, shift.minutes);
      const end = new Date(start.getTime() + shift.hours * 3600 * 1000);

      bookings.push({
        id: `${location.id}-${offset}-${slot}`,
        locationId: location.id,
        workerName,
        start,
        end,
        status: statusFor(offset, end, now, random),
        sleepover: false,
        createdByMe: random() < 0.7,
      });
      slot += 1;
    }

    const sleepoverWorker = pickWorker(roster, used, random);
    const sleepoverStart = at(day, 21, 0);
    const sleepoverEnd = at(addDays(day, 1), 7, 0);

    bookings.push({
      id: `${location.id}-${offset}-${slot}`,
      locationId: location.id,
      workerName: sleepoverWorker,
      start: sleepoverStart,
      end: sleepoverEnd,
      status: statusFor(offset, sleepoverEnd, now, random),
      sleepover: true,
      createdByMe: random() < 0.7,
    });
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
