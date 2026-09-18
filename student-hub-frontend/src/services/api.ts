// API client for the Student Hub Rails backend.
//
// Responsibilities:
//   1. Prefix requests with the configured base URL
//   2. Send cookies on every request (`credentials: 'include'`)
//   3. Attach the CSRF token on state-changing requests
//   4. Parse our backend's structured error envelope
//   5. Convert snake_case JSON to camelCase and vice versa
//
// Everything else (retries, caching, request cancellation) is deferred
// until we actually need it.

import { keysToCamel, keysToSnake } from '../lib/case';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// The backend sets an XSRF-TOKEN cookie on every response. We read it
// here and echo it back in the X-CSRF-Token header on state-changing
// requests. The cookie itself is signed by Rails; the header value is
// just the token Rails expects to see.
function readCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Backend error shape:
//   { error: { code, message, details? } }
// We surface it as a typed error so callers can switch on `code`.
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, string[]>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

async function request<TResponse>(
  method: string,
  endpoint: string,
  body?: unknown,
): Promise<TResponse> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  // CSRF token is required on state-changing requests. We read the cookie
  // fresh each time — it may be updated by any response.
  if (STATE_CHANGING_METHODS.includes(method.toUpperCase())) {
    const token = readCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  const init: RequestInit = {
    method,
    headers,
    credentials: 'include', // send and receive cookies cross-origin
  };

  if (body !== undefined) {
    init.body = JSON.stringify(keysToSnake(body));
  }

  const response = await fetch(url, init);

  // 204 No Content — nothing to parse
  if (response.status === 204) {
    return undefined as TResponse;
  }

  // Try to parse the body regardless of status — errors have a body too.
  let raw: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      raw = JSON.parse(text);
    } catch {
      raw = null;
    }
  }

  if (!response.ok) {
    const envelope = raw as
      | { error?: { code?: string; message?: string; details?: Record<string, string[]> } }
      | null;

    const code = envelope?.error?.code ?? 'UNKNOWN_ERROR';
    const message =
      envelope?.error?.message ?? `Request failed with status ${response.status}`;
    const details = envelope?.error?.details;

    // Special-case CSRF failures to help callers retry.
    if (code === 'CSRF_INVALID') {
      // Best-effort: hit the health endpoint to refresh the CSRF cookie.
      try {
        await fetch(`${API_BASE_URL}/health`, { credentials: 'include' });
      } catch {
        /* ignore — caller will see the original error */
      }
    }

    throw new ApiError(response.status, code, message, details);
  }

  return keysToCamel<TResponse>(raw);
}

export const api = {
  baseUrl: API_BASE_URL,

  get<TResponse>(endpoint: string): Promise<TResponse> {
    return request<TResponse>('GET', endpoint);
  },

  post<TResponse>(endpoint: string, body?: unknown): Promise<TResponse> {
    return request<TResponse>('POST', endpoint, body);
  },

  put<TResponse>(endpoint: string, body?: unknown): Promise<TResponse> {
    return request<TResponse>('PUT', endpoint, body);
  },

  patch<TResponse>(endpoint: string, body?: unknown): Promise<TResponse> {
    return request<TResponse>('PATCH', endpoint, body);
  },

  delete<TResponse>(endpoint: string): Promise<TResponse> {
    return request<TResponse>('DELETE', endpoint);
  },
};
