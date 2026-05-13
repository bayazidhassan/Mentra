import useAuthStore from '../store/useAuthStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      queue.push((token) => resolve(token));
    });
  }

  isRefreshing = true;

  try {
    const res = await fetch(`${BASE_URL}/auth/refreshToken`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      return null;
    }

    const { data } = await res.json();
    useAuthStore.getState().setAccessToken(data.accessToken);
    queue.forEach((cb) => cb(data.accessToken));
    return data.accessToken;
  } finally {
    isRefreshing = false;
    queue = [];
  }
};

type FetchOptions = RequestInit & {
  _retry?: boolean;
};

export const fetchClient = async <T = unknown>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> => {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401 && !options._retry) {
    const newToken = await refreshAccessToken();
    if (!newToken) return null as T;

    return fetchClient<T>(endpoint, {
      ...options,
      _retry: true,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      },
    });
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json() as Promise<T>;
};
