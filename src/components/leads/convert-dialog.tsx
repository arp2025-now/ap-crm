"use client";

import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type { Lead } from "@/lib/types";

interface ConvertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onConfirm: (lead: Lead) => void;
}

export function ConvertDialog({ open, onOpenChange, lead, onConfirm }: ConvertDialogProps) {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" showCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-secondary" />
            המרה ללקוח
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-1">
          <p className="text-sm">
            האם להמיר את <strong>{lead.customerName}</strong> ללקוח?
          </p>
          <p className="text-xs text-muted-foreground">
            הליד ישמר עם סטטוס &ldquo;הומר ללקוח&rdquo; וניתן לעדכנו בהמשך.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button
            onClick={() => {
              onConfirm(lead);
              onOpenChange(false);
            }}
          >
            <UserCheck className="h-4 w-4 me-2" />
            המר ללקוח
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
