import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEventRegistrations, approveRegistration, rejectRegistration } from '@/api/registrations';
import { ApiClientError } from '@/api/client';
import { RegistrationStatusBadge } from '@/components/registrations/RegistrationStatusBadge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { Registration } from '@/types';
import { RegistrationStatus } from '@/types';

export function OrganizerRegistrationsPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    const data = await getEventRegistrations(eventId);
    setRegistrations(data);
  };

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Erro'))
      .finally(() => setIsLoading(false));
  }, [eventId]);

  const handleAction = async (registrationId: number, action: 'approve' | 'reject') => {
    setLoadingId(registrationId);
    setError('');
    try {
      if (action === 'approve') {
        await approveRegistration(registrationId);
      } else {
        await rejectRegistration(registrationId);
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro na operação');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/dashboard/organizer" className="text-sm text-primary-600 hover:underline">&larr; Voltar ao painel</Link>
      <h1 className="text-2xl font-bold text-slate-900">Gestão de Inscrições</h1>

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : registrations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
          Sem inscrições para este evento.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Participante</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Curso</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{reg.user?.name}</td>
                  <td className="px-4 py-3">{reg.user?.email}</td>
                  <td className="px-4 py-3">{reg.user?.course || '—'}</td>
                  <td className="px-4 py-3"><RegistrationStatusBadge status={reg.status} /></td>
                  <td className="px-4 py-3">
                    {reg.status === RegistrationStatus.Pending && (
                      <div className="flex gap-2">
                        <Button size="sm" isLoading={loadingId === reg.id} onClick={() => handleAction(reg.id, 'approve')}>
                          Aprovar
                        </Button>
                        <Button size="sm" variant="danger" isLoading={loadingId === reg.id} onClick={() => handleAction(reg.id, 'reject')}>
                          Reprovar
                        </Button>
                      </div>
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
