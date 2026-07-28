import type { CombatSnapshot, SavedCombat } from "@/types/combatSave";
import { getSupabaseClient } from "./supabase/client";

interface CombatSaveRow {
  id: string;
  name: string;
  snapshot: CombatSnapshot;
  saved_at: number;
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

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CombatSavesApiError";
    this.status = status;
  }
}

function toSavedCombat(row: CombatSaveRow): SavedCombat {
  return {
    id: row.id,
    name: row.name,
    savedAt: Number(row.saved_at),
    characters: row.snapshot.characters,
    currentTurnIndex: row.snapshot.currentTurnIndex,
    round: row.snapshot.round,
    isCombatStarted: row.snapshot.isCombatStarted,
    log: row.snapshot.log,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastAutosavedAt: row.last_autosaved_at,
  };
}

function throwDatabaseError(error: { message: string; code?: string } | null) {
  if (!error) return;

  if (error.code === "23505") {
    throw new CombatSavesApiError(
      "Un altro salvataggio attivo e' stato rilevato. Riprova."
    );
  }

  throw new CombatSavesApiError(error.message);
}

async function deactivateOtherSaves(excludedId?: string) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("combat_saves")
    .update({ is_active: false })
    .eq("is_active", true);

  if (excludedId) {
    query = query.neq("id", excludedId);
  }

  const { error } = await query;
  throwDatabaseError(error);
}

export async function listCombatSaves() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("combat_saves")
    .select(
      "id,name,snapshot,saved_at,is_active,created_at,updated_at,last_autosaved_at"
    )
    .order("saved_at", { ascending: false });

  throwDatabaseError(error);
  return ((data ?? []) as unknown as CombatSaveRow[]).map(toSavedCombat);
}

export async function createCombatSave(payload: CombatSavePayload) {
  const supabase = getSupabaseClient();
  const isActive = payload.activate ?? false;

  if (isActive) {
    await deactivateOtherSaves();
  }

  const { data, error } = await supabase
    .from("combat_saves")
    .insert({
      name: payload.name,
      snapshot: payload.snapshot,
      saved_at: Date.now(),
      is_active: isActive,
    })
    .select(
      "id,name,snapshot,saved_at,is_active,created_at,updated_at,last_autosaved_at"
    )
    .single();

  throwDatabaseError(error);
  return toSavedCombat(data as unknown as CombatSaveRow);
}

export async function updateCombatSave(
  id: string,
  payload: CombatSaveUpdatePayload
) {
  const supabase = getSupabaseClient();

  if (payload.activate) {
    await deactivateOtherSaves(id);
  }

  const update: Record<string, unknown> = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.snapshot !== undefined) {
    update.snapshot = payload.snapshot;
    update.saved_at = Date.now();
  }
  if (payload.activate !== undefined) update.is_active = payload.activate;

  const { data, error } = await supabase
    .from("combat_saves")
    .update(update)
    .eq("id", id)
    .select(
      "id,name,snapshot,saved_at,is_active,created_at,updated_at,last_autosaved_at"
    )
    .single();

  throwDatabaseError(error);
  return toSavedCombat(data as unknown as CombatSaveRow);
}

export async function deleteCombatSave(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("combat_saves").delete().eq("id", id);
  throwDatabaseError(error);
}

export async function restoreCombatSave(id: string) {
  return updateCombatSave(id, { activate: true });
}

export async function activateCombatSave(id: string) {
  return updateCombatSave(id, { activate: true });
}

export async function autosaveCombatSave(id: string, snapshot: CombatSnapshot) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("combat_saves")
    .update({
      snapshot,
      saved_at: Date.now(),
      is_active: true,
      last_autosaved_at: now,
    })
    .eq("id", id)
    .select(
      "id,name,snapshot,saved_at,is_active,created_at,updated_at,last_autosaved_at"
    )
    .single();

  throwDatabaseError(error);
  return toSavedCombat(data as unknown as CombatSaveRow);
}
