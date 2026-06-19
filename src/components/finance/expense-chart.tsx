"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const segments = [
  { label: "Payroll", labelHe: "שכר", pct: 45, color: "var(--primary)" },
  { label: "Cloud", labelHe: "ענן", pct: 25, color: "var(--secondary)" },
  { label: "Marketing", labelHe: "שיווק", pct: 15, color: "var(--warning)" },
  { label: "Other", labelHe: "אחר", pct: 15, color: "var(--destructive)" },
];

export function ExpenseChart({ title, locale }: { title: string; locale: string }) {
  let cumulative = 0;
  const gradientStops = segments.map((s) => {
    const start = cumulative;
    cumulative += s.pct;
    return `${s.color} ${start}% ${cumulative}%`;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <div
            className="w-full h-full rounded-full"
            style={{ background: `conic-gradient(${gradientStops.join(", ")})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 bg-card rounded-full flex flex-col items-center justify-center shadow-inner">
              <p className="text-xs text-muted-foreground uppercase font-bold">Total</p>
              <p className="text-xl font-black">₪842K</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6 w-full">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs font-semibold">{locale === "he" ? s.labelHe : s.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
