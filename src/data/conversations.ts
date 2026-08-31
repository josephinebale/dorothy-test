import type { HouseData } from './houses';
import { addDays, startOfDay } from '../lib/date';

export type ChatMessage = {
  id: string;
  from: 'provider' | 'worker';
  text: string;
};

export type Conversation = {
  id: string;
  workerName: string;
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

export function buildConversations(data: HouseData): Conversation[] {
  const today = startOfDay(new Date());
  const workers = [...data.workers].sort((a, b) => a.name.localeCompare(b.name));

  const conversations = workers
    .map((worker, index) => {
      const at = addDays(today, -(8 + index * 11));
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
