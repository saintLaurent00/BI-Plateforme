import axios from 'axios';

const SUPERSET_BASE_URL = import.meta.env.VITE_SUPERSET_BASE_URL || '';

export const isConfigured = !!SUPERSET_BASE_URL && SUPERSET_BASE_URL.startsWith('http');

export const supersetClient = axios.create({
  baseURL: SUPERSET_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let csrfToken: string | null = null;

export const fetchCsrfToken = async () => {
  try {
    const response = await supersetClient.get('/api/v1/security/csrf_token/');
    csrfToken = response.data.result;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

supersetClient.interceptors.request.use(async (config) => {
  // Only add CSRF token for mutating requests
  if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

supersetClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle CSRF token expiration (usually 401 or 403 depending on config)
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
