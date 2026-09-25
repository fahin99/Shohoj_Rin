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
    // Server errors may contain implementation details (database constraints,
    // provider responses, and so on). Callers log the original response in
    // development when needed, but UI code must use its translated fallback.
    throw new Error("Request failed");
  }
  return payload?.data as T;
}
