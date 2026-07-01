import type { ApiErrorResponse, ApiResponse, ApiSuccessResponse } from '@/types';

const TOKEN_KEY = 'unieventos_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status = 422, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T>;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      `Server error (${response.status}). Verifique se a API está a correr e as migrations foram executadas.`,
      response.status,
    );
  }

  if (!response.ok || !payload.success) {
    const errorPayload = payload as ApiErrorResponse;
    throw new ApiClientError(
      errorPayload.message || 'Request failed',
      response.status,
      errorPayload.errors,
    );
  }

  return (payload as ApiSuccessResponse<T>).data;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  headers.set('Accept', 'application/json');

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  return parseResponse<T>(response);
}
