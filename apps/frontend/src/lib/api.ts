const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

function buildApiBaseCandidates() {
  const preferredBase = normalizeBaseUrl(configuredApiBaseUrl);
  const localhostBase = "http://localhost:5000/api/v1";

  return Array.from(new Set([preferredBase, localhostBase].filter(Boolean)));
}

export type ApiErrorPayload = {
  message: string;
  details?: unknown;
};

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  let lastError: unknown;

  for (const baseUrl of buildApiBaseCandidates()) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
        ...init,
      });

      const payload = await response.json().catch(() => null) as
        | { success?: boolean; data?: T; error?: ApiErrorPayload }
        | null;

      if (!response.ok) {
        if (payload?.error?.message) {
          throw new Error(payload.error.message);
        }

        lastError = new Error(`Request failed with status ${response.status}`);
        continue;
      }

      return payload?.data as T;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed");
}
