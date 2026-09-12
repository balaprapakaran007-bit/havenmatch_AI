/**
 * HAVENMATCH AI — Centralized API Client
 * Connects to MongoDB Atlas backend engine with auto-failover to SNS Workbench webhook.
 */

const ENDPOINTS = [
  (import.meta as any).env?.VITE_MATCH_WEBHOOK_URL || 'http://localhost:5000/webhook/havenmatch/match',
  'https://api.agents.snsihub.ai/webhook/havenmatch/match'
];

const TIMEOUT_MS = 6000;
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
    let lastError: Error | null = null;

    for (const endpoint of ENDPOINTS) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ action, ...payload }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          let errorMsg = `Request failed (${response.status})`;
          try {
            const parsed = JSON.parse(errorText);
            if (parsed.error) errorMsg = parsed.error;
          } catch { /* ignore */ }
          throw new APIError(errorMsg, response.status, action);
        }

        const text = await response.text();
        if (!text || text.trim() === '') {
          throw new APIError('Empty response from server', undefined, action);
        }

        let data: unknown;
        try {
          data = JSON.parse(text);
        } catch {
          throw new APIError('Invalid JSON response from server', undefined, action);
        }

        const dataObj = data as Record<string, unknown>;
        if (dataObj.success === false && dataObj.error) {
          throw new APIError(String(dataObj.error), undefined, action);
        }

        return data as T;
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastError = err;
        // Continue to next endpoint in list if network or timeout error
        if (err instanceof APIError && err.status && err.status >= 400 && err.status < 500) {
          // Validation/Auth error from server: throw immediately
          throw err;
        }
      }
    }

    if (lastError instanceof APIError) throw lastError;
    throw new APIError(
      lastError instanceof Error ? lastError.message : 'Unable to connect to backend server. Please ensure backend is running.',
      undefined,
      action
    );
  })().finally(() => {
    inFlightAPICalls.delete(requestKey);
  });

  inFlightAPICalls.set(requestKey, executionPromise);
  return executionPromise as Promise<T>;
}


