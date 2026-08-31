import { describe, it, expect, vi, afterEach } from "vitest";
import { ApiClient, createDefaultClient } from "./index";

describe("api", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not retry mutations by default", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 503 }));
    const client = new ApiClient({ baseUrl: "http://api", retries: 3 });

    const response = await client.post("/agents", { name: "agent" });

    expect(response.error?.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries GET requests when configured", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    const client = new ApiClient({ baseUrl: "http://api", retries: 1, retryDelayMs: 0 });

    const response = await client.get<{ ok: boolean }>("/health");

    expect(response.data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("suppresses session expiry notifications for auth bootstrap requests", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 401 }));
    const expired = vi.fn();
    window.addEventListener("eaip:session-expired", expired);
    const client = createDefaultClient({
      baseUrl: "http://api",
      tokenProvider: () => "token",
    });

    await client.get("/users/me", undefined, { suppressSessionExpired: true });

    expect(expired).not.toHaveBeenCalled();
    window.removeEventListener("eaip:session-expired", expired);
  });
});
