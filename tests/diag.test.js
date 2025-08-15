// Запуск: npm test  (использует встроенный node + assert, без зависимостей)
import assert from "node:assert/strict";

// Загружаем модуль один раз: handler читает process.env во время вызова
const { handler } = await import("../netlify/functions/diag.js");

const run = async (name, fn) => {
  try {
    await fn();
    console.log("\u2713", name);
  } catch (e) {
    console.error("\u2717", name, e);
    process.exitCode = 1;
  }
};

await run("returns 200 when role key present", async () => {
  process.env.ROLES_JSON = '{"gen":["OPENAI_KEY_GEN"]}';
  process.env.ALLOW_FALLBACK = "false";
  delete process.env.FALLBACK_KEY_NAME;
  process.env.OPENAI_KEY_GEN = "DUMMY";
  delete process.env.OPENAI_API_KEY;

  const res = await handler({ httpMethod: "GET", rawQuery: "role=gen" });
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.equal(body.ok, true);
  assert.deepEqual(body.tried, ["OPENAI_KEY_GEN"]);
});

await run("falls back to OPENAI_API_KEY when allowed", async () => {
  process.env.ROLES_JSON = '{"gen":["OPENAI_KEY_GEN"]}';
  process.env.ALLOW_FALLBACK = "true";
  process.env.FALLBACK_KEY_NAME = "OPENAI_API_KEY";
  delete process.env.OPENAI_KEY_GEN;
  process.env.OPENAI_API_KEY = "FALLBACK";

  const res = await handler({ httpMethod: "GET", rawQuery: "role=gen" });
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.equal(body.ok, true);
  assert.ok(body.tried.includes("OPENAI_KEY_GEN"));
  assert.ok(body.tried.includes("OPENAI_API_KEY"));
});

await run("returns 503 when no key and fallback disabled", async () => {
  process.env.ROLES_JSON = '{"gen":["OPENAI_KEY_GEN"]}';
  process.env.ALLOW_FALLBACK = "false";
  delete process.env.FALLBACK_KEY_NAME;
  delete process.env.OPENAI_KEY_GEN;
  delete process.env.OPENAI_API_KEY;

  const res = await handler({ httpMethod: "GET", rawQuery: "role=gen" });
  assert.equal(res.statusCode, 503);
  const body = JSON.parse(res.body);
  assert.equal(body.ok, false);
});
