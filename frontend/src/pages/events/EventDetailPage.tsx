import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEvent } from '@/api/events';
import { registerForEvent, cancelRegistration, getMyRegistrations } from '@/api/registrations';
import { getEventFeedbacks, submitFeedback } from '@/api/feedback';
import { ApiClientError } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { RegistrationStatusBadge } from '@/components/registrations/RegistrationStatusBadge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Textarea } from '@/components/ui/Textarea';
import type { Event, Feedback, Registration } from '@/types';
import { EventStatus, RegistrationStatus, UserRole } from '@/types';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const eventId = Number(id);

  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isPast = event ? new Date(event.event_date) < new Date() : false;
  const hasSubmittedFeedback = user
    ? feedbacks.some((f) => f.user?.id === user.id)
    : false;

  useEffect(() => {
    async function load() {
      try {
        const [eventData, feedbackData, myRegs] = await Promise.all([
          getEvent(eventId),
          getEventFeedbacks(eventId).catch(() => []),
          isAuthenticated && user?.role === UserRole.Participant
            ? getMyRegistrations()
            : Promise.resolve([]),
        ]);
        setEvent(eventData);
        setFeedbacks(feedbackData);
        setRegistration(myRegs.find((r) => r.event_id === eventId) || null);
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Erro ao carregar evento');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [eventId, isAuthenticated, user]);

  const handleRegister = async () => {
    setActionLoading(true);
    setError('');
    try {
      const reg = await registerForEvent(eventId);
      setRegistration(reg);
      setMessage('Pedido de inscrição enviado. Aguarde aprovação do organizador.');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao inscrever');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setError('');
    try {
      await cancelRegistration(eventId);
      setRegistration((r) => (r ? { ...r, status: RegistrationStatus.Cancelled } : null));
      setMessage('Inscrição cancelada.');
      if (event) setEvent({ ...event, available_vacancies: event.available_vacancies + (registration?.status === RegistrationStatus.Approved ? 1 : 0) });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao cancelar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeedback = async (e: FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await submitFeedback(eventId, { rating, comment });
      setMessage('Feedback enviado com sucesso!');
      const updated = await getEventFeedbacks(eventId);
      setFeedbacks(updated);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao enviar feedback');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!event) {
    return <Alert variant="error" message={error || 'Evento não encontrado'} />;
  }

  const canRegister =
    isAuthenticated &&
    user?.role === UserRole.Participant &&
    event.status === EventStatus.Approved &&
    !isPast &&
    event.available_vacancies > 0 &&
    (!registration || [RegistrationStatus.Rejected, RegistrationStatus.Cancelled].includes(registration.status));

  const canCancel =
    registration &&
    [RegistrationStatus.Pending, RegistrationStatus.Approved].includes(registration.status);

  const canFeedback =
    isAuthenticated &&
    user?.role === UserRole.Participant &&
    registration?.status === RegistrationStatus.Approved &&
    isPast &&
    !hasSubmittedFeedback;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/" className="text-sm text-primary-600 hover:underline">&larr; Voltar aos eventos</Link>

      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
          <EventStatusBadge status={event.status} />
        </div>

        <p className="mt-4 text-slate-700">{event.description}</p>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Data</dt><dd className="font-medium">{new Date(event.event_date).toLocaleString('pt-PT')}</dd></div>
          <div><dt className="text-slate-500">Local</dt><dd className="font-medium">{event.location}</dd></div>
          <div><dt className="text-slate-500">Vagas</dt><dd className="font-medium">{event.available_vacancies} / {event.vacancies}</dd></div>
          {event.organizer && (
            <div><dt className="text-slate-500">Organizador</dt><dd className="font-medium">{event.organizer.name}</dd></div>
          )}
        </dl>

        {registration && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-slate-600">Estado da inscrição:</span>
            <RegistrationStatusBadge status={registration.status} />
          </div>
        )}

        {error && <div className="mt-4"><Alert variant="error" message={error} /></div>}
        {message && <div className="mt-4"><Alert variant="success" message={message} /></div>}

        <div className="mt-6 flex flex-wrap gap-3">
          {canRegister && (
            <Button onClick={handleRegister} isLoading={actionLoading}>Inscrever-me</Button>
          )}
          {canCancel && (
            <Button variant="danger" onClick={handleCancel} isLoading={actionLoading}>Cancelar inscrição</Button>
          )}
          {event.available_vacancies <= 0 && event.status === EventStatus.Approved && !registration && (
            <span className="text-sm text-red-600">Evento esgotado.</span>
          )}
        </div>
      </article>

      {canFeedback && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Avaliar evento</h2>
          <form onSubmit={handleFeedback} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Classificação (1-5)</label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`h-10 w-10 rounded-lg border text-sm font-medium ${rating >= n ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-300 text-slate-500'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <Textarea label="Comentário" value={comment} onChange={(e) => setComment(e.target.value)} />
            <Button type="submit" isLoading={actionLoading}>Enviar feedback</Button>
          </form>
        </section>
      )}

      {feedbacks.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Feedbacks ({feedbacks.length})</h2>
          <ul className="mt-4 space-y-3">
            {feedbacks.map((f) => (
              <li key={f.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{f.user?.name}</span>
                  <span className="text-amber-600">{'★'.repeat(f.rating)}</span>
                </div>
                {f.comment && <p className="mt-1 text-slate-600">{f.comment}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
