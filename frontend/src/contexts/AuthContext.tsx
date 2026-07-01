import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '@/api/auth';
import { clearToken, getToken } from '@/api/client';
import type { LoginFormData, OrganizerRegisterFormData, ParticipantRegisterFormData, ProfileFormData, User } from '@/types';
import { UserRole } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<void>;
  registerParticipant: (data: ParticipantRegisterFormData) => Promise<void>;
  registerOrganizer: (data: OrganizerRegisterFormData) => Promise<void>;
  updateProfile: (data: ProfileFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    const me = await authApi.getMe();
    setUser(me);
  }, []);

  useEffect(() => {
    refreshUser()
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (data: LoginFormData) => {
    const result = await authApi.login(data);
    setUser(result.user);
  }, []);

  const registerParticipant = useCallback(async (data: ParticipantRegisterFormData) => {
    const result = await authApi.registerParticipant(data);
    setUser(result.user);
  }, []);

  const registerOrganizer = useCallback(async (data: OrganizerRegisterFormData) => {
    const result = await authApi.registerOrganizer(data);
    setUser(result.user);
  }, []);

  const updateProfile = useCallback(async (data: ProfileFormData) => {
    const updated = await authApi.updateProfile(data);
    setUser(updated);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      registerParticipant,
      registerOrganizer,
      updateProfile,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, registerParticipant, registerOrganizer, updateProfile, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useRequireRole(...roles: UserRole[]) {
  const { user, isLoading } = useAuth();
  const allowed = user ? roles.includes(user.role) : false;
  return { user, isLoading, allowed };
}
