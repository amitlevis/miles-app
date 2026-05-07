export function getPartnerTime(timeZone: string): string {
  return new Date().toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getPartnerDate(timeZone: string): string {
  return new Date().toLocaleDateString('en-US', {
    timeZone,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function getOffsetHours(timeZone: string): number {
  const now = new Date();
  const local = now.toLocaleString('en-US', { timeZone });
  const utc = now.toLocaleString('en-US', { timeZone: 'UTC' });
  return (new Date(local).getTime() - new Date(utc).getTime()) / 3_600_000;
}

export function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

export function hoursUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 3_600_000));
}
