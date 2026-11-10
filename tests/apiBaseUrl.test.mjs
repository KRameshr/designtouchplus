import test from "node:test";
import assert from "node:assert/strict";
import { resolveApiBaseUrl } from "../lib/apiBaseUrl.js";

test("development defaults to the local Spring Boot API when no URL is set", () => {
  assert.equal(
    resolveApiBaseUrl({ apiUrl: "", nodeEnv: "development" }),
    "http://localhost:8080"
  );
});

test("development accepts an explicitly configured API URL", () => {
  assert.equal(
    resolveApiBaseUrl({
      apiUrl: "http://localhost:8080/",
      nodeEnv: "development",
    }),
    "http://localhost:8080"
  );
});

test("production uses the configured backend URL", () => {
  assert.equal(
    resolveApiBaseUrl({
      apiUrl: "https://designtouch-backend.onrender.com/",
      nodeEnv: "production",
    }),
    "https://designtouch-backend.onrender.com"
  );
});

test("production fails clearly when the API URL is missing", () => {
  assert.throws(
    () => resolveApiBaseUrl({ apiUrl: "", nodeEnv: "production" }),
    /NEXT_PUBLIC_API_URL must be set/
  );
});

test("production rejects localhost and loopback API URLs", () => {
  for (const apiUrl of [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://[::1]:8080",
  ]) {
    assert.throws(
      () => resolveApiBaseUrl({ apiUrl, nodeEnv: "production" }),
      /cannot point to localhost or a loopback address/
    );
  }
});
