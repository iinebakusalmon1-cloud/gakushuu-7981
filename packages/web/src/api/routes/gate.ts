import { z } from "zod";
import { base } from "../__core/app";
import { hasGateSession, rememberGate } from "../gate-session";
import { verifyPortalTotp } from "../portal-totp";

export const gate = {
  session: base.handler(({ context }) => {
    const authenticated = hasGateSession(context.headers);
    return { authenticated, url: authenticated ? "https://alli-tube.runable.site/" : null };
  }),
  verify: base.input(z.object({ password: z.string().max(32) })).handler(async ({ input, context }) => {
    const result = await verifyPortalTotp(input.password);
    if (result.valid) rememberGate(context.headers);
    return result.valid
      ? { valid: true as const, url: "https://alli-tube.runable.site/", retryAfterSeconds: 0 }
      : { valid: false as const, url: null, retryAfterSeconds: result.retryAfterSeconds };
  }),
};