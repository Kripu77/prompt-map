CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"show_reasoning" boolean DEFAULT true NOT NULL,
	"mindmap_mode" text DEFAULT 'lite' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "reasoning_duration" integer;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;