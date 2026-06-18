-- Enable RLS on all tables
alter table leads enable row level security;
alter table clients enable row level security;
alter table meetings enable row level security;
alter table recordings enable row level security;
alter table tasks enable row level security;
alter table whatsapp_logs enable row level security;
alter table partnerships enable row level security;

-- Policy: authenticated users can do everything
-- (role-based restrictions added later in Settings task)
create policy "authenticated_all" on leads
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on clients
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on meetings
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on recordings
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on tasks
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on whatsapp_logs
  for all using (auth.role() = 'authenticated');

create policy "authenticated_all" on partnerships
  for all using (auth.role() = 'authenticated');

-- Make API endpoint policy: service role bypasses RLS (for Make webhooks)
-- Service role key used in Make → automatically bypasses RLS
