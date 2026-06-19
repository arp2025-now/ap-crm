-- Add pipeline_stages table (replaces fixed CHECK constraint)
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position integer NOT NULL,
  color text DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now()
);

-- Insert default Hebrew stages
INSERT INTO pipeline_stages (name, position, color) VALUES
  ('מתעניין', 1, '#6366f1'),
  ('שיחת היכרות', 2, '#8b5cf6'),
  ('שיחת אפיון', 3, '#ec4899'),
  ('הצעת מחיר', 4, '#f59e0b'),
  ('הצעת מחיר חתומה', 5, '#10b981'),
  ('לקוח', 6, '#059669')
ON CONFLICT DO NOTHING;

-- RLS on pipeline_stages
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_read" ON pipeline_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_write" ON pipeline_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Update leads.status to free text (remove fixed Hebrew check constraint)
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Add missing columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS heat_level text DEFAULT 'cold' CHECK (heat_level IN ('hot', 'warm', 'cold'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_value numeric DEFAULT 0;

-- Add missing columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS assigned_agent_id text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS sentiment_score numeric DEFAULT 5;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lifetime_value numeric DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS health_grade text DEFAULT 'B';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'active';
