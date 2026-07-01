import { apiRequest } from './client';
import type { Event, EventFormData, PaginatedEvents } from '@/types';

export async function getEvents(): Promise<PaginatedEvents> {
  return apiRequest<PaginatedEvents>('/events');
}

export async function getEvent(id: number): Promise<Event> {
  return apiRequest<Event>(`/events/${id}`);
}

export async function createEvent(data: EventFormData): Promise<Event> {
  return apiRequest<Event>('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id: number, data: Partial<EventFormData & { status?: string }>): Promise<Event> {
  return apiRequest<Event>(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: number): Promise<null> {
  return apiRequest<null>(`/events/${id}`, { method: 'DELETE' });
}

export async function approveEvent(id: number): Promise<Event> {
  return updateEvent(id, { status: 'approved' });
}
