"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type { Webhook, WebhookMethod } from "@/lib/types";

const METHODS: WebhookMethod[] = ["GET", "POST", "PUT", "DELETE"];

interface WebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook: Webhook | null;
  onSave: (data: Partial<Webhook>) => void;
}

export function WebhookDialog({ open, onOpenChange, webhook, onSave }: WebhookDialogProps) {
  const t = useTranslations("automations");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<WebhookMethod>("POST");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (webhook) {
      setName(webhook.name);
      setUrl(webhook.url);
      setMethod(webhook.method);
      setActive(webhook.active);
    } else {
      setName("");
      setUrl("");
      setMethod("POST");
      setActive(true);
    }
  }, [webhook, open]);

  const handleSave = () => {
    if (!name.trim() || !url.trim()) return;
    onSave({ name: name.trim(), url: url.trim(), method, active, headers: {} });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{webhook ? t("editWebhook") : t("addWebhook")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("webhookName")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Webhook"
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("webhookUrl")}</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("webhookMethod")}</label>
            <div className="flex gap-2">
              {METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    method === m
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-blue-100"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !url.trim()}>
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
