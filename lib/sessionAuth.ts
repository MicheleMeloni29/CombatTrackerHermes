const DEFAULT_API_BASE_URL = "";
const API_PREFIX = "/api";

export interface SessionUser {
  id: number;
  username: string;
  email: string;
}

interface SessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
}

interface SignupPayload {
  username: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

interface CsrfResponse {
  csrfToken: string;
}

export class SessionApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "SessionApiError";
    this.status = status;
  }
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  return baseUrl.replace(/\/+$/, "");
}

function buildApiUrl(path: string) {
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

async function parseError(response: Response) {
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

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new SessionApiError(await parseError(response), response.status);
  }

  return (await response.json()) as T;
}

export async function getCsrfToken() {
  const data = await requestJson<CsrfResponse>("/api/auth/csrf/", {
    method: "GET",
  });
  return data.csrfToken;
}

export async function getCurrentSession() {
  return requestJson<SessionResponse>("/api/auth/me/", {
    method: "GET",
  });
}

export async function loginWithSession(username: string, password: string) {
  const csrfToken = await getCsrfToken();

  return requestJson<SessionResponse>("/api/auth/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({ username, password }),
  });
}

export async function signupWithSession(payload: SignupPayload) {
  const csrfToken = await getCsrfToken();

  return requestJson<SessionResponse>("/api/auth/signup/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(payload),
  });
}

export async function logoutSession() {
  const csrfToken = await getCsrfToken();
  const response = await fetch(buildApiUrl("/api/auth/logout/"), {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-CSRFToken": csrfToken,
    },
  });

  if (!response.ok && response.status !== 204) {
    throw new SessionApiError(await parseError(response), response.status);
  }
}
