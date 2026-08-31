import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, HouseData } from '../../data/houses';
import { StatusPill } from '../../components/StatusPill';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/IconButton';
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

const CARD_TONES: Record<Booking['status'], 'success' | 'pending' | 'neutral'> = {
  confirmed: 'success',
  requested: 'pending',
  ended: 'neutral',
};

function BookingCard({ booking, suburb, state }: { booking: Booking; suburb: string; state: string }) {
  return (
    <Card tone={CARD_TONES[booking.status]} className="!rounded-sm p-2">
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

export function BookingsWeek({ data }: { data: HouseData }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const today = startOfDay(new Date());
  const weekStart = addDays(startOfWeek(today), weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const inWeek = data.bookings.filter(
    (booking) => booking.start >= weekStart && booking.start < addDays(weekEnd, 1),
  );

  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-md font-bold text-text">
            <span>Bookings for {formatWeekRange(weekStart, weekEnd)}:</span>
            <Badge count={inWeek.length} tone="neutral" />
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Times are displayed in the local time of the booking.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            onClick={() => setWeekOffset(0)}
            size="small"
          >
            Today
          </Button>
          <IconButton
            type="button"
            bordered
            size="small"
            onClick={() => setWeekOffset((value) => value - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <IconButton
            type="button"
            bordered
            size="small"
            onClick={() => setWeekOffset((value) => value + 1)}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
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
                className={`border-t-2 border-b border-l border-border-subtle px-2 py-2 first:border-l-0 ${
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
            <p className="mt-1 text-sm text-text-secondary">
              {EMPTY_STATES.bookingsWeek.description}
            </p>
          </div>
        ) : (
          <div className="grid booking-grid grid-cols-7">
            {days.map((day) => {
              const dayBookings = inWeek.filter((booking) => isSameDay(booking.start, day));
              return (
                <div
                  key={day.toISOString()}
                  className="space-y-2 border-l border-border-subtle p-2 first:border-l-0"
                >
                  {dayBookings.length === 0 ? (
                    <p className="py-4 text-center text-xs text-text-tertiary">
                      No bookings
                    </p>
                  ) : (
                    dayBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        suburb={data.house.suburb}
                        state={data.house.state}
                      />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
}
