import { pickKey } from "./openai-keys.js";

export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "content-type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: "invalid json" };
  }

  const role = body.purpose || body.role;
  if (!role) {
    return { statusCode: 400, headers, body: "role required" };
  }

  const keyName = pickKey({ role });
  if (!keyName) {
    return { statusCode: 503, headers, body: "no key for role" };
  }

  const payload = { ...body };
  delete payload.purpose;
  delete payload.role;

  let usedKey = keyName;
  let res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env[keyName]}`,
    },
    body: JSON.stringify(payload),
  });

  let data = await res.json().catch(() => ({}));

  if (
    res.status === 429 ||
    (data && data.error && data.error.code === "insufficient_quota")
  ) {
    const fbName = process.env.FALLBACK_KEY_NAME;
    if (
      process.env.ALLOW_FALLBACK === "true" &&
      fbName &&
      process.env[fbName]
    ) {
      usedKey = fbName;
      res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env[fbName]}`,
        },
        body: JSON.stringify(payload),
      });
      data = await res.json().catch(() => ({}));
    } else {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: "quota exceeded" }),
      };
    }
  }

  headers["Content-Type"] = "application/json";
  if (process.env.DEBUG_KEYS === "true") {
    headers["X-Key-Name"] = usedKey;
  }

  return { statusCode: res.status, headers, body: JSON.stringify(data) };
}
