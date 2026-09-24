const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";
function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}
export type ApiErrorPayload = {
  message: string;
  details?: unknown;
};
export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${normalizeBaseUrl(configuredApiBaseUrl)}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });
  const payload = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: T;
    error?: ApiErrorPayload;
  } | null;
  if (!response.ok) {
    if (payload?.error?.message) {
      throw new Error(payload.error.message);
    }
    throw new Error(`Request failed with status ${response.status}`);
  }
  return payload?.data as T;
}
