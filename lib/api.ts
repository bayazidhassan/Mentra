import { fetchClient } from './fetchClient';

export const api = {
  get: <T = unknown>(endpoint: string) => fetchClient<T>(endpoint),

  post: <T = unknown>(endpoint: string, data?: unknown) =>
    fetchClient<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T = unknown>(endpoint: string, data?: unknown) =>
    fetchClient<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T = unknown>(endpoint: string, data?: unknown) =>
    fetchClient<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T = unknown>(endpoint: string) =>
    fetchClient<T>(endpoint, { method: 'DELETE' }),
};
