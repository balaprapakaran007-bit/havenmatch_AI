/**
 * HAVENMATCH AI — Centralized API Client
 * Connects to MongoDB Atlas backend engine with auto-failover to SNS Workbench webhook.
 */
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  (import.meta as any).env?.VITE_API_URL ||
  (isLocalhost ? 'http://localhost:5000' : '');

const CLOUD_WEBHOOK =
  (import.meta as any).env?.VITE_SNS_WEBHOOK_URL ||
  (import.meta as any).env?.VITE_MATCH_WEBHOOK_URL ||
  'https://api.agents.snsihub.ai/webhook/havenmatch/match';

const TIMEOUT_MS = 8000;
const inFlightAPICalls = new Map<string, Promise<any>>();

export class APIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly action?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface TargetRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

function getTargetRoute(action: string, payload?: Record<string, any>): TargetRoute {
  switch (action) {
    case 'auth/login':
      return { path: '/api/auth/login', method: 'POST' };
    case 'auth/register':
    case 'auth/signup':
      return { path: '/api/auth/signup', method: 'POST' };
    case 'auth/forgot-password':
      return { path: '/api/auth/forgot-password', method: 'POST' };
    case 'auth/reset-password':
      return { path: '/api/auth/reset-password', method: 'POST' };
    case 'auth/update-profile':
      return { path: '/api/auth/profile/update', method: 'POST' };
    case 'auth/me':
      return { path: '/api/auth/me', method: 'GET' };
    case 'properties/create':
      return { path: '/api/properties/create', method: 'POST' };
    case 'properties/update':
      return { path: '/api/properties/update', method: 'POST' };
    case 'properties/delete':
      return { path: '/api/properties/delete', method: 'POST' };
    case 'properties/list':
    case 'seller/listings':
      return { path: '/api/properties/list', method: 'GET' };
    case 'properties/get': {
      const pId = payload?.propertyId || payload?.id;
      return { path: pId ? `/api/properties/${pId}` : '/api/properties/list', method: 'GET' };
    }
    case 'matching/buyer':
      return { path: '/api/matching/buyer', method: 'POST' };
    case 'shortlists/list':
      return { path: '/api/engagement/shortlists/list', method: 'GET' };
    case 'shortlists/add':
      return { path: '/api/engagement/shortlists/add', method: 'POST' };
    case 'shortlists/remove':
      return { path: '/api/engagement/shortlists/remove', method: 'POST' };
    case 'interests/list':
      return { path: '/api/engagement/interests/list', method: 'GET' };
    case 'interests/express':
      return { path: '/api/engagement/interests/express', method: 'POST' };
    case 'visits/list':
      return { path: '/api/engagement/visits/list', method: 'GET' };
    case 'visits/schedule':
      return { path: '/api/engagement/visits/schedule', method: 'POST' };
    case 'location/poi':
      return { path: '/api/location/poi', method: 'POST' };
    case 'location/geocode':
      return { path: '/api/location/geocode', method: 'POST' };
    case 'location/discover':
      return { path: '/api/location/discover', method: 'POST' };
    default:
      return { path: '/webhook/havenmatch/match', method: 'POST' };
  }
}

export async function callAPI<T = Record<string, unknown>>(
  action: string,
  payload?: Record<string, unknown>
): Promise<T> {
  const requestKey = `${action}:${JSON.stringify(payload || {})}`;

  // Deduplicate in-flight identical calls
  if (inFlightAPICalls.has(requestKey)) {
    return inFlightAPICalls.get(requestKey) as Promise<T>;
  }

  const executionPromise = (async () => {
    // 1. Retrieve session credentials
    let token: string | undefined = undefined;
    let sessionUserId: string | undefined = undefined;
    let sessionEmail: string | undefined = undefined;
    try {
      const sessionStr = localStorage.getItem('havenmatch_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        token = session.token;
        sessionUserId = session.id || session.userId;
        sessionEmail = session.email;
      }
      if (!token) {
        token = localStorage.getItem('havenmatch_token') || undefined;
      }
    } catch { /* ignore */ }

    const target = getTargetRoute(action, payload);
    const candidateUrls: string[] = [];
    if (BASE_URL) candidateUrls.push(`${BASE_URL}${target.path}`);
    if (isLocalhost) candidateUrls.push(target.path);
    candidateUrls.push(CLOUD_WEBHOOK);

    let lastError: Error | null = null;

    for (let i = 0; i < candidateUrls.length; i++) {
      const url = candidateUrls[i];
      const isWebhook = url.includes('/webhook/');
      const method = isWebhook ? 'POST' : target.method;

      let timeoutId: any = undefined;
      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        };
        if (token) {
          headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        }

        let fetchUrl = url;
        let bodyContent: string | undefined = undefined;

        if (method === 'GET') {
          // Construct query params for GET
          const params = new URLSearchParams();
          if (payload) {
            Object.entries(payload).forEach(([k, v]) => {
              if (v !== undefined && v !== null && typeof v !== 'object') {
                params.append(k, String(v));
              }
            });
          }
          if (sessionUserId && !params.has('userId') && !params.has('sellerId') && !params.has('ownerId')) {
            params.append('userId', sessionUserId);
          }
          const qs = params.toString();
          if (qs) fetchUrl = `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}${qs}`;
        } else {
          // POST / PUT / DELETE payload body
          const bodyData = {
            ...(isWebhook ? { action } : {}),
            ...(token ? { token } : {}),
            ...(sessionUserId && !payload?.userId && !payload?.buyerId && !payload?.ownerId && !payload?.sellerId
              ? { userId: sessionUserId }
              : {}),
            ...(sessionEmail && !payload?.email && !payload?.userEmail
              ? { userEmail: sessionEmail }
              : {}),
            ...payload,
          };
          bodyContent = JSON.stringify(bodyData);
        }

        const response = await fetch(fetchUrl, {
          method,
          headers,
          body: bodyContent,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Safe error text extraction
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          let errorMsg = `Request failed with status ${response.status}`;
          try {
            const parsed = JSON.parse(errorText);
            if (parsed.error?.message) errorMsg = parsed.error.message;
            else if (parsed.error) errorMsg = String(parsed.error);
            else if (parsed.message) errorMsg = String(parsed.message);
          } catch {
            if (errorText.includes('<html') || errorText.includes('<!DOCTYPE')) {
              errorMsg = `Server error (${response.status}): Unexpected response format from server.`;
            } else if (errorText.trim()) {
              errorMsg = errorText.slice(0, 150);
            }
          }
          throw new APIError(errorMsg, response.status, action);
        }

        const text = await response.text();
        if (!text || text.trim() === '') {
          throw new APIError('Empty response from server', undefined, action);
        }

        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          throw new APIError('Invalid JSON response received from server', undefined, action);
        }

        // Unpack SNS Workbench multi-item wrapper if present
        if (data && data.data && Array.isArray(data.data.items)) {
          const matchingItem = data.data.items.find((it: any) => {
            const j = it.json || it;
            return j.action === action || (action.startsWith('auth/') && (j.user || j.token || j.data?.user));
          }) || data.data.items[0];
          if (matchingItem) {
            const inner = matchingItem.json || matchingItem;
            if (inner.success !== undefined) data.success = inner.success;
            if (inner.error) data.error = inner.error;
            data.data = inner.data !== undefined ? inner.data : inner;
            if (inner.user) (data as any).user = inner.user;
            if (inner.token) (data as any).token = inner.token;
          }
        }

        // Lift top-level user / token if nested in data
        if (data?.data?.user && !(data as any).user) {
          (data as any).user = data.data.user;
        }
        if (data?.data?.token && !(data as any).token) {
          (data as any).token = data.data.token;
        }

        if (data && data.success === false) {
          const errText = data.error?.message || data.error || data.message || 'Operation unsuccessful';
          throw new APIError(String(errText), undefined, action);
        }

        return data as T;
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;

        // Authoritative business rejection codes (400, 401, 403, 409, 422) should abort failover.
        // But 404 (Not Found) on a static host like Vercel indicates missing route on static host, so continue failover!
        if (err instanceof APIError && err.status && [400, 401, 403, 409, 422].includes(err.status)) {
          throw err;
        }

        // If it's the last candidate or request was aborted, stop
        if (i === candidateUrls.length - 1) {
          break;
        }
      }
    }

    if (lastError instanceof APIError) throw lastError;
    throw new APIError(
      lastError instanceof Error ? lastError.message : 'Unable to connect to backend server. Please verify backend is online.',
      undefined,
      action
    );
  })().finally(() => {
    inFlightAPICalls.delete(requestKey);
  });

  inFlightAPICalls.set(requestKey, executionPromise);
  return executionPromise as Promise<T>;
}


