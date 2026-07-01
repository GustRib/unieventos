import { EventStatus, EventStatusLabels } from '@/types';
import { cn } from '@/lib/cn';

const statusStyles: Record<EventStatus, string> = {
  [EventStatus.Pending]: 'bg-amber-100 text-amber-800',
  [EventStatus.Approved]: 'bg-green-100 text-green-800',
  [EventStatus.Cancelled]: 'bg-slate-100 text-slate-600',
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyles[status])}>
      {EventStatusLabels[status]}
    </span>
  );
}
