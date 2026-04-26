import axios, { AxiosInstance } from 'axios';

const SUPERSET_BASE_URL = import.meta.env.VITE_SUPERSET_BASE_URL || '';
const CSRF_TOKEN_ENDPOINT = '/api/v1/security/csrf_token/';
const MUTATING_METHODS = ['post', 'put', 'delete', 'patch'];

export const isConfigured = !!SUPERSET_BASE_URL && SUPERSET_BASE_URL.startsWith('http');

export const supersetClient: AxiosInstance = axios.create({
  baseURL: SUPERSET_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let csrfToken: string | null = null;

export const fetchCsrfToken = async (): Promise<string | null> => {
  try {
    const response = await supersetClient.get(CSRF_TOKEN_ENDPOINT);
    csrfToken = response.data.result;
    return csrfToken;
  } catch (error) {
    console.error('CSRF token fetch failed:', error);
    return null;
  }
};

supersetClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase() || '';

  if (MUTATING_METHODS.includes(method)) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  return config;
}, (error) => Promise.reject(error));

supersetClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await fetchCsrfToken();
      if (newToken) {
        originalRequest.headers['X-CSRFToken'] = newToken;
        return supersetClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);
