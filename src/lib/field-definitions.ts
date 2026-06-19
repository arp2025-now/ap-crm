export type FieldType = "text" | "number" | "dropdown" | "status" | "textarea";

export interface FieldOption {
  id: string;
  label: string;
  color?: string;
}

export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  options?: FieldOption[];
  required: boolean;
  isSystem: boolean;  // true = cannot delete
  order: number;
}

// Field IDs that map to top-level Lead properties (not customFields)
export const BUILT_IN_FIELD_IDS = [
  "customerName", "phone", "customerEmail", "status",
  "company", "heatLevel", "pipelineValue", "notes",
] as const;

export type BuiltInFieldId = (typeof BUILT_IN_FIELD_IDS)[number];

export function isBuiltIn(id: string): id is BuiltInFieldId {
  return (BUILT_IN_FIELD_IDS as readonly string[]).includes(id);
}

const SYSTEM_FIELDS: FieldDefinition[] = [
  { id: "customerName", name: "שם מלא", type: "text", required: true, isSystem: true, order: 0 },
  { id: "phone", name: "טלפון", type: "text", required: false, isSystem: true, order: 1 },
  { id: "customerEmail", name: "מייל", type: "text", required: true, isSystem: true, order: 2 },
  {
    id: "status", name: "סטטוס", type: "status", required: true, isSystem: true, order: 3,
    options: [
      { id: "new", label: "ליד חדש", color: "#3b82f6" },
      { id: "contacted", label: "נוצר קשר", color: "#8b5cf6" },
      { id: "qualified", label: "מוסמך", color: "#f59e0b" },
      { id: "proposal", label: "הצעה נשלחה", color: "#06b6d4" },
      { id: "negotiation", label: "משא ומתן", color: "#f97316" },
      { id: "won", label: "נסגר בהצלחה", color: "#10b981" },
      { id: "lost", label: "אבוד", color: "#ef4444" },
    ],
  },
];

const DEFAULT_CUSTOM_FIELDS: FieldDefinition[] = [
  { id: "company", name: "חברה", type: "text", required: false, isSystem: false, order: 4 },
  {
    id: "heatLevel", name: "רמת חום", type: "status", required: false, isSystem: false, order: 5,
    options: [
      { id: "hot", label: "חם", color: "#ef4444" },
      { id: "warm", label: "חמים", color: "#f59e0b" },
      { id: "cold", label: "קר", color: "#3b82f6" },
    ],
  },
  { id: "pipelineValue", name: "שווי עסקה משוער", type: "number", required: false, isSystem: false, order: 6 },
  { id: "notes", name: "הערות", type: "textarea", required: false, isSystem: false, order: 7 },
];

export const DEFAULT_FIELDS: FieldDefinition[] = [...SYSTEM_FIELDS, ...DEFAULT_CUSTOM_FIELDS];
