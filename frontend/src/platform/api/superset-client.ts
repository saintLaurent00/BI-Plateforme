const API_PREFIX = '/api/v1';

export type SupersetLoginProvider = 'db' | 'ldap' | 'oauth';

type SupersetRequestOptions = RequestInit & { authenticated?: boolean };

const configuredBaseUrl = (import.meta.env.VITE_SUPERSET_URL as string | undefined)?.trim();

export const supersetBaseUrl = configuredBaseUrl?.replace(/\/+$/, '') ?? '';

export class SupersetApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'SupersetApiError';
    this.status = status;
    this.payload = payload;
  }
}

const TOKEN_KEY = 'hifadih.superset.access_token';
const REFRESH_TOKEN_KEY = 'hifadih.superset.refresh_token';
let csrfToken: string | null = null;

export const supersetAuth = {
  getAccessToken: () => window.localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => window.localStorage.getItem(REFRESH_TOKEN_KEY),
  isAuthenticated: () => Boolean(window.localStorage.getItem(TOKEN_KEY)),
  clear() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    csrfToken = null;
  },
  async login(username: string, password: string, provider: SupersetLoginProvider = 'db') {
    if (!supersetBaseUrl) {
      throw new Error('Configurez VITE_SUPERSET_URL avec l’URL de votre instance Apache Superset.');
    }

    const response = await fetch(`${supersetBaseUrl}${API_PREFIX}/security/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, password, provider, refresh: true }),
    });
    const payload = await parseResponse(response);
    if (!response.ok) {
      throw new SupersetApiError(readErrorMessage(payload, 'Échec de connexion à Apache Superset.'), response.status, payload);
    }

    const accessToken = (payload as { access_token?: string }).access_token;
    const refreshToken = (payload as { refresh_token?: string }).refresh_token;
    if (!accessToken) throw new Error('Superset n’a pas renvoyé de jeton d’accès.');

    window.localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    return payload;
  },
};

async function parseResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try { return await response.json(); } catch { return null; }
  }
  const text = await response.text();
  return text || null;
}

function readErrorMessage(payload: any, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) return payload;
  if (typeof payload?.message === 'string') return payload.message;
  if (typeof payload?.error === 'string') return payload.error;
  if (Array.isArray(payload?.errors) && payload.errors[0]?.message) return payload.errors[0].message;
  return fallback;
}

export async function supersetRequest<T>(path: string, options: SupersetRequestOptions = {}): Promise<T> {
  if (!supersetBaseUrl) {
    throw new Error('Apache Superset n’est pas configuré. Définissez VITE_SUPERSET_URL dans frontend/.env.local.');
  }

  const { authenticated = true, headers: suppliedHeaders, ...init } = options;
  const headers = new Headers(suppliedHeaders);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  if (authenticated) {
    const token = supersetAuth.getAccessToken();
    if (!token) throw new SupersetApiError('Session Superset absente. Connectez-vous à nouveau.', 401);
    headers.set('Authorization', `Bearer ${token}`);
  }

  const method = (init.method ?? 'GET').toUpperCase();
  if (authenticated && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!csrfToken) {
      const csrfResponse = await fetch(`${supersetBaseUrl}${API_PREFIX}/security/csrf_token/`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${supersetAuth.getAccessToken()}` },
        credentials: 'include',
      });
      const csrfPayload = await parseResponse(csrfResponse);
      if (!csrfResponse.ok) {
        throw new SupersetApiError(readErrorMessage(csrfPayload, 'Impossible de récupérer le jeton CSRF Superset.'), csrfResponse.status, csrfPayload);
      }
      csrfToken = csrfPayload?.result ?? csrfPayload?.csrf_token ?? null;
    }
    if (csrfToken) headers.set('X-CSRFToken', csrfToken);
  }

  const response = await fetch(`${supersetBaseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  const payload = await parseResponse(response);

  if (response.status === 401) supersetAuth.clear();
  if (!response.ok) {
    throw new SupersetApiError(readErrorMessage(payload, `Erreur API Superset (${response.status}).`), response.status, payload);
  }
  return payload as T;
}

export function supersetApiUrl(path: string): string {
  return `${supersetBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
