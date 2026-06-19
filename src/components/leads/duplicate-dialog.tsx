"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type { Lead } from "@/lib/types";

interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duplicate: Lead | null;
  matchField: "phone" | "email";
  onEditExisting: (lead: Lead) => void;
  onCreateAnyway: () => void;
}

export function DuplicateDialog({
  open, onOpenChange, duplicate, matchField,
  onEditExisting, onCreateAnyway,
}: DuplicateDialogProps) {
  if (!duplicate) return null;

  const fieldLabel = matchField === "phone" ? "טלפון" : "מייל";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" showCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            כפילות זוהתה
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-1">
          <p className="text-sm">
            קיים ליד עם אותו <strong>{fieldLabel}</strong>:
          </p>
          <p className="text-sm font-semibold">
            {duplicate.customerName}
            {duplicate.company ? ` — ${duplicate.company}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            {matchField === "phone" ? duplicate.phone : duplicate.customerEmail}
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => { onCreateAnyway(); onOpenChange(false); }}>
            צור ליד חדש בכל זאת
          </Button>
          <Button onClick={() => { onEditExisting(duplicate); onOpenChange(false); }}>
            עדכן כרטיס קיים
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
