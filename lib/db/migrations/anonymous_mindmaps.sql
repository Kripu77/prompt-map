-- Create table for anonymous mindmap data
CREATE TABLE IF NOT EXISTS "anonymous_mindmap" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "session_id" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "content" JSONB,
  "user_agent" TEXT,
  "referrer" TEXT
);

-- Create an index on session_id for faster lookups
CREATE INDEX IF NOT EXISTS "anonymous_mindmap_session_id_idx" ON "anonymous_mindmap" ("session_id"); 