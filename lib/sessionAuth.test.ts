import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCurrentSession,
  signupWithSession,
} from "./sessionAuth";

const originalApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

describe("sessionAuth API URL building", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalApiBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
      return;
    }

    process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBaseUrl;
  });

  it("does not duplicate the /api prefix when Next rewrites are used", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "/api";

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ authenticated: false, user: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    await getCurrentSession();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/me/",
      expect.objectContaining({
        credentials: "include",
      })
    );
  });

  it("reuses an absolute backend base URL that already ends with /api", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://backend.example.com/api";

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ authenticated: false, user: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

    await getCurrentSession();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example.com/api/auth/me/",
      expect.any(Object)
    );
  });

  it("uses the corrected signup endpoint after fetching the CSRF token", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "/api";

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ csrfToken: "csrf-token" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            authenticated: true,
            user: {
              id: 1,
              username: "NuovoMaster",
              email: "",
            },
          }),
          {
            status: 201,
            headers: { "Content-Type": "application/json" },
          }
        )
      );

    await signupWithSession({
      username: "NuovoMaster",
      password: "StrongPassword123!",
      confirmPassword: "StrongPassword123!",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/auth/csrf/",
      expect.any(Object)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/auth/signup/",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-CSRFToken": "csrf-token",
        }),
      })
    );
  });
});
