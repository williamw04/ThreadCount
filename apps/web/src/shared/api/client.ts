import { supabase } from './supabase';

// Points at the FastAPI backend. Falls back to localhost for local dev.
// See ARCHITECTURE.md — the frontend talks to the backend, which talks to Supabase.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// Extends native RequestInit but types body as unknown so callers can pass
// plain objects instead of manually JSON-stringifying.
interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

interface ApiError {
  status: number;
  message: string;
}

/**
 * Thin HTTP client that centralizes auth token injection and error normalization.
 *
 * Every request automatically attaches the current Supabase session JWT as a
 * Bearer token, so feature-level API modules never handle auth headers directly.
 * Error responses are normalized to a typed `ApiError` with the backend's
 * `detail` field when available (FastAPI convention).
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Pulls the current session token from Supabase. Returns null for
  // unauthenticated users so public calls can still proceed without a token.
  private async getAuthToken(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, headers: customHeaders, ...rest } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((customHeaders as Record<string, string>) ?? {}),
    };

    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: `Request failed: ${response.statusText}`,
      };

      // FastAPI returns error details in a `detail` field — try to extract it
      // for a more useful error message, but fall back to the status text.
      try {
        const errorBody = (await response.json()) as { detail?: string };
        error.message = errorBody.detail ?? error.message;
      } catch {
        // Response body wasn't JSON — keep default message
      }

      throw error;
    }

    // 204 No Content — delete operations and some PUTs return no body.
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Singleton shared across all feature API modules.
export const apiClient = new ApiClient(API_BASE_URL);
