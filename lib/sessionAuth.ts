const DEFAULT_API_BASE_URL = "https://combattrackerhermes-backend.onrender.com";

export interface SessionUser {
  id: number;
  username: string;
  email: string;
}

interface SessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
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

async function parseError(response: Response) {
  try {
    const data = (await response.json()) as { detail?: string } | null;
    if (data?.detail) return data.detail;
  } catch {
    // Ignore non-JSON errors and fall back to generic messages.
  }

  if (response.status >= 500) {
    return "Il backend non e' disponibile in questo momento.";
  }

  return "Richiesta non riuscita.";
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
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

export async function logoutSession() {
  const csrfToken = await getCsrfToken();
  const response = await fetch(`${getApiBaseUrl()}/api/auth/logout/`, {
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
