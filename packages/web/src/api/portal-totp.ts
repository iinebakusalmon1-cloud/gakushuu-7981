import { TOTP } from "otpauth";
import { eq } from "drizzle-orm";
import { db } from "./database";
import { portalGateState } from "./database/schema";

const gateId = "portal";
const failureLimit = 5;
const lockDuration = 5 * 60 * 1000;
let verificationQueue: Promise<unknown> = Promise.resolve();

export function createPortalTotp(secret = process.env.PORTAL_TOTP_SECRET) {
  if (!secret || !/^[A-Z2-7]{32}$/.test(secret)) {
    throw new Error("Portal authenticator is not configured");
  }
  return new TOTP({
    issuer: "School Portal",
    label: "学習支援ポータルサイト",
    secret,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });
}

export function verifyPortalTotp(token: string, now?: number) {
  // Avoid competing writes within this process. The DB transaction remains the
  // source of truth across processes, restarts and separate browser clients.
  const result = verificationQueue.then(() => verifyInDatabase(token, now));
  verificationQueue = result.catch(() => undefined);
  return result;
}

async function verifyInDatabase(token: string, now = Date.now()) {
  const totp = createPortalTotp();
  return db.transaction(async (tx) => {
    // This singleton gate has one shared secret, so the throttle is shared too.
    // The DB write transaction makes limits and one-use counters durable/atomic.
    await tx.insert(portalGateState).values({ id: gateId }).onConflictDoNothing();
    const [state] = await tx.select().from(portalGateState)
      .where(eq(portalGateState.id, gateId));
    if (state.lockedUntil > now) {
      return { valid: false, retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000) };
    }

    const delta = /^[0-9]{6}$/.test(token)
      ? totp.validate({ token, timestamp: now, window: 1, afterCounter: state.lastAcceptedStep })
      : null;
    if (delta !== null) {
      await tx.update(portalGateState).set({
        failedAttempts: 0,
        lockedUntil: 0,
        lastAcceptedStep: totp.counter({ timestamp: now }) + delta,
      }).where(eq(portalGateState.id, gateId));
      return { valid: true, retryAfterSeconds: 0 };
    }

    const failures = (state.lockedUntil > 0 ? 0 : state.failedAttempts) + 1;
    const lockedUntil = failures >= failureLimit ? now + lockDuration : 0;
    await tx.update(portalGateState).set({ failedAttempts: failures, lockedUntil })
      .where(eq(portalGateState.id, gateId));
    return { valid: false, retryAfterSeconds: lockedUntil ? lockDuration / 1000 : 0 };
  });
}