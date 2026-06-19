"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useLeads } from "@/hooks/use-leads";
import { useCustomers } from "@/hooks/use-customers";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave: (data: Partial<Task>) => void;
  initialLeadId?: string;
  initialLeadName?: string;
  initialCustomerId?: string;
  initialCustomerName?: string;
}

export function TaskDialog({
  open, onOpenChange, task, onSave,
  initialLeadId, initialLeadName, initialCustomerId, initialCustomerName,
}: TaskDialogProps) {
  const t = useTranslations("tasks");
  const { leads } = useLeads();
  const { customers } = useCustomers();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [linkedLeadId, setLinkedLeadId] = useState("");
  const [linkedCustomerId, setLinkedCustomerId] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate || "");
      setDueTime(task.dueTime || "");
      setLinkedLeadId(task.linkedLeadId || "");
      setLinkedCustomerId(task.linkedCustomerId || "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus("todo");
      setDueDate("");
      setDueTime("");
      setLinkedLeadId(initialLeadId || "");
      setLinkedCustomerId(initialCustomerId || "");
    }
  }, [task, open, initialLeadId, initialCustomerId]);

  const handleSave = () => {
    if (!title.trim()) return;
    const lead = leads.find((l) => l.id === linkedLeadId);
    const customer = customers.find((c) => c.id === linkedCustomerId);
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      linkedLeadId: linkedLeadId || undefined,
      linkedLeadName: lead?.customerName || initialLeadName || undefined,
      linkedCustomerId: linkedCustomerId || undefined,
      linkedCustomerName: customer?.name || initialCustomerName || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? t("editTask") : t("addTask")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("taskTitle")}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("taskDescription")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("priority")}</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              >
                <option value="low">{t("priorityLow")}</option>
                <option value="medium">{t("priorityMedium")}</option>
                <option value="high">{t("priorityHigh")}</option>
              </select>
            </div>

            {task && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("status")}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                >
                  <option value="todo">{t("statusTodo")}</option>
                  <option value="in_progress">{t("statusInProgress")}</option>
                  <option value="done">{t("statusDone")}</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("dueDate")}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("dueTime")}</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("linkToLead")}</label>
            <select
              value={linkedLeadId}
              onChange={(e) => setLinkedLeadId(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            >
              <option value="">{t("none")}</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>{l.customerName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("linkToCustomer")}</label>
            <select
              value={linkedCustomerId}
              onChange={(e) => setLinkedCustomerId(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            >
              <option value="">{t("none")}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel" as any) || "ביטול"}
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {t("save" as any) || "שמור"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
