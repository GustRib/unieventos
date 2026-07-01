import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClientError } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: '', course: '', department: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        course: user.course || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await updateProfile(form);
      setMessage('Perfil atualizado com sucesso.');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
      <p className="mt-1 text-slate-600">Atualize os seus dados pessoais.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        {error && <Alert variant="error" message={error} />}
        {message && <Alert variant="success" message={message} />}
        <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Email" value={user?.email || ''} disabled />
        <Input label="Curso" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
        <Input label="Departamento" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        <Button type="submit" isLoading={isLoading}>Guardar alterações</Button>
      </form>
    </div>
  );
}
