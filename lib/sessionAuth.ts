const DEFAULT_API_BASE_URL = "";
const API_PREFIX = "/api";
const AUTH_LOG_PREFIX = "[auth]";

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

function logAuth(level: "info" | "warn" | "error", message: string, details?: unknown) {
  if (details === undefined) {
    console[level](AUTH_LOG_PREFIX, message);
    return;
  }

  console[level](AUTH_LOG_PREFIX, message, details);
}

function maskUsername(username: string) {
  const normalized = username.trim();

  if (!normalized) {
    return "";
  }

  if (normalized.length <= 2) {
    return `${normalized[0] ?? ""}*`;
  }

  return `${normalized.slice(0, 2)}***`;
}

function describeHeaders(headers?: HeadersInit) {
  if (!headers) {
    return {};
  }

  const normalizedEntries = Object.entries(headers as Record<string, string>).map(
    ([key, value]) => {
      if (key.toLowerCase() === "x-csrftoken") {
        return [key, value ? "[present]" : "[missing]"];
      }

      return [key, value];
    }
  );

  return Object.fromEntries(normalizedEntries);
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
  const url = buildApiUrl(path);
  const method = init?.method ?? "GET";
  const headers = {
    Accept: "application/json",
    ...(init?.headers ?? {}),
  };

  logAuth("info", "HTTP request start", {
    method,
    path,
    url,
    headers: describeHeaders(headers),
  });

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      credentials: "include",
      headers,
    });
  } catch (error) {
    logAuth("error", "HTTP request network failure", {
      method,
      path,
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  logAuth("info", "HTTP request response", {
    method,
    path,
    url,
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    const message = await parseError(response);
    logAuth("warn", "HTTP request application failure", {
      method,
      path,
      url,
      status: response.status,
      message,
    });
    throw new SessionApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export async function getCsrfToken() {
  const data = await requestJson<CsrfResponse>("/api/auth/csrf/", {
    method: "GET",
  });
  logAuth("info", "CSRF token fetched", {
    path: "/api/auth/csrf/",
    tokenPresent: Boolean(data.csrfToken),
  });
  return data.csrfToken;
}

export async function getCurrentSession() {
  return requestJson<SessionResponse>("/api/auth/me/", {
    method: "GET",
  });
}

export async function loginWithSession(username: string, password: string) {
  logAuth("info", "Login attempt start", {
    username: maskUsername(username),
  });
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
  logAuth("info", "Signup attempt start", {
    username: maskUsername(payload.username),
    hasEmail: Boolean(payload.email?.trim()),
  });
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
  const url = buildApiUrl("/api/auth/logout/");
  logAuth("info", "Logout attempt start", {
    path: "/api/auth/logout/",
    url,
  });

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-CSRFToken": csrfToken,
      },
    });
  } catch (error) {
    logAuth("error", "Logout network failure", {
      path: "/api/auth/logout/",
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }

  logAuth("info", "Logout response", {
    method: "POST",
    path: "/api/auth/logout/",
    url,
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok && response.status !== 204) {
    const message = await parseError(response);
    logAuth("warn", "Logout application failure", {
      path: "/api/auth/logout/",
      url,
      status: response.status,
      message,
    });
    throw new SessionApiError(message, response.status);
  }
}
