import type { CharacterInput, MemorizedSpell } from "@/types/character";
import type { SavedCharacter } from "@/types/savedCharacter";
import { getSupabaseClient } from "./supabase/client";

interface SavedCharacterRow {
  id: string;
  name: string;
  max_hp: number;
  initiative: number;
  is_monster: boolean;
  icon: string;
  memorized_spells: MemorizedSpell[];
  created_at: string;
  updated_at: string;
}

function toSavedCharacter(row: SavedCharacterRow): SavedCharacter {
  return {
    id: row.id,
    name: row.name,
    maxHp: row.max_hp,
    initiative: row.initiative,
    isMonster: row.is_monster,
    icon: row.icon,
    memorizedSpells: Array.isArray(row.memorized_spells)
      ? row.memorized_spells
      : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function throwDatabaseError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function listSavedCharacters() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("saved_characters")
    .select(
      "id,name,max_hp,initiative,is_monster,icon,memorized_spells,created_at,updated_at"
    )
    .order("updated_at", { ascending: false });

  throwDatabaseError(error);
  return ((data ?? []) as unknown as SavedCharacterRow[]).map(toSavedCharacter);
}

export async function saveCharacterTemplate(
  userId: string,
  character: CharacterInput
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("saved_characters")
    .upsert(
      {
        user_id: userId,
        name: character.name.trim(),
        max_hp: character.maxHp,
        initiative: character.initiative,
        is_monster: character.isMonster,
        icon: character.icon,
        memorized_spells: character.memorizedSpells ?? [],
      },
      {
        onConflict: "user_id,name,is_monster,max_hp",
      }
    )
    .select(
      "id,name,max_hp,initiative,is_monster,icon,memorized_spells,created_at,updated_at"
    )
    .single();

  throwDatabaseError(error);
  return toSavedCharacter(data as unknown as SavedCharacterRow);
}

export async function updateCharacterTemplate(
  id: string,
  updates: Partial<
    Pick<
      SavedCharacter,
      "name" | "maxHp" | "initiative" | "isMonster" | "icon" | "memorizedSpells"
    >
  >
) {
  const supabase = getSupabaseClient();
  const payload: Record<string, unknown> = {};

  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.maxHp !== undefined) payload.max_hp = updates.maxHp;
  if (updates.initiative !== undefined) payload.initiative = updates.initiative;
  if (updates.isMonster !== undefined) payload.is_monster = updates.isMonster;
  if (updates.icon !== undefined) payload.icon = updates.icon;
  if (updates.memorizedSpells !== undefined) {
    payload.memorized_spells = updates.memorizedSpells;
  }

  const { data, error } = await supabase
    .from("saved_characters")
    .update(payload)
    .eq("id", id)
    .select(
      "id,name,max_hp,initiative,is_monster,icon,memorized_spells,created_at,updated_at"
    )
    .single();

  throwDatabaseError(error);
  return toSavedCharacter(data as unknown as SavedCharacterRow);
}

export async function deleteCharacterTemplate(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("saved_characters").delete().eq("id", id);
  throwDatabaseError(error);
}

