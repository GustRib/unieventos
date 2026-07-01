import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, UserRoleLabels } from '@/types';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${isActive ? 'text-primary-600' : 'text-slate-600 hover:text-primary-600'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-bold text-primary-700">
          UniEventos
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Eventos
          </NavLink>
          {user?.role === UserRole.Participant && (
            <>
              <NavLink to="/my-registrations" className={navLinkClass}>
                Minhas Inscrições
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Perfil
              </NavLink>
            </>
          )}
          {user?.role === UserRole.Organizer && (
            <NavLink to="/dashboard/organizer" className={navLinkClass}>
              Meus Eventos
            </NavLink>
          )}
          {user?.role === UserRole.Admin && (
            <NavLink to="/dashboard/admin" className={navLinkClass}>
              Administração
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <span className="hidden text-sm text-slate-600 sm:inline">
                {user.name}
                <span className="ml-1 text-slate-400">({UserRoleLabels[user.role]})</span>
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link to="/register/participant">
                <Button size="sm">Registar</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
