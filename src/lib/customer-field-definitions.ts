import type { FieldDefinition } from "./field-definitions";

export const CUSTOMER_BUILT_IN_FIELD_IDS = [
  "name", "phone", "email", "company",
  "industry", "lifetimeValue", "lifecycleStage",
] as const;

export type CustomerBuiltInFieldId = (typeof CUSTOMER_BUILT_IN_FIELD_IDS)[number];

export function isCustomerBuiltIn(id: string): id is CustomerBuiltInFieldId {
  return (CUSTOMER_BUILT_IN_FIELD_IDS as readonly string[]).includes(id);
}

const CUSTOMER_SYSTEM_FIELDS: FieldDefinition[] = [
  { id: "name",  name: "שם מלא", type: "text", required: true,  isSystem: true, order: 0 },
  { id: "phone", name: "טלפון",  type: "text", required: false, isSystem: true, order: 1 },
  { id: "email", name: "מייל",   type: "text", required: true,  isSystem: true, order: 2 },
];

const CUSTOMER_DEFAULT_FIELDS: FieldDefinition[] = [
  { id: "company",  name: "חברה",   type: "text",   required: false, isSystem: false, order: 3 },
  { id: "industry", name: "תעשייה", type: "text",   required: false, isSystem: false, order: 4 },
  { id: "lifetimeValue", name: "ערך לקוח", type: "number", required: false, isSystem: false, order: 5 },
  {
    id: "lifecycleStage", name: "שלב מחזור חיים", type: "status",
    required: false, isSystem: false, order: 6,
    options: [
      { id: "prospect",   label: "פרוספקט",     color: "#6b7280" },
      { id: "contacted",  label: "נוצר קשר",    color: "#8b5cf6" },
      { id: "onboarding", label: "אונבורדינג",  color: "#f59e0b" },
      { id: "active",     label: "פעיל",         color: "#10b981" },
      { id: "advocate",   label: "ממליץ",        color: "#3b82f6" },
    ],
  },
];

export const CUSTOMER_DEFAULT_FIELD_DEFINITIONS: FieldDefinition[] = [
  ...CUSTOMER_SYSTEM_FIELDS,
  ...CUSTOMER_DEFAULT_FIELDS,
];
