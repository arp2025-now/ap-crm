"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Project, ProjectType, ProjectStatus } from "@/lib/types";

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "automation", label: "אוטומציה" },
  { value: "crm", label: "הטמעת CRM" },
];

const PROJECT_STATUSES: { value: ProjectStatus; label: string; color: string }[] = [
  { value: "planning", label: "תכנון", color: "bg-slate-100 text-slate-700" },
  { value: "active", label: "פעיל", color: "bg-emerald-100 text-emerald-700" },
  { value: "on_hold", label: "מושהה", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "הושלם", color: "bg-blue-100 text-blue-700" },
  { value: "cancelled", label: "בוטל", color: "bg-red-100 text-red-700" },
];

const VAT_RATE = 0.17;

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  initial?: Project;
  defaultLeadId?: string;
  defaultClientId?: string;
}

export function ProjectDialog({ open, onClose, onSave, initial, defaultLeadId, defaultClientId }: ProjectDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("automation");
  const [status, setStatus] = useState<ProjectStatus>("planning");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [priceExclVat, setPriceExclVat] = useState("");
  const [notes, setNotes] = useState("");
  const [specDocUrl, setSpecDocUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setType(initial?.type ?? "automation");
      setStatus(initial?.status ?? "planning");
      setStartDate(initial?.startDate ?? "");
      setExpectedEndDate(initial?.expectedEndDate ?? "");
      setPriceExclVat(initial?.priceExclVat !== undefined ? String(initial.priceExclVat) : "");
      setNotes(initial?.notes ?? "");
      setSpecDocUrl(initial?.specDocUrl ?? "");
    }
  }, [open, initial]);

  const priceNum = parseFloat(priceExclVat) || 0;
  const priceInclVat = priceNum * (1 + VAT_RATE);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        type,
        status,
        leadId: initial?.leadId ?? defaultLeadId,
        clientId: initial?.clientId ?? defaultClientId,
        startDate: startDate || undefined,
        expectedEndDate: expectedEndDate || undefined,
        priceExclVat: priceNum > 0 ? priceNum : undefined,
        notes: notes.trim() || undefined,
        specDocUrl: specDocUrl.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <h2 className="text-lg font-bold">{initial ? "עריכת פרויקט" : "פרויקט חדש"}</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">שם הפרויקט *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם הפרויקט"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">סוג</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProjectType)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">סטטוס</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">תאריך התחלה</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">צפי סיום</label>
              <input
                type="date"
                value={expectedEndDate}
                onChange={(e) => setExpectedEndDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">מחיר ללא מע"מ (₪)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={priceExclVat}
                onChange={(e) => setPriceExclVat(e.target.value)}
                placeholder="0"
                min={0}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              {priceNum > 0 && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  כולל מע"מ: ₪{priceInclVat.toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {/* Spec doc URL */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">לינק לאפיון</label>
            <input
              value={specDocUrl}
              onChange={(e) => setSpecDocUrl(e.target.value)}
              placeholder="https://docs.google.com/..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">הערות</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות לפרויקט..."
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 pb-6">
          <Button variant="outline" onClick={onClose} disabled={saving}>ביטול</Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? "שומר..." : "שמור"}
          </Button>
        </div>
      </div>
    </div>
  );
}
