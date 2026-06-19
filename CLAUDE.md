# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (currently on port 3007)
npm run build        # Production build
npm run lint         # ESLint
```

**Important:** Do NOT use `--turbopack` flag — it crashes on Hebrew characters in the directory path. Use `npx next dev` (webpack mode) instead.

No test framework is configured yet.

## Architecture

Next.js App Router CRM with dual-language i18n (Hebrew RTL + English LTR), shadcn/ui components, and mock data (no backend).

### Routing

All routes live under `src/app/[locale]/` where `[locale]` is `he` or `en`. The `(crm)` route group wraps all CRM pages in a shared shell (sidebar + header + mobile nav):

```
src/app/[locale]/layout.tsx          # Root: html dir/lang, font, NextIntlClientProvider
src/app/[locale]/page.tsx            # Redirects to /{locale}/dashboard
src/app/[locale]/(crm)/layout.tsx    # CRM shell: Sidebar, Header, MobileNav
src/app/[locale]/(crm)/dashboard/
src/app/[locale]/(crm)/leads/
src/app/[locale]/(crm)/leads/[id]/     # Lead detail card (contact, tasks, interactions)
src/app/[locale]/(crm)/customers/
src/app/[locale]/(crm)/customers/[id]/
src/app/[locale]/(crm)/tasks/          # Tasks hub (list, kanban, calendar, timeline views)
src/app/[locale]/(crm)/calendar/       # Calendar with Google/Outlook/Apple sync
src/app/[locale]/(crm)/products/
src/app/[locale]/(crm)/quotes/
src/app/[locale]/(crm)/quotes/[id]/   # Quote builder (edit line items, status, send via email)
src/app/[locale]/(crm)/finance/
src/app/[locale]/(crm)/forms/          # Web forms (create, manage, view responses)
src/app/[locale]/(crm)/automations/    # Automations hub (webhooks, API keys, automation builder)
src/app/[locale]/(crm)/settings/       # Settings (profile, branding, user management)
src/app/[locale]/quote/[id]/           # Public quote page (outside CRM shell, read-only for clients)
src/app/[locale]/form/[id]/            # Public form page (outside CRM shell, shareable questionnaire)
```

### i18n System

- **Library:** `next-intl` v4 — configured in `src/i18n/request.ts`, middleware in `src/middleware.ts`
- **Config:** `src/i18n/config.ts` — locales, defaultLocale (`he`), direction map
- **Messages:** `src/i18n/messages/he.json` and `en.json` — flat namespace structure (`nav.*`, `dashboard.*`, `leads.*`, `customers.*`, `products.*`, `quotes.*`, `finance.*`, `tasks.*`, `interactions.*`, `automations.*`, `calendar.*`, `settings.*`, `common.*`)
- **RTL:** The root layout sets `dir="rtl"` or `dir="ltr"` on `<html>` based on locale. Use logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) instead of physical (`ml-*`, `mr-*`) for bidirectional support.
- **In components:** Use `useTranslations("namespace")` in client components, `getTranslations("namespace")` in server components.

### Theme

Custom vibrant oklch color theme in `src/app/globals.css` with light and dark modes. Key semantic colors:
- `--primary`: purple-blue (oklch 0.45 0.2 260)
- `--secondary`: green (oklch 0.50 0.15 160)
- `--warning`: amber (oklch 0.55 0.15 70)
- `--destructive`: red (oklch 0.55 0.2 25)
- `--success` and `--warning` are custom additions beyond the standard shadcn palette

### Design System — Vibrant UI

All CRM pages use a unified vibrant design language. Key patterns:

**Hero Header (all pages):**
- Unified blue gradient: `bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700`
- Decorative blur blobs: `bg-white/10` (top-end) and `bg-sky-400/20` (bottom-start)
- Page icon in: `h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm`
- Title: `text-2xl font-extrabold tracking-tight` (white)
- Subtitle: `text-white/70 text-sm`
- Outline buttons in header: `bg-white/15 border-white/20 text-white backdrop-blur-sm hover:bg-white/25`
- Primary button in header: `bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-lg`

**Page Icons (per page):**
- Dashboard: `LayoutDashboard` | Leads: `Users` | Customers: `UserCheck` | Tasks: `CheckSquare` | Calendar: `CalendarDays` | Products: `Package`
- Quotes: `FileText` | Finance: `Wallet` | Forms: `ClipboardList` | Automations: `Zap` | Settings: `Settings`

**Stats Cards:**
- Gradient backgrounds per semantic color (violet, rose, amber, emerald, sky)
- Icon badge: `h-8 w-8 rounded-xl bg-{color}-500/15` with `h-4 w-4 text-{color}-600` icon
- Value: `text-2xl font-extrabold text-{color}-700 dark:text-{color}-300`

**Tables:**
- Header: gradient from `blue-500/10` with `border-b-2 border-blue-200`
- Header text: `font-bold text-blue-800 dark:text-blue-300`
- Row hover: `hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50`
- Colorful avatars with hash-based color assignment from palette
- Pipeline values: gradient text `from-emerald-600 to-teal-600 bg-clip-text text-transparent`

**Filter Bar:**
- Wrapped in rounded card with `bg-gradient-to-r from-slate-50 to-gray-50`
- Emerald-themed icon badge and search field
- Filter chips: `bg-emerald-100` with `border-emerald-200`

**Heat Badges (leads):**
- Hot: `from-rose-100 to-red-100` gradient with rose border
- Warm: `from-amber-100 to-orange-100` gradient with amber border
- Cold: `from-sky-100 to-blue-100` gradient with sky border

**Content Cards:**
- `rounded-2xl border bg-card p-5 shadow-sm`
- Section headers: icon badge + bold title
- Semantic colors per section (sky for customer, orange for line items, amber for dates, violet for totals, emerald for links)

**All pages** wrap content in `<div className="space-y-6 pb-10">` and do NOT use the PageHeader component (inline hero header instead).

### Component Library

shadcn/ui with `base-nova` style (uses `@base-ui/react`, NOT Radix). Config in `components.json`. UI primitives in `src/components/ui/`. Add new components via `npx shadcn@latest add <component>`.

**Important:** `SelectValue` in base-ui does NOT auto-render labels like Radix. You must pass children with explicit label mapping:
```tsx
<SelectValue>
  {{ draft: t("statusDraft"), sent: t("statusSent") }[value]}
</SelectValue>
```

### Data Layer

All data is mock — no backend, no database. Types in `src/lib/types.ts`, mock data in `src/lib/mock-data.ts`. All entities persist to `localStorage` via custom hooks.

### Key Hooks

- `src/hooks/use-leads.ts` — Lead CRUD with localStorage persistence
- `src/hooks/use-leads-filter.ts` — Lead filtering by heat level
- `src/hooks/use-customers.ts` — Customer CRUD with localStorage persistence
- `src/hooks/use-products.ts` — Product catalog CRUD with localStorage persistence
- `src/hooks/use-quotes.ts` — Quote CRUD with localStorage persistence
- `src/hooks/use-tasks.ts` — Task CRUD with localStorage persistence (key: `crm-tasks`). Provides: `tasks, addTask, updateTask, deleteTask, getTasksForLead, getTasksForCustomer`
- `src/hooks/use-interactions.ts` — Interaction CRUD with localStorage persistence (key: `crm-interactions`). Provides: `interactions, addInteraction, deleteInteraction, getInteractionsForEntity`
- `src/hooks/use-calendar.ts` — Calendar events CRUD + sync state with localStorage persistence (keys: `crm-calendar-events`, `crm-calendar-sync`)
- `src/hooks/use-branding.ts` — Branding settings (company name, email, logo, colors) with localStorage persistence (key: `crm-branding`)
- `src/hooks/use-user-profile.ts` — User profile (name, phone, email, company, tax ID) with localStorage persistence (key: `crm-user-profile`)
- `src/hooks/use-crm-users.ts` — User management CRUD with role-based permissions (key: `crm-users`)
- `src/hooks/use-automations.ts` — Webhooks, API keys, and automations CRUD with localStorage persistence (keys: `crm-webhooks`, `crm-api-keys`, `crm-automations`)

### Key Utilities

- `src/lib/utils.ts` — `cn()` (class merge), `formatCurrency()` (ILS), `formatDate()`, `getInitials()`
- `src/lib/navigation.ts` — Nav item definitions with lucide icons (mainNavItems + bottomNavItems including Settings)
- `src/lib/types.ts` — All TypeScript interfaces (Lead, Customer, Product, Quote, QuoteLineItem, BrandingSettings, etc.)
- `src/lib/mock-data.ts` — Mock data for all entities

### Tasks System

Tasks can be created from the Tasks page (`/tasks`), from a lead detail card (`/leads/[id]`), or from a customer detail card (`/customers/[id]`).
- **Task fields:** title, description, priority (low/medium/high), status (todo/in_progress/done), due date, due time (שעת יעד), linked lead, linked customer
- **View modes:** List (default), Kanban (drag & drop between columns), Calendar (month grid), Timeline (grouped by date sections: overdue/today/this week/later/no date)
- **Status cycling:** Click the circle icon on a task to cycle through todo → in_progress → done
- **Kanban drag & drop:** Drag tasks between todo/in_progress/done columns to change status. Visual drop targets with column highlighting
- **Pre-linking:** When creating from a lead/customer card, the entity is pre-linked via `initialLeadId`/`initialCustomerId` props
- **Hook:** `useTasks()` from `src/hooks/use-tasks.ts`
- **Storage key:** `crm-tasks` in localStorage
- **Components:** `src/components/tasks/task-dialog.tsx`, `task-kanban.tsx`, `task-calendar.tsx`, `task-timeline.tsx`

### Interactions System

Interaction logs appear on lead detail cards (`/leads/[id]`) and customer detail cards (`/customers/[id]`).
- **Interaction fields:** content (text area), createdAt (auto), createdBy (auto — "אני")
- **Shared component:** `src/components/shared/interaction-log.tsx` — props: `entityType`, `entityId`, `locale`
- **Hook:** `useInteractions()` from `src/hooks/use-interactions.ts`
- **Storage key:** `crm-interactions` in localStorage

### Automations System

The CRM includes an Automations hub (`/automations`) with three tabs (automations first, then webhooks, then API keys):
- **Automation Builder** — Visual builder with trigger → action flow. Triggers are grouped into events and advanced:
  - **Event triggers:** `lead_created`, `lead_updated`, `lead_converted`, `customer_created`, `quote_sent`, `quote_signed`, `deal_won`, `deal_lost`
  - **Advanced triggers:** `field_changed` (with entity/field/value config), `scheduled` (daily/weekly/monthly/custom with time), `button_click` (with label config)
  - **Actions:** `update_field` (entity/field/value), `create_instance` (lead/customer/task/quote), `create_field` (name/type), `send_email` (to/subject/body), `send_webhook` (URL/method), `create_task`, `notify`
  - Each action has a distinct color: amber (update_field), violet (create_instance), indigo (create_field), sky (send_email), emerald (send_webhook), blue (create_task), rose (notify)
  - Visual flow display: blue trigger badge → colored action badges with arrows
  - Dialog uses blue "כש..." trigger section and green "אז..." action section with connector arrow
- **Webhooks** — Create and manage webhook endpoints (name, URL, HTTP method, active/inactive toggle). Toggle on/off, edit, delete.
- **API Keys** — Store encrypted API keys for external services (Make.com, Zapier, OpenAI, etc.). Keys are base64-encoded client-side (demo only; production should use server-side encryption). Only last 4 chars shown as preview.
- **Hook:** `useWebhooks()`, `useApiKeys()`, `useAutomations()` from `src/hooks/use-automations.ts`
- **Storage keys:** `crm-webhooks`, `crm-api-keys`, `crm-automations` in localStorage
- **Components:** `src/components/automations/` — `webhook-dialog.tsx`, `api-key-dialog.tsx`, `automation-dialog.tsx`
- **Types:** `Webhook`, `ApiKey`, `Automation`, `AutomationStep`, `AutomationTrigger`, `AutomationAction`, `AutomationTriggerConfig`, `AutomationActionConfig` in `src/lib/types.ts`

### Web Forms System

Web forms page (`/forms`) for creating shareable questionnaires and documents:
- **Form builder** — Dialog with title, description, and visual field editor. Supports 9 field types: text, textarea, number, email, phone, select, checkbox, date, rating
- **Field configuration** — Each field has label, placeholder, required toggle. Select/checkbox fields support comma-separated options
- **Form status** — draft → active → closed. Only active forms accept submissions
- **Copy link** — Copies public URL (`/{locale}/form/{id}`) for sharing with clients
- **Public form page** (`/form/[id]`) — Branded form outside the CRM shell. Uses branding colors/logo. Shows thank-you screen after submission
- **Responses** — View all responses in-CRM with respondent name/email, timestamp, and all answers
- **Stats** — Total forms, active forms, total responses shown in hero section
- **Hook:** `useForms()` and `useFormResponses()` from `src/hooks/use-forms.ts`
- **Storage keys:** `crm-forms`, `crm-form-responses` in localStorage
- **Types:** `WebForm`, `WebFormField`, `WebFormFieldType`, `WebFormStatus`, `WebFormResponse` in `src/lib/types.ts`
- **Components:** `src/components/forms/form-builder-dialog.tsx`, `form-responses.tsx`

### Calendar System

Calendar page (`/calendar`) with month view, event CRUD, and external sync:
- **Event types:** meeting, call, task, reminder, other — each with distinct color/icon
- **Event fields:** title, date, start/end time, all-day toggle, type, notes, linked lead/customer
- **Calendar sync:** Google Calendar, Outlook, Apple Calendar — toggle connect/disconnect (mock, UI-ready for real OAuth)
- **Sidebar:** sync status cards + upcoming events list
- **Hook:** `useCalendar()` from `src/hooks/use-calendar.ts`
- **Storage keys:** `crm-calendar-events`, `crm-calendar-sync` in localStorage
- **Types:** `CalendarEvent`, `CalendarEventType`, `CalendarSync`, `CalendarSyncProvider` in `src/lib/types.ts`

### Settings System

The Settings page (`/settings`) has three tabs:
- **Profile** — User details: full name, phone, email, company name, company ID (ח"פ), address, website. Hook: `useUserProfile()` from `src/hooks/use-user-profile.ts`. Storage key: `crm-user-profile`
- **Branding** — Company name, contact email, logo upload (dataURL), primary & secondary colors with preview. Hook: `useBranding()`. Storage key: `crm-branding`. Default: AP Automations, primary `#4338ca`, secondary `#0d9488`
- **Users** — User management with role-based permissions (admin/manager/agent/viewer). Each role has default permissions for leads, customers, quotes, finance, settings (full/readonly/none). Hook: `useCrmUsers()` from `src/hooks/use-crm-users.ts`. Storage key: `crm-users`. Types: `CrmUser`, `CrmUserRole`, `CrmUserPermissions`, `PermissionLevel`

### Quotes System

- **Quote builder** (`/quotes/[id]`) — edit line items from product catalog, set status, notes, terms, valid-until date, VAT toggle
- **VAT toggle** — `quote.includeVat` (boolean, defaults to `true`). When off, tax row hides and total excludes VAT
- **Send via email** — "שלח במייל" button opens `mailto:` with customer email, quote link, and branded message
- **Shareable link** — copies public URL (`/{locale}/quote/{id}`) after marking status as "sent"
- **Public quote page** (`/quote/[id]`) — read-only branded template for clients. No signature, no back button. Uses branding colors/logo from localStorage
- **Dynamic sections** — Replaces static notes/terms. `QuoteSectionsEditor` component with add/remove/reorder sections, template save/load/edit/delete via `useSectionTemplates()` hook
- **Totals calculation** — `computeTotals(items, taxRate, includeVat, globalDiscount)` in the quote builder page
- **Global discount** — `quote.globalDiscount` (percentage) applied after line-item discounts

### Customer Profiles

- **Lifecycle Roadmap removed** — was removed per user request. Component file (`lifecycle-roadmap.tsx`) still exists but is unused
- **Sentiment meter removed** — was artificial data with no real source. Component file (`sentiment-meter.tsx`) still exists but is unused
- **Metric cards** — 2 cards: lifetime value (computed from signed quotes) and close time (computed from lead creation to conversion date). Growth rate and health grade removed.
- **Related quotes** — shown on customer detail page

### Lead Detail

- **Convert to Customer** — "המר ללקוח" button in hero header. Creates a customer from lead data, marks lead as "converted", navigates to the new customer profile.
- **Deal value** — shows "שווי עסקה משוער" (estimated) from `pipelineValue`, and "שווי עסקה" (actual) from signed linked quotes.
- **Linked quotes** — shows count of quotes linked to this lead's customer ID

## Known Issues

**Turbopack Hebrew path crash:** If the project directory path contains Hebrew characters, Turbopack panics with a byte boundary error. Keep the full filesystem path ASCII-only. This is an upstream Turbopack bug.

**Middleware deprecation:** Next.js 16 warns that "middleware" convention is deprecated in favor of "proxy". The current `src/middleware.ts` still works but will need migration.

**Pre-existing type errors:**
- `quotes/[id]/page.tsx` — Select `onValueChange` type mismatch (base-ui Select passes extra `eventDetails` arg)
- `quote-form-dialog.tsx` — Same Select type issue
- `use-quotes-search.ts` — Quote to `Record<string, unknown>` conversion
