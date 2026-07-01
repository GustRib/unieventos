import { useMemo, useState } from 'react';
import { getEvents } from '@/api/events';
import { getMyRegistrations } from '@/api/registrations';
import { EventCard } from '@/components/events/EventCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClientError } from '@/api/client';
import type { Event, EventFilters, Registration } from '@/types';
import { EventStatus, RegistrationStatusLabels, UserRole } from '@/types';
import { useEffect } from 'react';

export function EventDiscoveryPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    course: '',
    department: '',
    availability: 'all',
  });

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [eventsData, myRegs] = await Promise.all([
          getEvents(),
          user?.role === UserRole.Participant ? getMyRegistrations() : Promise.resolve([]),
        ]);
        setEvents(eventsData.events);
        setRegistrations(myRegs);
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Erro ao carregar eventos');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  const registrationMap = useMemo(() => {
    const map = new Map<number, string>();
    registrations.forEach((r) => {
      map.set(r.event_id, RegistrationStatusLabels[r.status]);
    });
    return map;
  }, [registrations]);

  const departments = useMemo(
    () => [...new Set(events.map((e) => e.organizer?.department).filter(Boolean) as string[])],
    [events],
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (event.status !== EventStatus.Approved && user?.role === UserRole.Participant) {
        return false;
      }

      const search = filters.search.toLowerCase();
      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search);

      const matchesDepartment =
        !filters.department || event.organizer?.department === filters.department;

      const matchesAvailability =
        filters.availability === 'all' ||
        (filters.availability === 'available' && event.available_vacancies > 0) ||
        (filters.availability === 'full' && event.available_vacancies <= 0);

      return matchesSearch && matchesDepartment && matchesAvailability;
    });
  }, [events, filters, user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Descobrir Eventos</h1>
        <p className="mt-1 text-slate-600">Encontre eventos universitários e inscreva-se.</p>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Pesquisar"
          placeholder="Nome, descrição, local..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <Select
          label="Departamento"
          value={filters.department}
          onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
          options={[
            { value: '', label: 'Todos' },
            ...departments.map((d) => ({ value: d, label: d })),
          ]}
        />
        <Select
          label="Disponibilidade"
          value={filters.availability}
          onChange={(e) =>
            setFilters((f) => ({ ...f, availability: e.target.value as EventFilters['availability'] }))
          }
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'available', label: 'Com vagas' },
            { value: 'full', label: 'Esgotado' },
          ]}
        />
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          Nenhum evento encontrado.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              registrationStatus={registrationMap.get(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
