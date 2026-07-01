import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createEvent, deleteEvent, getEvents, updateEvent } from '@/api/events';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClientError } from '@/api/client';
import { EventCard } from '@/components/events/EventCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import type { Event, EventFormData } from '@/types';
import { buildEventPayload, formatApiValidationErrors, getDefaultEventDate } from '@/utils/eventForm';

const emptyForm = (): EventFormData => ({
  title: '',
  description: '',
  location: '',
  event_date: getDefaultEventDate(),
  vacancies: 10,
});

export function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState<EventFormData>(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadEvents = async () => {
    const data = await getEvents();
    setEvents(data.events.filter((e) => e.organizer_id === user?.id));
  };

  useEffect(() => {
    loadEvents()
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Erro'))
      .finally(() => setIsLoading(false));
  }, [user]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (event: Event) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      event_date: event.event_date.slice(0, 16),
      vacancies: event.vacancies,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    const payload = buildEventPayload(form);

    if (new Date(payload.event_date) <= new Date()) {
      setError('A data do evento deve ser no futuro.');
      setIsSaving(false);
      return;
    }

    try {
      if (editingId) {
        await updateEvent(editingId, payload);
      } else {
        await createEvent(payload);
      }
      await loadEvents();
      setShowForm(false);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(formatApiValidationErrors(err.errors) || err.message);
      } else {
        setError('Erro ao guardar');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este evento?')) return;
    setIsSaving(true);
    try {
      await deleteEvent(id);
      await loadEvents();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao eliminar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus Eventos</h1>
          <p className="text-slate-600">Crie e gira os seus eventos.</p>
        </div>
        <Button onClick={openCreate}>+ Novo evento</Button>
      </div>

      {error && <Alert variant="error" message={error} />}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">{editingId ? 'Editar evento' : 'Novo evento'}</h2>
          <Input label="Nome" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <Input label="Local (opcional)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Auditório, Campus Norte..." />
          <Input
            label="Data"
            type="datetime-local"
            value={form.event_date}
            min={getDefaultEventDate().slice(0, 16)}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            required
          />
          <Input label="Vagas totais" type="number" min={1} value={form.vacancies} onChange={(e) => setForm({ ...form, vacancies: Number(e.target.value) })} required />
          <div className="flex gap-3">
            <Button type="submit" isLoading={isSaving}>Guardar</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          Ainda não criou eventos.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {events.map((event) => (
            <div key={event.id} className="space-y-3">
              <EventCard event={event} showStatus />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(event)}>Editar</Button>
                <Link to={`/dashboard/organizer/events/${event.id}/registrations`}>
                  <Button size="sm" variant="ghost">Inscrições</Button>
                </Link>
                <Button size="sm" variant="danger" onClick={() => handleDelete(event.id)} disabled={isSaving}>Eliminar</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
