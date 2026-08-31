import { Calendar, CalendarCheck, ClipboardList, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { HouseData } from '../data/houses';
import { PageHeading } from '../components/PageHeading';
import { Card } from '../components/ui/Card';
import { addDays, formatLongDate, startOfDay } from '../lib/date';
import { EMPTY_STATES } from '../lib/pageContent';
import { href } from '../lib/router';

type Item = {
  title: string;
  description: string;
  Icon: LucideIcon;
  date: Date;
  path: string;
};

function buildItems(data: HouseData): Item[] {
  const today = startOfDay(new Date());

  const items: Item[] = [
    {
      title: `${data.unreadMessages} unread ${data.unreadMessages === 1 ? 'message' : 'messages'}`,
      description: `From workers at ${data.house.name}.`,
      Icon: MessageCircle,
      date: today,
      path: '/messages',
    },
    {
      title: `${data.requestsToAccept} booking requests waiting to be accepted`,
      description: 'Workers have not yet responded to these requests.',
      Icon: Calendar,
      date: addDays(today, -1),
      path: '/bookings',
    },
    {
      title: `${data.bookingsToApprove} bookings to approve`,
      description: 'Approve completed bookings so workers can be paid on time.',
      Icon: CalendarCheck,
      date: addDays(today, -2),
      path: '/bookings',
    },
    {
      title: `${data.plansToReview} support plans to review`,
      description: 'These workers have not confirmed the latest support plan.',
      Icon: ClipboardList,
      date: addDays(today, -4),
      path: '/manage-house/support-plan',
    },
  ];

  return items;
}

export function Notifications({ data }: { data: HouseData }) {
  const items = buildItems(data);

  return (
    <div className="mx-auto max-w-content">
      <PageHeading title="Notifications" />

      {items.length === 0 ? (
        <Card className="p-6">
          <p className="text-lg font-bold text-text">
            {EMPTY_STATES.notifications.title}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {EMPTY_STATES.notifications.description}
          </p>
        </Card>
      ) : (
        <Card as="ul" divided>
          {items.map(({ title, description, Icon, date, path }) => (
            <li key={title} className="ui-target-row flex items-start gap-3 p-4">
              <Icon className="mt-1 h-4 w-4 shrink-0 text-text-strong" />
              <div className="min-w-0 flex-1">
                <a href={href(path)} className="ui-target-row__link">
                  {title}
                </a>
                <p className="mt-1 text-sm text-text-secondary">{description}</p>
              </div>
              <span className="shrink-0 text-sm text-text-tertiary">{formatLongDate(date)}</span>
            </li>
          ))}
        </Card>
      )}
    </div>
  );
}
