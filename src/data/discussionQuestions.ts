export type DiscussionQuestion = {
  id: string;
  page: string;
  type: 'general' | 'element';
  text: string;
  elementHint?: string;
};

export const DISCUSSION_QUESTIONS: DiscussionQuestion[] = [
  {
    id: 'question-1',
    page: '/',
    type: 'general',
    text: 'What do you expect to find on this dashboard?',
  },
  {
    id: 'question-2',
    page: '/',
    type: 'general',
    text: 'How do you keep track of upcoming bookings today?',
  },
  {
    id: 'question-3',
    page: '/',
    type: 'general',
    text: 'What would you do if a booking needed attention?',
  },
  {
    id: 'question-4',
    page: '/',
    type: 'general',
    text: 'Is anything missing for managing this location?',
  },
  {
    id: 'bookings-general',
    page: '/bookings',
    type: 'general',
    text: 'How do you currently find a booking you need to manage?',
  },
  {
    id: 'request-general',
    page: '/request-booking',
    type: 'general',
    text: 'Talk me through how you would request a booking for this location.',
  },
  {
    id: 'notifications-general',
    page: '/notifications',
    type: 'general',
    text: 'What would you expect to be notified about here?',
  },
  {
    id: 'messages-general',
    page: '/messages',
    type: 'general',
    text: 'How do messages fit into the way you coordinate workers?',
  },
  {
    id: 'settings-general',
    page: '/manage-location',
    type: 'general',
    text: 'What would you expect to manage for this location?',
  },
  {
    id: 'organisation-general',
    page: '/organisation-settings',
    type: 'general',
    text: 'What would you expect to manage for the organisation rather than a location?',
  },
  {
    id: 'dashboard-attention',
    page: '/',
    type: 'element',
    text: 'Which of these updates would you look at first, and why?',
    elementHint: 'notification summary cards',
  },
  {
    id: 'dashboard-week',
    page: '/',
    type: 'element',
    text: 'Does this weekly view match how you monitor booking coverage?',
    elementHint: 'weekly bookings grid',
  },
  {
    id: 'dashboard-worker-order',
    page: '/',
    type: 'element',
    text: 'What would you expect to determine the order of workers in this list?',
    elementHint: 'worker list sort order',
  },
  {
    id: 'bookings-status',
    page: '/bookings',
    type: 'element',
    text: 'Do these booking groups match how you think about the work?',
    elementHint: 'booking status navigation',
  },
  {
    id: 'bookings-filters',
    page: '/bookings',
    type: 'element',
    text: 'Which filters would you use to find a booking?',
    elementHint: 'booking filters',
  },
  {
    id: 'request-location',
    page: '/request-booking',
    type: 'element',
    text: 'Is it clear which location this booking will belong to?',
    elementHint: 'location dropdown',
  },
  {
    id: 'request-frequency',
    page: '/request-booking',
    type: 'element',
    text: 'Do these frequency options match the bookings you usually create?',
    elementHint: 'frequency radios',
  },
  {
    id: 'request-workers',
    page: '/request-booking',
    type: 'element',
    text: 'How would you decide which workers should receive this request?',
    elementHint: 'worker selection list',
  },
  {
    id: 'notifications-list',
    page: '/notifications',
    type: 'element',
    text: 'Is it clear which notifications need you to take action?',
    elementHint: 'notification list',
  },
  {
    id: 'messages-conversations',
    page: '/messages',
    type: 'element',
    text: 'How would you find the worker or conversation you need?',
    elementHint: 'conversation list and search',
  },
  {
    id: 'settings-sections',
    page: '/manage-location',
    type: 'element',
    text: 'Do these sections match what you would expect to manage for a location?',
    elementHint: 'settings section navigation',
  },
  {
    id: 'access-context',
    page: '/organisation-settings',
    type: 'element',
    text: 'How would you expect to move between locations and organisation settings?',
    elementHint: 'location and organisation access',
  },
];

export function questionById(id: string): DiscussionQuestion | undefined {
  return DISCUSSION_QUESTIONS.find((question) => question.id === id);
}

export function questionsForPage(
  page: string,
  type?: DiscussionQuestion['type'],
): DiscussionQuestion[] {
  return DISCUSSION_QUESTIONS.filter(
    (question) => question.page === page && (!type || question.type === type),
  );
}
