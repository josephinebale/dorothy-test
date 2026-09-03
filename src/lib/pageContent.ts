export const TEAM_ROUTE = '/team';

export function workerProfilePath(workerId: string): string {
  return `${TEAM_ROUTE}/${workerId}`;
}

export function workerIdFromPath(path: string): string | null {
  if (!path.startsWith(`${TEAM_ROUTE}/`)) return null;
  return path.slice(TEAM_ROUTE.length + 1) || null;
}

export const BOOKINGS_ROUTE = '/bookings';

/** Each rail status is addressable, so a notification can open the right one. */
export const BOOKING_VIEW_IDS = [
  'requested',
  'confirmed',
  'waiting',
  'approve',
  'next-invoice',
  'invoiced',
] as const;

export type BookingViewId = (typeof BOOKING_VIEW_IDS)[number];

export function bookingsViewPath(view: BookingViewId): string {
  return `${BOOKINGS_ROUTE}/${view}`;
}

export function bookingViewFromPath(path: string): BookingViewId | null {
  if (!path.startsWith(`${BOOKINGS_ROUTE}/`)) return null;
  const candidate = path.slice(BOOKINGS_ROUTE.length + 1);
  return BOOKING_VIEW_IDS.find((view) => view === candidate) ?? null;
}

export const NOTIFICATION_EMPTY_DESCRIPTIONS = {
  requests: "We'll let you know when a booking request needs your attention.",
  approvals: "We'll let you know when a booking needs your approval.",
  messages: "We'll let you know when you have a new message.",
} as const;

export const EMPTY_STATES = {
  bookingsWeek: {
    title: 'No bookings this week',
    description: 'Bookings scheduled for this week will appear here.',
  },
  team: {
    title: 'No team members to show',
    description: 'Team members booked for this location will appear here.',
  },
  notifications: {
    title: 'No notifications',
    description: 'New notifications will appear here.',
  },
  conversations: {
    title: 'No conversations found',
    description: 'Try a different name or message.',
  },
  bookingsFiltered: {
    title: 'No bookings to show',
    description: 'Bookings will appear when they match this status and your filters.',
  },
  dashboardTeam: {
    title: 'No team members yet',
    description: 'Team members will appear after they’re booked for this location.',
  },
  archivedConversations: {
    title: 'No archived conversations',
    description: 'Archived conversations will appear here.',
  },
  conversationSelection: {
    title: 'No conversation selected',
    description: 'Select a conversation to display it here.',
  },
} as const;
