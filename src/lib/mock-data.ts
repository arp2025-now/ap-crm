import type {
  Lead, Customer, PipelineStage, Invoice,
  Account, ActivityItem, DashboardStats, Product, Quote,
} from "./types";

export const defaultPipelineStages: PipelineStage[] = [
  { id: "new", name: "New Lead", nameHe: "ליד חדש", color: "#3b82f6", order: 0 },
  { id: "contacted", name: "Contacted", nameHe: "נוצר קשר", color: "#8b5cf6", order: 1 },
  { id: "qualified", name: "Qualified", nameHe: "מוסמך", color: "#f59e0b", order: 2 },
  { id: "proposal", name: "Proposal Sent", nameHe: "הצעה נשלחה", color: "#06b6d4", order: 3 },
  { id: "negotiation", name: "Negotiation", nameHe: "משא ומתן", color: "#f97316", order: 4 },
  { id: "won", name: "Won", nameHe: "נסגר בהצלחה", color: "#10b981", order: 5 },
  { id: "lost", name: "Lost", nameHe: "אבוד", color: "#ef4444", order: 6 },
];

export const mockCustomers: Customer[] = [
  {
    id: "cust-1", serialNumber: 1, name: "יוסי כהן", phone: "+972-50-1234567",
    email: "yossi@techvision.co.il", company: "TechVision Systems",
    industry: "טכנולוגיה", assignedAgentId: "agent-1",
    tags: ["Enterprise", "Cloud"], avatarUrl: undefined,
    sentimentScore: 8.9, lifetimeValue: 142000, healthGrade: "A+",
    lifecycleStage: "active", createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z", createdBy: "system", updatedBy: "system",
  },
  {
    id: "cust-2", serialNumber: 2, name: "שרה לוי", phone: "+972-52-9876543",
    email: "sarah@nexus.io", company: "Nexus Digital",
    industry: "שיווק דיגיטלי", assignedAgentId: "agent-1",
    tags: ["SMB", "Marketing"], avatarUrl: undefined,
    sentimentScore: 7.2, lifetimeValue: 45000, healthGrade: "B+",
    lifecycleStage: "onboarding", createdAt: "2023-06-20T10:00:00Z",
    updatedAt: "2023-06-20T10:00:00Z", createdBy: "system", updatedBy: "system",
  },
  {
    id: "cust-3", serialNumber: 3, name: "דוד מזרחי", phone: "+972-54-5551234",
    email: "david@logistix.com", company: "Logistix Corp",
    industry: "לוגיסטיקה", assignedAgentId: "agent-2",
    tags: ["Enterprise", "Logistics"], avatarUrl: undefined,
    sentimentScore: 5.4, lifetimeValue: 28000, healthGrade: "C",
    lifecycleStage: "prospect", createdAt: "2024-02-10T10:00:00Z",
    updatedAt: "2024-02-10T10:00:00Z", createdBy: "system", updatedBy: "system",
  },
  {
    id: "cust-4", serialNumber: 4, name: "נועה ברק", phone: "+972-53-7778888",
    email: "noa@fintech.net", company: "FinTech Global",
    industry: "פינטק", assignedAgentId: "agent-1",
    tags: ["Enterprise", "Finance"], avatarUrl: undefined,
    sentimentScore: 9.1, lifetimeValue: 210000, healthGrade: "A+",
    lifecycleStage: "active", createdAt: "2022-11-05T10:00:00Z",
    updatedAt: "2022-11-05T10:00:00Z", createdBy: "system", updatedBy: "system",
  },
  {
    id: "cust-5", serialNumber: 5, name: "אמיר חסן", phone: "+972-50-3334444",
    email: "amir@buildco.co.il", company: "BuildCo",
    industry: "בנייה", assignedAgentId: "agent-2",
    tags: ["SMB", "Construction"], avatarUrl: undefined,
    sentimentScore: 6.8, lifetimeValue: 35000, healthGrade: "B",
    lifecycleStage: "contacted", createdAt: "2024-08-01T10:00:00Z",
    updatedAt: "2024-08-01T10:00:00Z", createdBy: "system", updatedBy: "system",
  },
];

export const mockLeads: Lead[] = [
  {
    id: "lead-1", serialNumber: 1, customerId: "cust-1", customerName: "יוסי כהן",
    phone: "+972-50-1234567", customerEmail: "yossi@techvision.co.il", company: "TechVision Systems",
    status: "proposal", heatLevel: "hot", pipelineValue: 45000,
    assignedAgentId: "agent-1", lastContactAt: "2026-05-21T08:00:00Z",
    createdAt: "2026-04-01T10:00:00Z", updatedAt: "2026-05-21T08:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
  {
    id: "lead-2", serialNumber: 2, customerId: "cust-2", customerName: "שרה לוי",
    phone: "+972-52-9876543", customerEmail: "sarah@nexus.io", company: "Nexus Digital",
    status: "qualified", heatLevel: "warm", pipelineValue: 12800,
    assignedAgentId: "agent-1", lastContactAt: "2026-05-20T14:00:00Z",
    createdAt: "2026-04-15T10:00:00Z", updatedAt: "2026-05-20T14:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
  {
    id: "lead-3", serialNumber: 3, customerId: "cust-3", customerName: "דוד מזרחי",
    phone: "+972-54-5551234", customerEmail: "david@logistix.com", company: "Logistix Corp",
    status: "contacted", heatLevel: "cold", pipelineValue: 3200,
    assignedAgentId: "agent-2", lastContactAt: "2026-05-16T10:00:00Z",
    createdAt: "2026-05-01T10:00:00Z", updatedAt: "2026-05-16T10:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
  {
    id: "lead-4", serialNumber: 4, customerId: "cust-4", customerName: "נועה ברק",
    phone: "+972-53-7778888", customerEmail: "noa@fintech.net", company: "FinTech Global",
    status: "negotiation", heatLevel: "hot", pipelineValue: 82000,
    assignedAgentId: "agent-1", lastContactAt: "2026-05-21T09:30:00Z",
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-05-21T09:30:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
  {
    id: "lead-5", serialNumber: 5, customerId: "cust-5", customerName: "אמיר חסן",
    phone: "+972-50-3334444", customerEmail: "amir@buildco.co.il", company: "BuildCo",
    status: "new", heatLevel: "warm", pipelineValue: 18500,
    assignedAgentId: "agent-2", lastContactAt: "2026-05-19T16:00:00Z",
    createdAt: "2026-05-10T10:00:00Z", updatedAt: "2026-05-19T16:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
  {
    id: "lead-6", serialNumber: 6, customerId: "cust-1", customerName: "יוסי כהן",
    phone: "+972-50-1234567", customerEmail: "yossi@techvision.co.il", company: "TechVision Systems",
    status: "won", heatLevel: "hot", pipelineValue: 67000,
    assignedAgentId: "agent-1", lastContactAt: "2026-05-18T11:00:00Z",
    createdAt: "2026-02-01T10:00:00Z", updatedAt: "2026-05-18T11:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
  {
    id: "lead-7", serialNumber: 7, customerId: "cust-2", customerName: "שרה לוי",
    phone: "+972-52-9876543", customerEmail: "sarah@nexus.io", company: "Nexus Digital",
    status: "new", heatLevel: "cold", pipelineValue: 5400,
    assignedAgentId: "agent-1", lastContactAt: "2026-05-15T09:00:00Z",
    createdAt: "2026-05-14T10:00:00Z", updatedAt: "2026-05-15T09:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
  {
    id: "lead-8", serialNumber: 8, customerId: "cust-4", customerName: "נועה ברק",
    phone: "+972-53-7778888", customerEmail: "noa@fintech.net", company: "FinTech Global",
    status: "contacted", heatLevel: "warm", pipelineValue: 29000,
    assignedAgentId: "agent-1", lastContactAt: "2026-05-20T10:00:00Z",
    createdAt: "2026-05-05T10:00:00Z", updatedAt: "2026-05-20T10:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv-1", clientName: "TechVision Systems", invoiceNumber: "INV-8821",
    amount: 14200, status: "paid", dueDate: "2026-05-01T00:00:00Z",
    createdAt: "2026-04-15T10:00:00Z",
  },
  {
    id: "inv-2", clientName: "Nexus Digital", invoiceNumber: "INV-8834",
    amount: 5800, status: "pending", dueDate: "2026-06-01T00:00:00Z",
    createdAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "inv-3", clientName: "Logistix Corp", invoiceNumber: "INV-8799",
    amount: 22450, status: "overdue", dueDate: "2026-04-15T00:00:00Z",
    createdAt: "2026-03-20T10:00:00Z",
  },
  {
    id: "inv-4", clientName: "FinTech Global", invoiceNumber: "INV-8850",
    amount: 38000, status: "paid", dueDate: "2026-05-15T00:00:00Z",
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "inv-5", clientName: "BuildCo", invoiceNumber: "INV-8862",
    amount: 9200, status: "pending", dueDate: "2026-06-10T00:00:00Z",
    createdAt: "2026-05-18T10:00:00Z",
  },
];

export const mockAccounts: Account[] = [
  {
    id: "acc-1", name: "TechVision Systems", industry: "טכנולוגיה",
    contactCount: 4, totalValue: 142000, lastActivityAt: "2026-05-21T08:00:00Z",
  },
  {
    id: "acc-2", name: "Nexus Digital", industry: "שיווק דיגיטלי",
    contactCount: 2, totalValue: 45000, lastActivityAt: "2026-05-20T14:00:00Z",
  },
  {
    id: "acc-3", name: "Logistix Corp", industry: "לוגיסטיקה",
    contactCount: 3, totalValue: 28000, lastActivityAt: "2026-05-16T10:00:00Z",
  },
  {
    id: "acc-4", name: "FinTech Global", industry: "פינטק",
    contactCount: 5, totalValue: 210000, lastActivityAt: "2026-05-21T09:30:00Z",
  },
  {
    id: "acc-5", name: "BuildCo", industry: "בנייה",
    contactCount: 1, totalValue: 35000, lastActivityAt: "2026-05-19T16:00:00Z",
  },
];

export const mockActivities: ActivityItem[] = [
  {
    id: "act-1", type: "email", title: "הצעת מחיר נשלחה",
    description: "הצעת מחיר Q3 נצפתה 4 פעמים ע\"י צוות TechVision",
    timestamp: "2026-05-21T10:45:00Z", customerId: "cust-1",
  },
  {
    id: "act-2", type: "call", title: "שיחת גילוי",
    description: "דנו בנקודות אינטגרציה חדשות לפריסה האירופאית",
    timestamp: "2026-05-20T14:00:00Z", customerId: "cust-1",
  },
  {
    id: "act-3", type: "meeting", title: "פגישת הדגמה",
    description: "הדגמת מערכת CRM ל-Nexus Digital — תגובה חיובית",
    timestamp: "2026-05-19T11:00:00Z", customerId: "cust-2",
  },
  {
    id: "act-4", type: "deal", title: "עסקה נסגרה",
    description: "TechVision — חבילת Enterprise נחתמה, ₪67,000",
    timestamp: "2026-05-18T16:30:00Z", customerId: "cust-1",
  },
  {
    id: "act-5", type: "note", title: "הערה פנימית",
    description: "BuildCo מעוניינים בפגישה נוספת בשבוע הבא",
    timestamp: "2026-05-17T09:00:00Z", customerId: "cust-5",
  },
];

export const mockDashboardStats: DashboardStats = {
  hotLeads: 124,
  hotLeadsTrend: 12,
  conversionRate: 32.4,
  revenuePipeline: 1200000,
  activeDeals: 47,
};

export const mockProducts: Product[] = [
  {
    id: "prod-1", serialNumber: 1, name: "חבילת אוטומציה בסיסית",
    description: "הטמעת תהליכים אוטומטיים בסיסיים — CRM, מיילים, ותזכורות",
    price: 4500, unit: "project", category: "אוטומציה", sku: "AUT-001",
    active: true, createdAt: "2026-01-10T10:00:00Z", updatedAt: "2026-01-10T10:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
  {
    id: "prod-2", serialNumber: 2, name: "ייעוץ אסטרטגי",
    description: "פגישת ייעוץ אסטרטגי לאפיון תהליכים ובחירת כלים",
    price: 850, unit: "hour", category: "ייעוץ", sku: "CON-001",
    active: true, createdAt: "2026-01-10T10:00:00Z", updatedAt: "2026-01-10T10:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
  {
    id: "prod-3", serialNumber: 3, name: "אינטגרציית API",
    description: "חיבור מערכות קיימות דרך API — סנכרון דו-כיווני",
    price: 6200, unit: "project", category: "פיתוח", sku: "DEV-001",
    active: true, createdAt: "2026-02-15T10:00:00Z", updatedAt: "2026-02-15T10:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
  {
    id: "prod-4", serialNumber: 4, name: "הדרכת צוות",
    description: "הדרכה מקיפה לצוות על שימוש במערכת — כולל חומרי עזר",
    price: 1200, unit: "hour", category: "הדרכה", sku: "TRN-001",
    active: true, createdAt: "2026-02-15T10:00:00Z", updatedAt: "2026-02-15T10:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
  {
    id: "prod-5", serialNumber: 5, name: "תחזוקה חודשית",
    description: "תמיכה שוטפת, עדכונים ותחזוקת אוטומציות",
    price: 1800, unit: "month", category: "תחזוקה", sku: "MNT-001",
    active: true, createdAt: "2026-03-01T10:00:00Z", updatedAt: "2026-03-01T10:00:00Z",
    createdBy: "system", updatedBy: "system", customFields: {},
  },
];

export const mockQuotes: Quote[] = [
  {
    id: "quote-1", serialNumber: 1, quoteNumber: "Q-0001",
    customerId: "cust-1", customerName: "יוסי כהן", status: "sent",
    lineItems: [
      { id: "li-1", productId: "prod-1", productName: "חבילת אוטומציה בסיסית", description: "הטמעת CRM + אוטומציות", quantity: 1, unitPrice: 4500, discount: 0, total: 4500 },
      { id: "li-2", productId: "prod-3", productName: "אינטגרציית API", description: "חיבור ל-ERP קיים", quantity: 1, unitPrice: 6200, discount: 10, total: 5580 },
      { id: "li-3", productId: "prod-4", productName: "הדרכת צוות", description: "הדרכה ל-3 אנשי צוות", quantity: 4, unitPrice: 1200, discount: 0, total: 4800 },
    ],
    subtotal: 15900, globalDiscount: 0, discountTotal: 620, includeVat: true, taxRate: 17, taxAmount: 2597.6, total: 17877.6,
    validUntil: "2026-06-15", notes: "כולל חודש תמיכה חינם", terms: "תשלום ב-3 תשלומים שווים",
    createdAt: "2026-05-01T10:00:00Z", updatedAt: "2026-05-10T10:00:00Z",
    createdBy: "אני", updatedBy: "אני", customFields: {},
  },
  {
    id: "quote-2", serialNumber: 2, quoteNumber: "Q-0002",
    customerId: "cust-4", customerName: "נועה ברק", status: "draft",
    lineItems: [
      { id: "li-4", productId: "prod-2", productName: "ייעוץ אסטרטגי", description: "אפיון מערכת CRM", quantity: 3, unitPrice: 850, discount: 0, total: 2550 },
      { id: "li-5", productId: "prod-5", productName: "תחזוקה חודשית", description: "תמיכה לשנה", quantity: 12, unitPrice: 1800, discount: 15, total: 18360 },
    ],
    subtotal: 24150, globalDiscount: 0, discountTotal: 3240, includeVat: true, taxRate: 17, taxAmount: 3554.7, total: 24464.7,
    validUntil: "2026-06-30", notes: "", terms: "תשלום חודשי",
    createdAt: "2026-05-18T10:00:00Z", updatedAt: "2026-05-18T10:00:00Z",
    createdBy: "אני", updatedBy: "אני", customFields: {},
  },
  {
    id: "quote-3", serialNumber: 3, quoteNumber: "Q-0003",
    customerId: "cust-2", customerName: "שרה לוי", status: "signed",
    lineItems: [
      { id: "li-6", productId: "prod-1", productName: "חבילת אוטומציה בסיסית", description: "אוטומציית שיווק", quantity: 1, unitPrice: 4500, discount: 5, total: 4275 },
    ],
    subtotal: 4500, globalDiscount: 0, discountTotal: 225, includeVat: true, taxRate: 17, taxAmount: 726.75, total: 5001.75,
    validUntil: "2026-05-30", notes: "הלקוחה ביקשה תשלום מיידי",
    terms: "תשלום מלא עם חתימה",
    signatureDataUrl: "data:image/png;base64,placeholder",
    signedAt: "2026-05-12T14:30:00Z",
    createdAt: "2026-05-05T10:00:00Z", updatedAt: "2026-05-12T14:30:00Z",
    createdBy: "אני", updatedBy: "אני", customFields: {},
  },
];
