import { relations } from "drizzle-orm/relations";
import { user, userOnboarding, session, userSettings, conversation, account } from "./schema";

export const userOnboardingRelations = relations(userOnboarding, ({one}) => ({
	user: one(user, {
		fields: [userOnboarding.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	userOnboardings: many(userOnboarding),
	sessions: many(session),
	userSettings: many(userSettings),
	conversations: many(conversation),
	accounts: many(account),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(user, {
		fields: [userSettings.userId],
		references: [user.id]
	}),
}));

export const conversationRelations = relations(conversation, ({one}) => ({
	user: one(user, {
		fields: [conversation.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));