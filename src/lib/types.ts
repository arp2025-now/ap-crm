export type HeatLevel = "hot" | "warm" | "cold";

export type { FieldDefinition, FieldOption, FieldType } from "./field-definitions";

export type LeadStatus = string;

export type DocumentStatus = "draft" | "sent" | "signed";

export type InvoiceStatus = "paid" | "pending" | "overdue";

export type UserRole = "admin" | "agent";

export interface Profile {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  serialNumber?: number;
  name: string;
  phone: string;
  email: string;
  company: string;
  industry: string;
  assignedAgentId: string;
  tags: string[];
  avatarUrl?: string;
  sentimentScore: number;
  lifetimeValue: number;
  healthGrade: string;
  lifecycleStage: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  convertedFromLeadId?: string;
  convertedAt?: string;
  customFields?: Record<string, string | number | null>;
}

export interface Lead {
  id: string
  serialNumber?: number
  customerName: string        // maps to DB: full_name
  customerEmail?: string      // maps to DB: email
  phone?: string
  company?: string
  status: string              // pipeline stage name (e.g., "מתעניין")
  source?: string
  heatLevel: HeatLevel        // maps to DB: heat_level
  pipelineValue: number       // maps to DB: pipeline_value
  aiScore?: number            // maps to DB: ai_score
  notes?: string
  assignedAgentId?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  lastContactAt?: string
  customerId?: string
  customFields?: Record<string, string | number | null>
}

export interface PipelineStage {
  id: string
  name: string
  nameHe?: string   // optional alias kept for backward compat
  color: string
  order: number     // maps to DB: position
}

export interface Document {
  id: string;
  type: string;
  status: DocumentStatus;
  fileUrl: string;
  leadId: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
}

// ── Finance ──

export type IncomeCategory = "service" | "product" | "consulting" | "subscription" | "other";
export type ExpenseCategory = "payroll" | "software" | "marketing" | "office" | "travel" | "professional" | "equipment" | "other";
export type FinanceStatus = "pending" | "completed" | "cancelled";
export type Currency = "ILS" | "USD" | "EUR" | "GBP";

export interface IncomeRecord {
  id: string;
  amount: number;
  currency?: Currency;
  date: string;
  description: string;
  category: IncomeCategory;
  linkedLeadId?: string;
  linkedCustomerId?: string;
  linkedQuoteId?: string;
  paymentMethod?: string;
  invoiceNumber?: string;
  status: FinanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  currency?: Currency;
  date: string;
  description: string;
  category: ExpenseCategory;
  vendor?: string;
  receiptFileName?: string;
  paymentMethod?: string;
  invoiceNumber?: string;
  status: FinanceStatus;
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: "monthly" | "quarterly" | "yearly";
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudget {
  id: string;
  month: string; // "2026-05"
  incomeTarget: number;
  expenseBudget: number;
  categoryBudgets: Partial<Record<ExpenseCategory, number>>;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  contactCount: number;
  totalValue: number;
  lastActivityAt: string;
  logoUrl?: string;
}

export interface ActivityItem {
  id: string;
  type: "email" | "call" | "meeting" | "note" | "deal";
  title: string;
  description: string;
  timestamp: string;
  customerId?: string;
}

export interface DashboardStats {
  hotLeads: number;
  hotLeadsTrend: number;
  conversionRate: number;
  revenuePipeline: number;
  activeDeals: number;
}

export type QuoteStatus = "draft" | "sent" | "signed" | "expired";

export interface Product {
  id: string;
  serialNumber: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  sku: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  customFields: Record<string, string | number | null>;
}

export interface QuoteSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface QuoteSectionTemplate {
  id: string;
  name: string;
  sections: Omit<QuoteSection, "id" | "order">[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteLineItem {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Quote {
  id: string;
  serialNumber: number;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  status: QuoteStatus;
  lineItems: QuoteLineItem[];
  subtotal: number;
  globalDiscount: number;
  discountTotal: number;
  includeVat: boolean;
  taxRate: number;
  taxAmount: number;
  total: number;
  validUntil: string;
  notes: string;
  terms: string;
  sections?: QuoteSection[];
  signatureDataUrl?: string;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  customFields: Record<string, string | number | null>;
}

// ── Tasks ──

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  linkedLeadId?: string;
  linkedLeadName?: string;
  linkedCustomerId?: string;
  linkedCustomerName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// ── Interactions ──

export interface Interaction {
  id: string;
  entityType: "lead" | "customer";
  entityId: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface BrandingSettings {
  companyName: string;
  contactEmail: string;
  logoDataUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}

// ── User Profile ──

export interface UserProfile {
  fullName: string;
  phone: string;
  email: string;
  companyName: string;
  companyId: string;
  address: string;
  website: string;
}

// ── User Management ──

export type CrmUserRole = "admin" | "manager" | "agent" | "viewer";
export type PermissionLevel = "full" | "readonly" | "none";

export interface CrmUserPermissions {
  leads: PermissionLevel;
  customers: PermissionLevel;
  quotes: PermissionLevel;
  finance: PermissionLevel;
  settings: PermissionLevel;
}

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  role: CrmUserRole;
  active: boolean;
  permissions: CrmUserPermissions;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
}

// ── Calendar Events ──

export type CalendarEventType = "meeting" | "call" | "task" | "reminder" | "other";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  type: CalendarEventType;
  notes?: string;
  linkedLeadId?: string;
  linkedLeadName?: string;
  linkedCustomerId?: string;
  linkedCustomerName?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export type CalendarSyncProvider = "google" | "outlook" | "apple";

export interface CalendarSync {
  provider: CalendarSyncProvider;
  connected: boolean;
  lastSyncAt?: string;
  email?: string;
}

// ── Web Forms ──

export type WebFormFieldType = "text" | "textarea" | "number" | "email" | "phone" | "select" | "checkbox" | "date" | "rating";

export interface WebFormField {
  id: string;
  type: WebFormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select/checkbox
  order: number;
  // Advanced config
  defaultValue?: string | number | boolean;
  // Text fields
  minLength?: number;
  maxLength?: number;
  // Textarea
  rows?: number; // 2-10
  // Number fields
  numberThousandsSeparator?: boolean;
  numberDecimalPlaces?: number; // 0-4
  // Phone
  phoneCountry?: string; // country code e.g. "IL", "US"
  // Date
  dateDefaultToday?: boolean;
  // Rating
  ratingMax?: number; // 3, 5, or 10
  // Select
  selectMultiple?: boolean;
}

export type WebFormStatus = "draft" | "active" | "closed";

export interface WebForm {
  id: string;
  title: string;
  description: string;
  fields: WebFormField[];
  status: WebFormStatus;
  linkedLeadId?: string;
  linkedLeadName?: string;
  linkedCustomerId?: string;
  linkedCustomerName?: string;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebFormResponse {
  id: string;
  formId: string;
  answers: Record<string, string | number | boolean | string[]>;
  respondentName?: string;
  respondentEmail?: string;
  submittedAt: string;
}

// ── Automations ──

export type WebhookMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface Webhook {
  id: string;
  name: string;
  url: string;
  method: WebhookMethod;
  headers: Record<string, string>;
  active: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  service: string;
  keyPreview: string; // last 4 chars only
  encryptedKey: string; // base64 "encrypted" (client-side mock)
  createdAt: string;
}

export type AutomationTrigger =
  | "lead_created"
  | "lead_updated"
  | "lead_converted"
  | "customer_created"
  | "quote_sent"
  | "quote_signed"
  | "deal_won"
  | "deal_lost"
  | "field_changed"
  | "scheduled"
  | "button_click"
  | "payment_received"
  | "invoice_overdue"
  | "budget_exceeded"
  | "expense_created";

export type AutomationAction =
  | "send_webhook"
  | "send_email"
  | "update_field"
  | "create_task"
  | "notify"
  | "create_instance"
  | "create_field"
  | "sync_accounting"
  | "create_invoice"
  | "send_whatsapp";

export type AutomationConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "is_empty"
  | "is_not_empty";

export interface AutomationCondition {
  field: string;
  operator: AutomationConditionOperator;
  value?: string;
}

export interface AutomationTriggerConfig {
  // field_changed
  entity?: string;    // "lead" | "customer" | "quote"
  field?: string;     // which field
  fromValue?: string;
  toValue?: string;
  // lead_updated — watch only specific fields
  watchedFields?: string[];
  // scheduled
  scheduleType?: "daily" | "weekly" | "monthly" | "custom";
  scheduleTime?: string; // HH:mm
  scheduleDays?: string; // comma-separated days
  cronExpression?: string;
  // button_click
  buttonLabel?: string;
  buttonColor?: string;
  // conditions / filters — run only when all pass
  conditions?: AutomationCondition[];
}

export interface AutomationActionConfig {
  // update_field
  entity?: string;
  field?: string;
  value?: string;
  // create_instance
  instanceType?: string; // "lead" | "customer" | "task" | "quote"
  instanceData?: Record<string, string>;
  // create_field (placeholder for dynamic field creation)
  fieldName?: string;
  fieldType?: string; // "text" | "number" | "date" | "select"
  // send_email
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
  // send_webhook
  webhookUrl?: string;
  webhookMethod?: string;
  // create_task
  taskTitle?: string;
  taskDescription?: string;
  taskDue?: string;
  taskAssignee?: string;
  // notify
  message?: string;
  // send_whatsapp
  whatsappTemplateName?: string;
  whatsappTemplateLanguage?: string;
  whatsappPhoneField?: string;
  // general dynamic key access
  [key: string]: string | Record<string, string> | undefined;
}

export interface AutomationStep {
  id: string;
  action: AutomationAction;
  config: AutomationActionConfig;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  triggerConfig?: AutomationTriggerConfig;
  steps: AutomationStep[];
  active: boolean;
  lastRunAt?: string;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Meetings & Recordings ──

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled'
export type MeetingType = 'היכרות' | 'אפיון' | 'פולואפ' | 'אחר'

export interface Meeting {
  id: string
  leadId?: string
  clientId?: string
  type: MeetingType | string
  scheduledAt: string
  durationMin?: number
  status: MeetingStatus
  meetLink?: string
  location?: string
  googleEventId?: string
  createdAt: string
}

export interface Recording {
  id: string
  meetingId?: string
  leadId?: string
  clientId?: string
  source: 'fathom' | 'fireflies' | string
  externalId?: string
  externalLink?: string
  title?: string
  summary?: string
  transcript?: string
  actionItems?: string
  participants?: string
  durationMin?: number
  recordedAt: string
}

// ── WhatsApp ──

export type WhatsappDirection = 'in' | 'out'
export type WhatsappSource = 'bot' | 'manual'

export interface WhatsappLog {
  id: string
  leadId?: string
  clientId?: string
  phone: string
  direction: WhatsappDirection
  message: string
  sentAt: string
  source: WhatsappSource
}

// ── Activity Logs ──

export type LogAction = "create" | "update" | "delete" | "convert" | "status_change" | "send" | "import" | "export";
export type LogEntityType = "lead" | "customer" | "quote" | "task" | "form" | "automation" | "webhook" | "product" | "calendar_event" | "interaction" | "system";

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: LogAction;
  entityType: LogEntityType;
  entityId: string;
  entityName: string;
  details?: string;
  changes?: Record<string, { from?: string | number | null; to?: string | number | null }>;
  userId: string;
  userName: string;
}
