import { apiRequest } from './client';
import type { Feedback, FeedbackFormData } from '@/types';

export async function submitFeedback(eventId: number, data: FeedbackFormData): Promise<Feedback> {
  return apiRequest<Feedback>(`/events/${eventId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getEventFeedbacks(eventId: number): Promise<Feedback[]> {
  return apiRequest<Feedback[]>(`/events/${eventId}/feedbacks`);
}
