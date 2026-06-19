import type { FieldDefinition } from "./field-definitions";

export const QUOTE_BUILT_IN_FIELD_IDS = [
  "quoteNumber", "customerName", "status", "validUntil", "notes", "terms",
] as const;

export type QuoteBuiltInFieldId = (typeof QUOTE_BUILT_IN_FIELD_IDS)[number];

export function isQuoteBuiltIn(id: string): id is QuoteBuiltInFieldId {
  return (QUOTE_BUILT_IN_FIELD_IDS as readonly string[]).includes(id);
}

const QUOTE_SYSTEM_FIELDS: FieldDefinition[] = [
  { id: "quoteNumber", name: "מספר הצעה", type: "text", required: true, isSystem: true, order: 0 },
  { id: "customerName", name: "לקוח", type: "text", required: true, isSystem: true, order: 1 },
  {
    id: "status", name: "סטטוס", type: "status", required: true, isSystem: true, order: 2,
    options: [
      { id: "draft", label: "טיוטה", color: "#6b7280" },
      { id: "sent", label: "נשלח", color: "#3b82f6" },
      { id: "signed", label: "נחתם", color: "#10b981" },
      { id: "expired", label: "פג תוקף", color: "#ef4444" },
    ],
  },
];

const QUOTE_DEFAULT_FIELDS: FieldDefinition[] = [
  { id: "validUntil", name: "תוקף עד", type: "text", required: false, isSystem: false, order: 3 },
  { id: "notes", name: "הערות", type: "textarea", required: false, isSystem: false, order: 4 },
  { id: "terms", name: "תנאים", type: "textarea", required: false, isSystem: false, order: 5 },
];

export const QUOTE_DEFAULT_FIELD_DEFINITIONS: FieldDefinition[] = [
  ...QUOTE_SYSTEM_FIELDS,
  ...QUOTE_DEFAULT_FIELDS,
];
