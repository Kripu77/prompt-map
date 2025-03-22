import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  json,
} from "drizzle-orm/pg-core";

// NextAuth schema compatible with Drizzle
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// For storing user conversations
export const conversations = pgTable("conversation", {
  id: text("id").notNull().primaryKey(),
  userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  content: json("content"),
});

// For storing user onboarding state
export const userOnboarding = pgTable("user_onboarding", {
  userId: text("userId").notNull().primaryKey().references(() => users.id, { onDelete: "cascade" }),
  hasCompletedOnboarding: integer("has_completed_onboarding").default(0).notNull(),
  lastCompletedStep: integer("last_completed_step").default(-1).notNull(),
  dismissedAt: timestamp("dismissed_at"),
  completedSteps: json("completed_steps").$type<string[]>().default([]),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  onboardingVersion: integer("onboarding_version").default(1).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// For storing anonymous mindmap data (non-signed in users)
export const anonymousMindmaps = pgTable("anonymous_mindmap", {
  id: text("id").notNull().primaryKey(),
  sessionId: text("session_id").notNull(), // To track repeat anonymous users
  prompt: text("prompt").notNull(), // The original prompt
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  content: json("content"),
  userAgent: text("user_agent"), // Optional browser/device info
  referrer: text("referrer"), // Optional referrer info
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  conversations: many(conversations),
  onboarding: one(userOnboarding),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
}));

export const userOnboardingRelations = relations(userOnboarding, ({ one }) => ({
  user: one(users, {
    fields: [userOnboarding.userId],
    references: [users.id],
  }),
})); 