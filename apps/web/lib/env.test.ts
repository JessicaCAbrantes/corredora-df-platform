import { afterEach, describe, expect, it } from "vitest";
import { env } from "./env";

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalApiUrl === undefined) {
    delete process.env.NEXT_PUBLIC_API_URL;
  } else {
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  }
  process.env.NODE_ENV = originalNodeEnv;
});

describe("env.apiUrl", () => {
  it("falls back to localhost:3001 in development when unset", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    process.env.NODE_ENV = "development";
    expect(env.apiUrl).toBe("http://localhost:3001");
  });

  it("falls back to localhost:3001 in test when unset", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    process.env.NODE_ENV = "test";
    expect(env.apiUrl).toBe("http://localhost:3001");
  });

  it("strips trailing slash", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com/";
    process.env.NODE_ENV = "development";
    expect(env.apiUrl).toBe("https://api.example.com");
  });

  it("returns configured URL without trailing slash", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.corredoradf.com";
    process.env.NODE_ENV = "production";
    expect(env.apiUrl).toBe("https://api.corredoradf.com");
  });

  it("throws in production when NEXT_PUBLIC_API_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    process.env.NODE_ENV = "production";
    expect(() => env.apiUrl).toThrow(/NEXT_PUBLIC_API_URL/);
  });

  it("throws in production when NEXT_PUBLIC_API_URL is blank", () => {
    process.env.NEXT_PUBLIC_API_URL = "   ";
    process.env.NODE_ENV = "production";
    expect(() => env.apiUrl).toThrow(/NEXT_PUBLIC_API_URL/);
  });
});
