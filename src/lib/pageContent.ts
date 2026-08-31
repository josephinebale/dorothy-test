export const TEAM_ROUTE = '/team';

export const NOTIFICATION_EMPTY_DESCRIPTIONS = {
  requests: "We'll let you know when a booking request needs your attention.",
  approvals: "We'll let you know when a booking needs your approval.",
  applicants: "We'll let you know when a worker applies.",
} as const;

export const EMPTY_STATES = {
  bookingsWeek: {
    title: 'No bookings this week',
    description: 'Bookings scheduled for this week will appear here.',
  },
  team: {
    title: 'No team members to show',
    description: 'Team members booked for this house will appear here.',
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
    description: 'Team members will appear after they’re booked for this house.',
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

export function financeReference(house: string, worker: string) {
  return [
    { label: 'House', value: house },
    { label: 'Worker', value: worker },
  ];
}
