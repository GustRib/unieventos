/** Backend API role values */
export enum UserRole {
  Admin = 'admin',
  Organizer = 'organizer',
  Participant = 'participant',
}

/** Backend event status values */
export enum EventStatus {
  Pending = 'pending',
  Approved = 'approved',
  Cancelled = 'cancelled',
}

/** Backend registration status values (mapped to PT labels in UI) */
export enum RegistrationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
}

export const RegistrationStatusLabels: Record<RegistrationStatus, string> = {
  [RegistrationStatus.Pending]: 'Pendente',
  [RegistrationStatus.Approved]: 'Aprovada',
  [RegistrationStatus.Rejected]: 'Reprovada',
  [RegistrationStatus.Cancelled]: 'Cancelada',
};

export const EventStatusLabels: Record<EventStatus, string> = {
  [EventStatus.Pending]: 'Pendente',
  [EventStatus.Approved]: 'Aprovado',
  [EventStatus.Cancelled]: 'Cancelado',
};

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.Admin]: 'Administrador',
  [UserRole.Organizer]: 'Organizador',
  [UserRole.Participant]: 'Expectador',
};

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  course: string | null;
  department: string | null;
  created_at?: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  vacancies: number;
  available_vacancies: number;
  status: EventStatus;
  organizer_id: number;
  organizer?: User;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedEvents {
  events: Event[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface Registration {
  id: number;
  status: RegistrationStatus;
  event_id: number;
  user?: User;
  event?: Event;
  created_at?: string;
}

export interface Feedback {
  id: number;
  rating: number;
  comment: string | null;
  event_id: number;
  user?: User;
  created_at?: string;
}

export interface FeedbackFormData {
  rating: number;
  comment?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ParticipantRegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  course: string;
}

export interface OrganizerRegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  department: string;
}

export interface ProfileFormData {
  name: string;
  course: string;
  department: string;
}

export interface EventFormData {
  title: string;
  description: string;
  location: string;
  event_date: string;
  vacancies: number;
}

export interface EventFilters {
  search: string;
  course: string;
  department: string;
  availability: 'all' | 'available' | 'full';
}

export interface ApiError extends Error {
  status?: number;
  errors?: Record<string, string[]>;
}
