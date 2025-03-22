CREATE TABLE "user_onboarding" (
	"userId" text PRIMARY KEY NOT NULL,
	"has_completed_onboarding" integer DEFAULT 0 NOT NULL,
	"last_completed_step" integer DEFAULT -1 NOT NULL,
	"dismissed_at" timestamp,
	"completed_steps" json DEFAULT '[]'::json,
	"last_seen_at" timestamp DEFAULT now(),
	"onboarding_version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;