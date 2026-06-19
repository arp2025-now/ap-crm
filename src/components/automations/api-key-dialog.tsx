"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, service: string, key: string) => void;
}

const SERVICES = [
  "Make.com",
  "Zapier",
  "OpenAI",
  "Anthropic",
  "Google",
  "Slack",
  "HubSpot",
  "Salesforce",
  "Twilio",
  "SendGrid",
  "Stripe",
  "Other",
];

export function ApiKeyDialog({ open, onOpenChange, onSave }: ApiKeyDialogProps) {
  const t = useTranslations("automations");
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !service.trim() || !key.trim()) return;
    onSave(name.trim(), service.trim(), key.trim());
    setName("");
    setService("");
    setKey("");
    setShowKey(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            {t("addApiKey")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("apiKeyName")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production API Key"
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("apiKeyService")}</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            >
              <option value="">Select service...</option>
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("apiKeyValue")}</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-xl border bg-background px-3 py-2.5 pe-10 text-sm font-mono focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {t("encrypted")} — stored securely in local storage
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !service.trim() || !key.trim()}>
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
