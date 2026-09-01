import { LOCATIONS, getLocationData, type LocationData } from './locations.ts';
import { addDays, startOfDay } from '../lib/date.ts';

export type ChatMessage = {
  id: string;
  from: 'provider' | 'worker';
  text: string;
};

export type Conversation = {
  id: string;
  workerName: string;
  locationId: string;
  locationName: string;
  preview: string;
  at: Date;
  unread: number;
  messages: ChatMessage[];
};

const WORKER_REPLIES = [
  'Yes I can do that shift.',
  'Hi',
  'This is a response from a worker',
  'I am available next week.',
  'Yes 😎',
];

const PROVIDER_NOTES = [
  'Hello, are you available to cover a shift this week?',
  "I'd love to know more about your availability.",
  'Thank you for assisting us with last week’s bookings.',
  'What is your availability for shifts next week?',
  'Booking confirmed',
  'hey',
];

function previewFor(last: ChatMessage): string {
  if (last.from === 'provider') {
    const clipped = last.text.length > 38 ? `${last.text.slice(0, 38).trim()}...` : last.text;
    return `You: ${clipped}`;
  }
  return last.text.length > 42 ? `${last.text.slice(0, 42).trim()}...` : last.text;
}

/**
 * Messages sits in the universal nav, so the list spans every location. Dates
 * are spread by an interleaved index rather than a per-location one, so the top
 * of the list mixes locations instead of showing one location at a time.
 */
function buildForLocation(data: LocationData, locationIndex: number): Conversation[] {
  const today = startOfDay(new Date());
  const workers = [...data.workers].sort((a, b) => a.name.localeCompare(b.name));

  const conversations = workers
    .map((worker, index) => {
      const interleaved = index * LOCATIONS.length + locationIndex;
      const at = addDays(today, -(4 + interleaved * 2));
      at.setHours(14, 20 + (index % 6) * 5, 0, 0);

      const outgoing = PROVIDER_NOTES[index % PROVIDER_NOTES.length];
      const incoming = WORKER_REPLIES[index % WORKER_REPLIES.length];
      const messages: ChatMessage[] = [
        { id: `${worker.id}-1`, from: 'provider', text: outgoing },
        { id: `${worker.id}-2`, from: 'worker', text: incoming },
      ];

      if (index % 3 === 0) {
        messages.push({ id: `${worker.id}-3`, from: 'provider', text: 'Thanks, that helps.' });
      }

      const last = messages[messages.length - 1];

      return {
        id: worker.id,
        workerName: worker.name,
        locationId: data.location.id,
        locationName: data.location.name,
        preview: previewFor(last),
        at,
        unread: 0,
        messages,
      };
    })
    .sort((a, b) => b.at.getTime() - a.at.getTime());

  let unreadLeft = data.unreadMessages;
  for (const conversation of conversations) {
    if (unreadLeft <= 0) break;
    conversation.unread = 1;
    unreadLeft -= 1;
  }

  return conversations;
}

export function buildAllConversations(): Conversation[] {
  return LOCATIONS.flatMap((location, locationIndex) =>
    buildForLocation(getLocationData(location.id), locationIndex),
  ).sort((a, b) => b.at.getTime() - a.at.getTime());
}

export function totalUnreadMessages(): number {
  return LOCATIONS.reduce(
    (sum, location) => sum + getLocationData(location.id).unreadMessages,
    0,
  );
}
