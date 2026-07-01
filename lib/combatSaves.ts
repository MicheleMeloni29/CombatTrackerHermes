import type { CombatSnapshot, SavedCombat } from "@/types/combatSave";
import { ApiClientError, requestEmpty, requestJson } from "./apiClient";
import { getCsrfToken } from "./sessionAuth";

const COMBATS_LOG_PREFIX = "[combats]";

interface CombatSaveApiResponse {
  id: string;
  name: string;
  savedAt: number;
  characters: SavedCombat["characters"];
  currentTurnIndex: number;
  round: number;
  isCombatStarted: boolean;
  log: SavedCombat["log"];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_autosaved_at: string | null;
}

interface CombatSavePayload {
  name: string;
  snapshot: CombatSnapshot;
  activate?: boolean;
}

interface CombatSaveUpdatePayload {
  name?: string;
  snapshot?: CombatSnapshot;
  activate?: boolean;
}

export class CombatSavesApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "CombatSavesApiError";
    this.status = status;
  }
}

function logCombats(level: "info" | "warn" | "error", message: string, details?: unknown) {
  if (details === undefined) {
    console[level](COMBATS_LOG_PREFIX, message);
    return;
  }

  console[level](COMBATS_LOG_PREFIX, message, details);
}

function toSavedCombat(response: CombatSaveApiResponse): SavedCombat {
  return {
    id: response.id,
    name: response.name,
    savedAt: response.savedAt,
    characters: response.characters,
    currentTurnIndex: response.currentTurnIndex,
    round: response.round,
    isCombatStarted: response.isCombatStarted,
    log: response.log,
    isActive: response.is_active,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
    lastAutosavedAt: response.last_autosaved_at,
  };
}

async function requestCombatJson<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? "GET";
  logCombats("info", "HTTP request start", { method, path });

  try {
    const data = await requestJson<T>(path, init);
    logCombats("info", "HTTP request success", { method, path });
    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      logCombats("warn", "HTTP request application failure", {
        method,
        path,
        status: error.status,
        message: error.message,
      });
      throw new CombatSavesApiError(error.message, error.status);
    }

    logCombats("error", "HTTP request network failure", {
      method,
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function requestCombatMutation<T>(path: string, init?: RequestInit): Promise<T> {
  const csrfToken = await getCsrfToken();
  const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": csrfToken,
    ...(init?.headers ?? {}),
  };

  return requestCombatJson<T>(path, {
    ...init,
    headers,
  });
}

export async function listCombatSaves() {
  const data = await requestCombatJson<CombatSaveApiResponse[]>("/api/combats/", {
    method: "GET",
  });

  return data.map(toSavedCombat);
}

export async function createCombatSave(payload: CombatSavePayload) {
  const data = await requestCombatMutation<CombatSaveApiResponse>("/api/combats/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return toSavedCombat(data);
}

export async function updateCombatSave(id: string, payload: CombatSaveUpdatePayload) {
  const data = await requestCombatMutation<CombatSaveApiResponse>(`/api/combats/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return toSavedCombat(data);
}

export async function deleteCombatSave(id: string) {
  const csrfToken = await getCsrfToken();

  try {
    await requestEmpty(`/api/combats/${id}/`, {
      method: "DELETE",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    });
    logCombats("info", "HTTP request success", {
      method: "DELETE",
      path: `/api/combats/${id}/`,
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw new CombatSavesApiError(error.message, error.status);
    }
    throw error;
  }
}

export async function restoreCombatSave(id: string) {
  const data = await requestCombatMutation<CombatSaveApiResponse>(`/api/combats/${id}/restore/`, {
    method: "POST",
  });

  return toSavedCombat(data);
}

export async function activateCombatSave(id: string) {
  const data = await requestCombatMutation<CombatSaveApiResponse>(`/api/combats/${id}/activate/`, {
    method: "POST",
  });

  return toSavedCombat(data);
}

export async function autosaveCombatSave(id: string, snapshot: CombatSnapshot) {
  const data = await requestCombatMutation<CombatSaveApiResponse>(`/api/combats/${id}/autosave/`, {
    method: "POST",
    body: JSON.stringify({ snapshot }),
  });

  return toSavedCombat(data);
}
