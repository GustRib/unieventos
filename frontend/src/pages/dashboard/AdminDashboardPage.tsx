import { useEffect, useState } from 'react';
import { approveEvent, getEvents } from '@/api/events';
import { ApiClientError } from '@/api/client';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { Event } from '@/types';
import { EventStatus } from '@/types';

export function AdminDashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    const data = await getEvents();
    setEvents(data.events);
  };

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Erro'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleApprove = async (id: number) => {
    setLoadingId(id);
    setError('');
    try {
      await approveEvent(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao aprovar');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Painel de Administração</h1>
        <p className="text-slate-600">Revise e aprove eventos antes de ficarem públicos.</p>
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Evento</th>
                <th className="px-4 py-3 font-medium">Organizador</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{event.title}</td>
                  <td className="px-4 py-3">{event.organizer?.name}</td>
                  <td className="px-4 py-3">{new Date(event.event_date).toLocaleDateString('pt-PT')}</td>
                  <td className="px-4 py-3"><EventStatusBadge status={event.status} /></td>
                  <td className="px-4 py-3">
                    {event.status === EventStatus.Pending && (
                      <Button size="sm" isLoading={loadingId === event.id} onClick={() => handleApprove(event.id)}>
                        Validar / Aprovar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
