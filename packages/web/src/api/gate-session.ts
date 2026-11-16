import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { Hono } from "hono";

const cookieName = "youtube_gate_session";
const maxAge = 400 * 24 * 60 * 60;
const pendingCookies = new WeakMap<Headers, string>();

function signature(value: string) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("Session signing secret is not configured");
  return createHmac("sha256", secret).update(`youtube-gate-session:${value}`).digest("base64url");
}

export function rememberGate(headers: Headers) {
  const payload = Buffer.from(JSON.stringify({
    expires: Date.now() + maxAge * 1000,
    nonce: randomBytes(24).toString("base64url"),
  })).toString("base64url");
  pendingCookies.set(headers, `${payload}.${signature(payload)}`);
}

export function hasGateSession(headers: Headers) {
  const cookie = headers.get("cookie")?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!cookie || cookie.length > 1024) return false;
  const pieces = cookie.split(".");
  if (pieces.length !== 2) return false;
  const [payload, signed] = pieces;
  try {
    const actual = Buffer.from(signed);
    const expected = Buffer.from(signature(payload));
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof data.expires === "number" && data.expires > Date.now();
  } catch {
    return false;
  }
}

// Wrap the managed RPC app without modifying its template-owned context.
// A successful procedure schedules a cookie; the HTTP wrapper writes it.
export function withGateCookies(rpcApp: Hono) {
  const app = new Hono();
  app.use("*", async (c, next) => {
    await next();
    if (c.req.path.startsWith("/api/rpc/gate/")) c.header("Cache-Control", "no-store");
    const token = pendingCookies.get(c.req.raw.headers);
    pendingCookies.delete(c.req.raw.headers);
    if (!token || c.res.status >= 400) return;
    const secure = new URL(c.req.url).protocol === "https:"
      || c.req.header("x-forwarded-proto") === "https";
    c.header("Set-Cookie", `${cookieName}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; ${secure ? "Secure; SameSite=None; Partitioned" : "SameSite=Lax"}`, { append: true });
    c.header("Cache-Control", "no-store");
  });
  app.route("/", rpcApp);
  return app;
}