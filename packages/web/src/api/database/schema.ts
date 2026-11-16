import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const portalGateState = sqliteTable("portal_gate_state", {
  id: text("id").primaryKey(),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: integer("locked_until").notNull().default(0),
  lastAcceptedStep: integer("last_accepted_step").notNull().default(-1),
});

/**
 * Define your database schema here, then apply it with `bun run db:push`
 * (from packages/web). Re-export any generated schema from this file
 * (e.g. Better Auth's auth-schema.ts) so drizzle generates complete migrations.
 * Table patterns and conventions: skills/app/references/api.md
 */
