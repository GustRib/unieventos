import { FormEvent, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ApiClientError } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Erro ao iniciar sessão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="mt-1 text-sm text-slate-600">Aceda à sua conta UniEventos.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <Alert variant="error" message={error} />}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Palavra-passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Entrar
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-slate-600">
          <p>
            Expectador?{' '}
            <Link to="/register/participant" className="font-medium text-primary-600 hover:underline">
              Criar conta
            </Link>
          </p>
          <p>
            Organizador?{' '}
            <Link to="/register/organizer" className="font-medium text-primary-600 hover:underline">
              Registar como organizador
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
