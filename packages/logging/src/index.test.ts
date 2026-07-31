import { describe, it, expect } from "vitest";
import { logger, log } from "./index";

describe("logger", () => {
  it("exports logger with all levels", () => {
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });
});

describe("log", () => {
  it("logs at debug level without throwing", () => {
    expect(() => {
      log("debug", "test");
    }).not.toThrow();
  });

  it("logs at error level without throwing", () => {
    expect(() => {
      log("error", "error msg", { code: 500 });
    }).not.toThrow();
  });
});
