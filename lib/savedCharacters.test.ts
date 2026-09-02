import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSupabaseClient } from "./supabase/client";
import { updateCharacterTemplate } from "./savedCharacters";

vi.mock("./supabase/client", () => ({
  getSupabaseClient: vi.fn(),
}));

const mockedGetSupabaseClient = vi.mocked(getSupabaseClient);

describe("savedCharacters - updateCharacterTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates initiative and maxHp and returns the updated saved character", async () => {
    const singleMock = vi.fn().mockResolvedValue({
      data: {
        id: "char-1",
        name: "Legolas",
        max_hp: 45,
        initiative: 18,
        is_monster: false,
        icon: "🏹",
        memorized_spells: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
      },
      error: null,
    });

    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const eqMock = vi.fn().mockReturnValue({ select: selectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    const fromMock = vi.fn().mockReturnValue({ update: updateMock });

    mockedGetSupabaseClient.mockReturnValue({
      from: fromMock,
    } as never);

    const result = await updateCharacterTemplate("char-1", {
      maxHp: 45,
      initiative: 18,
    });

    expect(fromMock).toHaveBeenCalledWith("saved_characters");
    expect(updateMock).toHaveBeenCalledWith({
      max_hp: 45,
      initiative: 18,
    });
    expect(eqMock).toHaveBeenCalledWith("id", "char-1");
    expect(result).toEqual({
      id: "char-1",
      name: "Legolas",
      maxHp: 45,
      initiative: 18,
      isMonster: false,
      icon: "🏹",
      memorizedSpells: [],
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
    });
  });

  it("throws error when Supabase returns an error", async () => {
    const singleMock = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database update failed" },
    });

    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const eqMock = vi.fn().mockReturnValue({ select: selectMock });
    const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
    const fromMock = vi.fn().mockReturnValue({ update: updateMock });

    mockedGetSupabaseClient.mockReturnValue({
      from: fromMock,
    } as never);

    await expect(
      updateCharacterTemplate("char-1", { maxHp: 50 })
    ).rejects.toThrow("Database update failed");
  });
});
