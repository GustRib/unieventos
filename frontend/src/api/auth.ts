import { apiRequest, setToken, clearToken } from './client';
import type {
  AuthPayload,
  LoginFormData,
  OrganizerRegisterFormData,
  ParticipantRegisterFormData,
  ProfileFormData,
  User,
} from '@/types';

export async function login(data: LoginFormData): Promise<AuthPayload> {
  const result = await apiRequest<AuthPayload>('/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(result.token);
  return result;
}

export async function registerParticipant(data: ParticipantRegisterFormData): Promise<AuthPayload> {
  const result = await apiRequest<AuthPayload>('/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(result.token);
  return result;
}

export async function registerOrganizer(data: OrganizerRegisterFormData): Promise<AuthPayload> {
  const result = await apiRequest<AuthPayload>('/register/organizer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(result.token);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<null>('/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

export async function getMe(): Promise<User> {
  return apiRequest<User>('/me');
}

export async function updateProfile(data: ProfileFormData): Promise<User> {
  return apiRequest<User>('/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
