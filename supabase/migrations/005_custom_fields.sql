-- supabase/migrations/005_custom_fields.sql

-- Field definitions: schema for each custom field per entity type
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN (
    'lead', 'customer', 'task', 'meeting', 'recording', 'whatsapp'
  )),
  name text NOT NULL,
  field_key text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN (
    'text', 'number', 'date', 'checkbox', 'dropdown',
    'multi_select', 'phone', 'url', 'file'
  )),
  options jsonb NOT NULL DEFAULT '{}',
  position integer NOT NULL DEFAULT 0,
  is_required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, field_key)
);

-- Field values: one row per (entity, field_definition)
CREATE TABLE IF NOT EXISTS custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN (
    'lead', 'customer', 'task', 'meeting', 'recording', 'whatsapp'
  )),
  field_def_id uuid NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  value_text text,
  value_number numeric,
  value_boolean boolean,
  value_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, field_def_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS custom_field_definitions_entity_type_idx
  ON custom_field_definitions(entity_type);
CREATE INDEX IF NOT EXISTS custom_field_values_entity_idx
  ON custom_field_values(entity_id, entity_type);

-- RLS
ALTER TABLE custom_field_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cfd_authenticated_read" ON custom_field_definitions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "cfd_authenticated_write" ON custom_field_definitions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cfv_authenticated_read" ON custom_field_values
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "cfv_authenticated_write" ON custom_field_values
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
