import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { silentRefresh } from './silentRefresh';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Request interceptor → attach accessToken to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor → handle 401 automatically
axiosInstance.interceptors.response.use(
  (response) => response, // success → just return it
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // prevent infinite retry loop

      const refreshed = await silentRefresh();

      if (!refreshed) {
        // Refresh token also expired → force logout
        useAuthStore.getState().clearAuth();
        //window.location.href = '/login';
        return Promise.reject(error);
      }

      // Update the failed request with new token and retry
      const newToken = useAuthStore.getState().accessToken;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
