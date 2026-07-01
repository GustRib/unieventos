import { RegistrationStatus, RegistrationStatusLabels } from '@/types';
import { cn } from '@/lib/cn';

const statusStyles: Record<RegistrationStatus, string> = {
  [RegistrationStatus.Pending]: 'bg-amber-100 text-amber-800',
  [RegistrationStatus.Approved]: 'bg-green-100 text-green-800',
  [RegistrationStatus.Rejected]: 'bg-red-100 text-red-800',
  [RegistrationStatus.Cancelled]: 'bg-slate-100 text-slate-600',
};

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyles[status])}>
      {RegistrationStatusLabels[status]}
    </span>
  );
}
