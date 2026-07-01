const DEFAULT_API_BASE_URL = "";
const API_PREFIX = "/api";

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

export function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  return baseUrl.replace(/\/+$/, "");
}

export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl) {
    return normalizedPath;
  }

  const pathWithoutDuplicateApiPrefix =
    baseUrl.endsWith(API_PREFIX) && normalizedPath.startsWith(`${API_PREFIX}/`)
      ? normalizedPath.slice(API_PREFIX.length)
      : normalizedPath;

  return `${baseUrl}${pathWithoutDuplicateApiPrefix}`;
}

export async function parseApiError(response: Response) {
  try {
    const data = (await response.json()) as
      | { detail?: string; [key: string]: unknown }
      | null;
    if (data?.detail) return data.detail;

    if (data && typeof data === "object") {
      const fieldMessage = Object.values(data)
        .flatMap((value) => {
          if (Array.isArray(value)) return value;
          if (typeof value === "string") return [value];
          return [];
        })
        .find((value): value is string => typeof value === "string" && value.length > 0);

      if (fieldMessage) return fieldMessage;
    }
  } catch {
    // Ignore non-JSON errors and fall back to generic messages.
  }

  if (response.status >= 500) {
    return "Il backend non e' disponibile in questo momento.";
  }

  return "Richiesta non riuscita.";
}

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);
  const headers = {
    Accept: "application/json",
    ...(init?.headers ?? {}),
  };

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new ApiClientError(message, response.status);
  }

  return (await response.json()) as T;
}

export async function requestEmpty(path: string, init?: RequestInit) {
  const url = buildApiUrl(path);
  const headers = {
    Accept: "application/json",
    ...(init?.headers ?? {}),
  };

  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers,
  });

  if (!response.ok && response.status !== 204) {
    const message = await parseApiError(response);
    throw new ApiClientError(message, response.status);
  }
}
