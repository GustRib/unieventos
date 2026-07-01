import { apiRequest } from './client';
import type { Registration } from '@/types';

export async function registerForEvent(eventId: number): Promise<Registration> {
  return apiRequest<Registration>(`/events/${eventId}/register`, { method: 'POST' });
}

export async function cancelRegistration(eventId: number): Promise<null> {
  return apiRequest<null>(`/events/${eventId}/register`, { method: 'DELETE' });
}

export async function getEventRegistrations(eventId: number): Promise<Registration[]> {
  return apiRequest<Registration[]>(`/events/${eventId}/registrations`);
}

export async function getMyRegistrations(): Promise<Registration[]> {
  return apiRequest<Registration[]>('/my-registrations');
}

export async function approveRegistration(registrationId: number): Promise<Registration> {
  return apiRequest<Registration>(`/registrations/${registrationId}/approve`, { method: 'PATCH' });
}

export async function rejectRegistration(registrationId: number): Promise<Registration> {
  return apiRequest<Registration>(`/registrations/${registrationId}/reject`, { method: 'PATCH' });
}
