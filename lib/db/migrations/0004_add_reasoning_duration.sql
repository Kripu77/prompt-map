-- Add reasoning_duration column to conversations table
ALTER TABLE "conversation" ADD COLUMN "reasoning_duration" integer;

-- Add comment to explain the column
COMMENT ON COLUMN "conversation"."reasoning_duration" IS 'Duration of AI reasoning process in seconds';