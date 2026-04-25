import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export type Plan = "free" | "pro" | "business";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  businessName: text("business_name"),
  // Auto-derived: businessName if non-empty, else firstName.
  // Always non-null and always shown to the user across the app.
  displayName: text("display_name").notNull(),
  plan: text("plan").$type<Plan>().notNull().default("free"),
  emailVerified: boolean("email_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiresAt: timestamp("verification_token_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
