import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSupabaseClient } from "./supabase/client";
import {
  getCurrentSession,
  loginWithSession,
  SessionApiError,
  signupWithSession,
} from "./sessionAuth";

vi.mock("./supabase/client", () => ({
  getSupabaseClient: vi.fn(),
}));

const mockedGetSupabaseClient = vi.mocked(getSupabaseClient);

function buildClient() {
  return {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  };
}

describe("Supabase session auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps the persisted Supabase session to the app user", async () => {
    const client = buildClient();
    client.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "user-123",
            email: "master@example.com",
            user_metadata: { username: "Master" },
          },
        },
      },
      error: null,
    });
    mockedGetSupabaseClient.mockReturnValue(client as never);

    await expect(getCurrentSession()).resolves.toEqual({
      authenticated: true,
      user: {
        id: "user-123",
        email: "master@example.com",
        username: "Master",
      },
    });
  });

  it("uses email and password for login", async () => {
    const client = buildClient();
    client.auth.signInWithPassword.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "user-456",
            email: "hero@example.com",
            user_metadata: {},
          },
        },
      },
      error: null,
    });
    mockedGetSupabaseClient.mockReturnValue(client as never);

    const response = await loginWithSession(" hero@example.com ", "secret");

    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "hero@example.com",
      password: "secret",
    });
    expect(response.user?.username).toBe("hero");
  });

  it("rejects a signup when password confirmation does not match", async () => {
    const client = buildClient();
    mockedGetSupabaseClient.mockReturnValue(client as never);

    await expect(
      signupWithSession({
        username: "Master",
        email: "master@example.com",
        password: "one-password",
        confirmPassword: "another-password",
      })
    ).rejects.toBeInstanceOf(SessionApiError);

    expect(client.auth.signUp).not.toHaveBeenCalled();
  });

  it("reports when email confirmation is required", async () => {
    const client = buildClient();
    client.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: "user-789",
          email: "new@example.com",
          user_metadata: { username: "NewMaster" },
        },
        session: null,
      },
      error: null,
    });
    mockedGetSupabaseClient.mockReturnValue(client as never);

    await expect(
      signupWithSession({
        username: "NewMaster",
        email: "new@example.com",
        password: "StrongPassword123!",
        confirmPassword: "StrongPassword123!",
      })
    ).resolves.toEqual({
      authenticated: false,
      requiresEmailConfirmation: true,
      user: null,
    });
  });
});
