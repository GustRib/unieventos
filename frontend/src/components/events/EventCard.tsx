import { Link } from 'react-router-dom';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import type { Event } from '@/types';
import { EventStatus } from '@/types';

interface EventCardProps {
  event: Event;
  registrationStatus?: string;
  showStatus?: boolean;
}

export function EventCard({ event, registrationStatus, showStatus = false }: EventCardProps) {
  const isPast = new Date(event.event_date) < new Date();
  const noVacancies = event.available_vacancies <= 0;

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
        {showStatus && <EventStatusBadge status={event.status} />}
      </div>

      <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-600">{event.description}</p>

      <dl className="mb-4 space-y-1 text-sm text-slate-500">
        <div className="flex justify-between">
          <dt>Data</dt>
          <dd className="font-medium text-slate-700">
            {new Date(event.event_date).toLocaleString('pt-PT')}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Local</dt>
          <dd className="font-medium text-slate-700">{event.location}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Vagas</dt>
          <dd className={`font-medium ${noVacancies ? 'text-red-600' : 'text-green-700'}`}>
            {event.available_vacancies} / {event.vacancies}
          </dd>
        </div>
        {event.organizer && (
          <div className="flex justify-between">
            <dt>Departamento</dt>
            <dd className="font-medium text-slate-700">{event.organizer.department || '—'}</dd>
          </div>
        )}
      </dl>

      {registrationStatus && (
        <p className="mb-3 text-xs font-medium text-primary-600">
          Inscrição: {registrationStatus}
        </p>
      )}

      <Link
        to={`/events/${event.id}`}
        className="mt-auto inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
      >
        {event.status === EventStatus.Approved && !isPast ? 'Ver detalhes' : 'Ver evento'}
      </Link>
    </article>
  );
}
