-- Migration: Add status and updated_at columns to tasks table
-- Run manually in Supabase dashboard (SQL Editor)
-- Required by: src/hooks/use-tasks.ts (dbToTask mapper)

-- Add status column with valid values and default
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done'));

-- Backfill status from completed_at so existing data stays consistent
UPDATE tasks SET status = 'done' WHERE completed_at IS NOT NULL AND status = 'todo';

-- Add updated_at column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add assigned_to column if not already present (safe no-op if it exists)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to text;
