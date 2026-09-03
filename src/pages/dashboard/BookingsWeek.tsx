import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import type { Booking, LocationData } from '../../data/locations';
import { PinnedQuestion } from '../../components/PinnedQuestion';
import { StatusPill } from '../../components/StatusPill';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/IconButton';
import { Tag } from '../../components/ui/Tag';
import { EMPTY_STATES } from '../../lib/pageContent';
import {
  addDays,
  formatTime,
  formatWeekRange,
  isSameDay,
  startOfDay,
  startOfWeek,
  weekdayShort,
} from '../../lib/date';

/* Confirmed is the norm and ended is history, so neither earns a tint. Only a
   booking waiting on a decision colours its card. */
const CARD_TONES: Record<Booking['status'], 'default' | 'pending'> = {
  confirmed: 'default',
  requested: 'pending',
  ended: 'default',
};

const COLLAPSED_BOOKINGS_PER_DAY = 4;

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

function BookingCard({ booking, suburb, state }: { booking: Booking; suburb: string; state: string }) {
  return (
    <Card tone={CARD_TONES[booking.status]} className="ui-inset-compact !rounded-sm">
      <p className="text-xs text-text">
        {formatTime(booking.start)} - {formatTime(booking.end)}
      </p>
      {booking.sleepover && (
        <p className="mt-1 text-xs font-bold text-text">Sleepover</p>
      )}
      <p className="mt-1 text-xs text-text-strong">
        {suburb}, {state}
      </p>
      <p className="mt-1 text-xs text-text-strong">{booking.workerName}</p>
      <div className="mt-3">
        <StatusPill status={booking.status} />
      </div>
    </Card>
  );
}

export function BookingsWeek({ data }: { data: LocationData }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const today = startOfDay(new Date());
  const weekStart = addDays(startOfWeek(today), weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const inWeek = data.bookings.filter(
    (booking) => booking.start >= weekStart && booking.start < addDays(weekEnd, 1),
  );
  const bookingsByDay = days.map((day) =>
    inWeek.filter((booking) => isSameDay(booking.start, day)),
  );
  const hiddenBookingCount = bookingsByDay.reduce(
    (total, bookings) => total + Math.max(0, bookings.length - COLLAPSED_BOOKINGS_PER_DAY),
    0,
  );

  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-md font-bold text-text">
            <span>Bookings for {formatWeekRange(weekStart, weekEnd)}:</span>
            <Tag>{inWeek.length}</Tag>
            <PinnedQuestion questionId="dashboard-week" />
          </h2>
          <p className="mt-1 max-w-content text-sm text-text-secondary">
            Times are displayed in the local time of the booking.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            onClick={() => {
              setWeekOffset(0);
              setExpanded(false);
            }}
            size="small"
          >
            Today
          </Button>
          <IconButton
            type="button"
            bordered
            size="small"
            onClick={() => {
              setWeekOffset((value) => value - 1);
              setExpanded(false);
            }}
            className="ui-tooltip"
            aria-label="Previous week"
            data-tooltip="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </IconButton>
          <IconButton
            type="button"
            bordered
            size="small"
            onClick={() => {
              setWeekOffset((value) => value + 1);
              setExpanded(false);
            }}
            className="ui-tooltip"
            aria-label="Next week"
            data-tooltip="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </IconButton>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={`ui-inset-compact border-t-2 border-b border-l border-border-subtle first:border-l-0 ${
                  isToday ? 'border-t-brand' : 'border-t-transparent'
                }`}
              >
                <p
                  className={`text-xs ${isToday ? 'font-bold text-text' : 'text-text-strong'}`}
                >
                  {isToday ? 'Today' : weekdayShort(day)}
                </p>
                <p className="text-sm font-bold text-text">{day.getDate()}</p>
              </div>
            );
          })}
        </div>

        {inWeek.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-lg font-bold text-text">
              {EMPTY_STATES.bookingsWeek.title}
            </p>
            <p className="mt-1 mx-auto max-w-content text-sm text-text-secondary">
              {EMPTY_STATES.bookingsWeek.description}
            </p>
          </div>
        ) : (
          <>
            <div id="dashboard-bookings-grid" className="grid booking-grid grid-cols-7">
            {days.map((day, index) => {
              const dayBookings = bookingsByDay[index];
              const visibleDayBookings = expanded
                ? dayBookings
                : dayBookings.slice(0, COLLAPSED_BOOKINGS_PER_DAY);
              return (
                <div
                  key={day.toISOString()}
                  className="ui-inset-compact space-y-2 border-l border-border-subtle first:border-l-0"
                >
                  {dayBookings.length === 0 ? (
                    <p className="py-4 text-center text-xs text-text-tertiary">
                      No bookings
                    </p>
                  ) : (
                    visibleDayBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        suburb={data.location.suburb}
                        state={data.location.state}
                      />
                    ))
                  )}
                </div>
              );
            })}
            </div>
            {hiddenBookingCount > 0 && (
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls="dashboard-bookings-grid"
                onClick={() => setExpanded((value) => !value)}
                className="flex w-full items-center justify-center gap-1 border-t border-border-subtle px-4 py-3 text-sm font-medium text-brand underline hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
              >
                {expanded
                  ? 'Show less'
                  : `${hiddenBookingCount} more ${plural(hiddenBookingCount, 'booking', 'bookings')}`}
                {expanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            )}
          </>
        )}
      </Card>
    </section>
  );
}
