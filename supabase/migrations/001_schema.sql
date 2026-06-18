-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- LEADS
create table leads (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text,
  email text,
  source text,
  status text not null default 'מתעניין'
    check (status in ('מתעניין','שיחת היכרות','שיחת אפיון','הצעת מחיר','הצעת מחיר חתומה','לקוח')),
  ai_score integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CLIENTS (converted from leads)
create table clients (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id),
  full_name text not null,
  phone text,
  email text,
  company text,
  created_at timestamptz not null default now()
);

-- MEETINGS
create table meetings (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id),
  client_id uuid references clients(id),
  type text not null check (type in ('היכרות','אפיון','פולואפ','אחר')),
  scheduled_at timestamptz not null,
  duration_min integer,
  status text not null default 'מתוכננת'
    check (status in ('מתוכננת','התקיימה','בוטלה')),
  google_event_id text,
  meet_link text,
  location text,
  created_at timestamptz not null default now()
);

-- RECORDINGS
create table recordings (
  id uuid primary key default uuid_generate_v4(),
  meeting_id uuid references meetings(id),
  lead_id uuid references leads(id),
  client_id uuid references clients(id),
  source text not null check (source in ('fathom','fireflies')),
  external_id text,
  external_link text,
  title text,
  summary text,
  transcript text,
  action_items text,
  participants text,
  duration_min integer,
  recorded_at timestamptz,
  created_at timestamptz not null default now()
);

-- TASKS
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  details text,
  due_at timestamptz,
  completed_at timestamptz,
  assigned_to uuid references auth.users(id),
  priority text default 'בינוני'
    check (priority in ('גבוה','בינוני','נמוך')),
  -- all nullable — null = general task
  lead_id uuid references leads(id),
  client_id uuid references clients(id),
  meeting_id uuid references meetings(id),
  project_id uuid,  -- reserved for Phase 2
  created_at timestamptz not null default now()
);

-- WHATSAPP LOGS
create table whatsapp_logs (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id),
  client_id uuid references clients(id),
  phone text not null,
  direction text not null check (direction in ('in','out')),
  message text not null,
  source text not null check (source in ('bot','manual')),
  sent_at timestamptz not null default now()
);

-- PARTNERSHIPS
create table partnerships (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text,
  email text,
  type text,
  notes text,
  created_at timestamptz not null default now()
);

-- Auto-update updated_at on leads
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- Indexes
create index leads_status_idx on leads(status);
create index leads_phone_idx on leads(phone);
create index meetings_lead_id_idx on meetings(lead_id);
create index recordings_lead_id_idx on recordings(lead_id);
create index tasks_lead_id_idx on tasks(lead_id);
create index whatsapp_logs_phone_idx on whatsapp_logs(phone);
