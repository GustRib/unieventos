import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClientError } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

export function OrganizerRegisterPage() {
  const { registerOrganizer } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      await registerOrganizer(form);
      navigate('/dashboard/organizer');
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        if (err.errors) {
          const mapped: Record<string, string> = {};
          Object.entries(err.errors).forEach(([key, msgs]) => {
            mapped[key] = msgs[0];
          });
          setFieldErrors(mapped);
        }
      } else {
        setError('Erro ao registar');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Registo de Organizador</h1>
        <p className="mt-1 text-sm text-slate-600">Crie eventos e gira inscrições do seu departamento.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <Alert variant="error" message={error} />}
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={fieldErrors.name} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={fieldErrors.email} required />
          <Input label="Departamento" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} error={fieldErrors.department} required />
          <Input label="Palavra-passe" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={fieldErrors.password} required />
          <Input label="Confirmar palavra-passe" type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} required />
          <Button type="submit" className="w-full" isLoading={isLoading}>Registar</Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Já tem conta? <Link to="/login" className="font-medium text-primary-600 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
