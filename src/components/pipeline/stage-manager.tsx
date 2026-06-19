"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import type { PipelineStage } from "@/lib/types";

const PRESET_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4", "#f97316", "#10b981", "#ef4444", "#ec4899"];

interface StageManagerProps {
  stages: PipelineStage[];
  onAddStage: (stage: Omit<PipelineStage, "id" | "order">) => void;
  onDeleteStage: (id: string) => void;
}

export function StageManager({ stages, onAddStage, onDeleteStage }: StageManagerProps) {
  const t = useTranslations("pipeline");
  const [name, setName] = useState("");
  const [nameHe, setNameHe] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    if (!name.trim() || !nameHe.trim()) return;
    onAddStage({ name, nameHe, color });
    setName("");
    setNameHe("");
    setColor(PRESET_COLORS[0]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Plus className="h-4 w-4 me-2" />
        {t("manageStages")}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("manageStages")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stages.map((stage) => (
              <div key={stage.id} className="flex items-center gap-2 p-2 rounded-lg border">
                <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <span className="flex-1 text-sm font-medium">{stage.name} / {stage.nameHe}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDeleteStage(stage.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-semibold">{t("addStage")}</p>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Stage name (EN)" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="שם שלב (HE)" dir="rtl" value={nameHe} onChange={(e) => setNameHe(e.target.value)} />
            </div>
            <div className="flex gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${color === c ? "scale-125 border-foreground" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <Button onClick={handleAdd} className="w-full">{t("addStage")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
