import { pgTable, foreignKey, text, integer, timestamp, json, boolean, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const userOnboarding = pgTable("user_onboarding", {
	userId: text().primaryKey().notNull(),
	hasCompletedOnboarding: integer("has_completed_onboarding").default(0).notNull(),
	lastCompletedStep: integer("last_completed_step").default(sql`'-1'`).notNull(),
	dismissedAt: timestamp("dismissed_at", { mode: 'string' }),
	completedSteps: json("completed_steps").default([]),
	lastSeenAt: timestamp("last_seen_at", { mode: 'string' }).defaultNow(),
	onboardingVersion: integer("onboarding_version").default(1).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_onboarding_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const session = pgTable("session", {
	sessionToken: text().primaryKey().notNull(),
	userId: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const anonymousMindmap = pgTable("anonymous_mindmap", {
	id: text().primaryKey().notNull(),
	sessionId: text("session_id").notNull(),
	prompt: text().notNull(),
	title: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	content: json(),
	userAgent: text("user_agent"),
	referrer: text(),
});

export const userSettings = pgTable("user_settings", {
	userId: text("user_id").primaryKey().notNull(),
	showReasoning: boolean("show_reasoning").default(true).notNull(),
	mindmapMode: text("mindmap_mode").default('lite').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_settings_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const conversation = pgTable("conversation", {
	id: text().primaryKey().notNull(),
	userId: text(),
	title: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	content: json(),
	reasoning: text(),
	reasoningDuration: integer("reasoning_duration"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "conversation_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const verificationToken = pgTable("verificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verificationToken_identifier_token_pk"}),
]);

export const account = pgTable("account", {
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.provider, table.providerAccountId], name: "account_provider_providerAccountId_pk"}),
]);
