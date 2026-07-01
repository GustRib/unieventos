import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyRegistrations } from '@/api/registrations';
import { ApiClientError } from '@/api/client';
import { RegistrationStatusBadge } from '@/components/registrations/RegistrationStatusBadge';
import { Alert } from '@/components/ui/Alert';
import type { Registration } from '@/types';

export function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyRegistrations()
      .then(setRegistrations)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Erro'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Minhas Inscrições</h1>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          Ainda não se inscreveu em nenhum evento.{' '}
          <Link to="/" className="text-primary-600 hover:underline">Explorar eventos</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Evento</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{reg.event?.title || `Evento #${reg.event_id}`}</td>
                  <td className="px-4 py-3">
                    {reg.event ? new Date(reg.event.event_date).toLocaleDateString('pt-PT') : '—'}
                  </td>
                  <td className="px-4 py-3"><RegistrationStatusBadge status={reg.status} /></td>
                  <td className="px-4 py-3">
                    <Link to={`/events/${reg.event_id}`} className="text-primary-600 hover:underline">
                      Ver evento
                    </Link>
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
