import type { EventFormData } from '@/types';

export function buildEventPayload(form: EventFormData): EventFormData {
  const eventDate =
    form.event_date.length === 16 ? `${form.event_date}:00` : form.event_date;

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    location: form.location.trim() || 'A definir',
    event_date: eventDate,
    vacancies: Math.max(1, Number(form.vacancies) || 1),
  };
}

export function getDefaultEventDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setMinutes(0, 0, 0);

  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatApiValidationErrors(errors?: Record<string, string[]>): string {
  if (!errors) {
    return '';
  }

  return Object.values(errors).flat().join(' ');
}
