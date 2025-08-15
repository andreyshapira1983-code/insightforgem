import assert from "node:assert/strict";
import { run } from "./test-utils.js";

const modules = [
  { name: "stats", event: { httpMethod: "GET" } },
  { name: "news", event: { httpMethod: "GET" } },
  { name: "search", event: { httpMethod: "GET", rawQuery: "query=test" } },
  { name: "ideas", event: { httpMethod: "POST", body: "{}" } }
];

for (const m of modules) {
  const { handler } = await import(`../netlify/functions/${m.name}.js`);
  await run(`${m.name} function returns ok`, async () => {
    const res = await handler(m.event);
    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.ok, true);
  });
}
