import {
  ApiClientError,
  buildApiUrl,
  parseApiError,
  requestJson,
} from "./apiClient";

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

async function requestAuthJson<T>(path: string, init?: RequestInit): Promise<T> {
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

  try {
    const data = await requestJson<T>(path, init);
    logAuth("info", "HTTP request response", {
      method,
      path,
      url,
      status: 200,
      ok: true,
    });
    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      logAuth("warn", "HTTP request application failure", {
        method,
        path,
        url,
        status: error.status,
        message: error.message,
      });
      throw new SessionApiError(error.message, error.status);
    }

    logAuth("error", "HTTP request network failure", {
      method,
      path,
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function getCsrfToken() {
  const data = await requestAuthJson<CsrfResponse>("/api/auth/csrf/", {
    method: "GET",
  });
  logAuth("info", "CSRF token fetched", {
    path: "/api/auth/csrf/",
    tokenPresent: Boolean(data.csrfToken),
  });
  return data.csrfToken;
}

export async function getCurrentSession() {
  return requestAuthJson<SessionResponse>("/api/auth/me/", {
    method: "GET",
  });
}

export async function loginWithSession(username: string, password: string) {
  logAuth("info", "Login attempt start", {
    username: maskUsername(username),
  });
  const csrfToken = await getCsrfToken();

  return requestAuthJson<SessionResponse>("/api/auth/login/", {
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

  return requestAuthJson<SessionResponse>("/api/auth/signup/", {
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
    const message = await parseApiError(response);
    logAuth("warn", "Logout application failure", {
      path: "/api/auth/logout/",
      url,
      status: response.status,
      message,
    });
    throw new SessionApiError(message, response.status);
  }
}
