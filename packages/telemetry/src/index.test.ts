import { describe, it, expect } from "vitest";
import { setTelemetryClient, getTelemetryClient } from "./index";

describe("telemetry", () => {
  it("provides a default noop client", () => {
    const client = getTelemetryClient();
    expect(client).toBeDefined();
    expect(() => {
      client.track({ name: "test" });
    }).not.toThrow();
    expect(() => {
      client.pageView("/");
    }).not.toThrow();
    expect(() => {
      client.identify("user-1");
    }).not.toThrow();
  });

  it("allows setting a custom client", () => {
    const custom = {
      track: () => {
        /* noop */
      },
      pageView: () => {
        /* noop */
      },
      identify: () => {
        /* noop */
      },
    };
    setTelemetryClient(custom);
    expect(getTelemetryClient()).toBe(custom);
  });
});
