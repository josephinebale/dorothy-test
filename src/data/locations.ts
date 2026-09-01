import { addDays, startOfDay, startOfWeek } from '../lib/date.ts';

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
  requestedWorkerNames?: string[];
  start: Date;
  end: Date;
  status: BookingStatus;
  sleepover: boolean;
  createdByMe: boolean;
  address?: string;
  description?: string;
  driving?: 'not-required' | 'worker-vehicle' | 'location-vehicle';
  financeReference?: string;
  frequency?: 'one-off' | 'weekly' | 'fortnightly';
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

/**
 * Daytime shifts before the overnight sleepover. A real 24/7 house runs 2–4
 * overlapping day staff, but a full roster makes the dashboard week unreadable
 * in a session, so the prototype shows a lighter day: one or two day shifts plus
 * the overnight, which also keeps every day inside the grid without an expander.
 */
const DAYTIME_COUNTS = [2, 1, 2, 2, 2];

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
  1: [{ hour: 7, minutes: 0, hours: 14 }],
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

/**
 * Day staffing moves around the base level, so the week reads as a roster rather
 * than a wall of identical columns. The busiest day is three day shifts plus the
 * overnight, which still fits the dashboard grid without an expander.
 */
function daytimeCountFor(locationIndex: number, random: () => number): number {
  const base = DAYTIME_COUNTS[locationIndex];
  const roll = random();
  if (roll < 0.2) return Math.max(1, base - 1);
  if (roll < 0.65) return base;
  return Math.min(3, base + 1);
}

function pickWorker(roster: string[], used: Set<string>, random: () => number): string {
  const available = roster.filter((name) => !used.has(name));
  const pool = available.length > 0 ? available : roster;
  const coreEnd = Math.max(1, Math.ceil(pool.length * 0.6));
  const slice = random() < 0.72 ? pool.slice(0, coreEnd) : pool;
  return slice[Math.floor(random() * slice.length)];
}

function statusFor(offset: number, end: Date, now: Date): BookingStatus {
  if (offset < 0 || (offset === 0 && end < now)) return 'ended';
  return 'confirmed';
}

const MAX_REQUESTED_PER_WEEK = 3;

/* Requested cards tint the week, but one per day reads as noise. Cap at three
   a week, on different days, so the calendar still shows a decision waiting
   without filling every column. */
function assignRequested(bookings: Booking[], random: () => number): void {
  const byWeek = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const key = startOfWeek(booking.start).toISOString();
    const week = byWeek.get(key) ?? [];
    week.push(booking);
    byWeek.set(key, week);
  }

  for (const week of byWeek.values()) {
    const byDay = new Map<string, Booking[]>();
    for (const booking of week) {
      const key = startOfDay(booking.start).toISOString();
      const day = byDay.get(key) ?? [];
      day.push(booking);
      byDay.set(key, day);
    }

    const days = [...byDay.keys()];
    for (let i = days.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      const swap = days[i];
      days[i] = days[j];
      days[j] = swap;
    }

    for (const day of days.slice(0, Math.min(MAX_REQUESTED_PER_WEEK, days.length))) {
      const pool = byDay.get(day) ?? [];
      const confirmed = pool.filter((booking) => booking.status === 'confirmed');
      const pickFrom = confirmed.length > 0 ? confirmed : pool;
      pickFrom[Math.floor(random() * pickFrom.length)].status = 'requested';
    }
  }
}

function buildBookings(location: Location, locationIndex: number, roster: string[]): Booking[] {
  const random = seededRandom(4801 + locationIndex * 977);
  const today = startOfDay(new Date());
  const now = new Date();
  const bookings: Booking[] = [];

  for (let offset = -14; offset <= 27; offset += 1) {
    const day = addDays(today, offset);
    const daytime = DAYTIME_SHIFTS[daytimeCountFor(locationIndex, random)];
    const used = new Set<string>();
    const dayBookings: Booking[] = [];
    let slot = 0;

    for (const shift of daytime) {
      const workerName = pickWorker(roster, used, random);
      used.add(workerName);
      const start = at(day, shift.hour, shift.minutes);
      const end = new Date(start.getTime() + shift.hours * 3600 * 1000);

      dayBookings.push({
        id: `${location.id}-${offset}-${slot}`,
        locationId: location.id,
        workerName,
        start,
        end,
        status: statusFor(offset, end, now),
        sleepover: false,
        createdByMe: random() < 0.7,
      });
      slot += 1;
    }

    const sleepoverWorker = pickWorker(roster, used, random);
    const sleepoverStart = at(day, 21, 0);
    const sleepoverEnd = at(addDays(day, 1), 7, 0);

    dayBookings.push({
      id: `${location.id}-${offset}-${slot}`,
      locationId: location.id,
      workerName: sleepoverWorker,
      start: sleepoverStart,
      end: sleepoverEnd,
      status: statusFor(offset, sleepoverEnd, now),
      sleepover: true,
      createdByMe: random() < 0.7,
    });

    bookings.push(...dayBookings);
  }

  assignRequested(bookings, random);
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

/** Messages spans locations, so a worker link can point outside the current one. */
export function findWorker(
  workerId: string | null,
): { worker: Worker; location: Location; index: number } | null {
  if (!workerId) return null;

  for (const location of LOCATIONS) {
    const data = getLocationData(location.id);
    const index = data.workers.findIndex((worker) => worker.id === workerId);
    if (index >= 0) return { worker: data.workers[index], location, index };
  }

  return null;
}

export function findLocation(locationId: string | null): Location | null {
  if (!locationId) return null;
  return LOCATIONS.find((location) => location.id === locationId) ?? null;
}
