CREATE TABLE "anonymous_mindmap" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"prompt" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"content" json,
	"user_agent" text,
	"referrer" text
);
--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "reasoning" text;