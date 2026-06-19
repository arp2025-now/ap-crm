import type { FieldDefinition } from "./field-definitions";

export const PRODUCT_BUILT_IN_FIELD_IDS = [
  "name", "description", "price", "unit", "category", "sku", "active",
] as const;

export type ProductBuiltInFieldId = (typeof PRODUCT_BUILT_IN_FIELD_IDS)[number];

export function isProductBuiltIn(id: string): id is ProductBuiltInFieldId {
  return (PRODUCT_BUILT_IN_FIELD_IDS as readonly string[]).includes(id);
}

const PRODUCT_SYSTEM_FIELDS: FieldDefinition[] = [
  { id: "name", name: "שם מוצר", type: "text", required: true, isSystem: true, order: 0 },
  { id: "sku", name: "מק\"ט", type: "text", required: true, isSystem: true, order: 1 },
  { id: "price", name: "מחיר", type: "number", required: true, isSystem: true, order: 2 },
];

const PRODUCT_DEFAULT_FIELDS: FieldDefinition[] = [
  { id: "description", name: "תיאור", type: "textarea", required: false, isSystem: false, order: 3 },
  {
    id: "unit", name: "יחידה", type: "dropdown", required: false, isSystem: false, order: 4,
    options: [
      { id: "unit", label: "יחידה" },
      { id: "hour", label: "שעה" },
      { id: "month", label: "חודש" },
      { id: "project", label: "פרויקט" },
    ],
  },
  { id: "category", name: "קטגוריה", type: "text", required: false, isSystem: false, order: 5 },
  {
    id: "active", name: "סטטוס", type: "status", required: false, isSystem: false, order: 6,
    options: [
      { id: "true", label: "פעיל", color: "#10b981" },
      { id: "false", label: "לא פעיל", color: "#6b7280" },
    ],
  },
];

export const PRODUCT_DEFAULT_FIELD_DEFINITIONS: FieldDefinition[] = [
  ...PRODUCT_SYSTEM_FIELDS,
  ...PRODUCT_DEFAULT_FIELDS,
];
