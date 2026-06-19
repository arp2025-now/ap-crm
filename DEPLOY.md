# Deploy Guide — AP CRM

## Step 1: Run SQL Migrations in Supabase

Open your Supabase project → SQL Editor and run these files in order:

1. `supabase/migrations/003_pipeline_stages.sql`
2. `supabase/migrations/004_tasks_status.sql`
3. `supabase/migrations/005_custom_fields.sql`

(Migrations 001 and 002 should already be applied from initial setup.)

## Step 2: Set Environment Variables in Vercel

In your Vercel project → Settings → Environment Variables, add:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret) |
| `WEBHOOK_SECRET` | Secret token for Make.com webhook (optional) |
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://your-app.vercel.app` |

All values are found in your Supabase project dashboard under Settings → API.

## Step 3: Deploy

**Option A — Vercel CLI:**

```bash
npm i -g vercel
vercel --prod
```

**Option B — GitHub integration (recommended):**

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects Next.js — no build config needed.
4. Add the environment variables from Step 2.
5. Click Deploy.

## Smoke Test

After deploy, open the production URL. Expected behaviour:

- Root `/` redirects to `/he/login`
- Login with your Supabase credentials → pipeline Kanban loads

Test the Make.com webhook:

```bash
curl -X POST https://your-app.vercel.app/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{"full_name":"Test Lead","phone":"0509999999","source":"מייק"}'
```

Expected: `201` response and the lead appears in the pipeline.
