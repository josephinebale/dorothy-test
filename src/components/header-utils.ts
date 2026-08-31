export function badgeDisplay(count: number): string | null {
  if (count <= 0) return null;
  return count > 99 ? '99+' : String(count);
}

export function bookingsAccessibleName(count: number): string {
  return count > 0 ? `Bookings, ${count} need attention` : 'Bookings';
}

export function messagesAccessibleName(count: number): string {
  return count > 0 ? `Messages, ${count} unread` : 'Messages';
}
