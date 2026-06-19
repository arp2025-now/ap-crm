"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Circle, Clock, CheckCircle2, Calendar, Link2,
  AlertTriangle, Pencil, Trash2, Flame, Zap, Snowflake,
  ArrowDown, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task, TaskStatus } from "@/lib/types";

const STATUS_CONFIG: Record<TaskStatus, { icon: typeof Circle; color: string; ring: string; line: string }> = {
  todo: { icon: Circle, color: "text-slate-500", ring: "ring-slate-200 bg-slate-100 dark:ring-slate-700 dark:bg-slate-800", line: "bg-slate-200 dark:bg-slate-700" },
  in_progress: { icon: Clock, color: "text-blue-500", ring: "ring-blue-200 bg-blue-100 dark:ring-blue-700 dark:bg-blue-900/50", line: "bg-blue-200 dark:bg-blue-700" },
  done: { icon: CheckCircle2, color: "text-emerald-500", ring: "ring-emerald-200 bg-emerald-100 dark:ring-emerald-700 dark:bg-emerald-900/50", line: "bg-emerald-200 dark:bg-emerald-700" },
};

const PRIORITY_ICON = { low: Snowflake, medium: Zap, high: Flame };
const PRIORITY_COLORS = {
  low: "text-slate-500",
  medium: "text-amber-500",
  high: "text-rose-500",
};

interface TaskTimelineProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export function TaskTimeline({ tasks, onEdit, onDelete, onStatusChange }: TaskTimelineProps) {
  const t = useTranslations("tasks");
  const locale = useLocale();
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";
  const now = new Date();

  // Group tasks by date sections
  const grouped = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const overdue: Task[] = [];
    const todayTasks: Task[] = [];
    const thisWeekTasks: Task[] = [];
    const laterTasks: Task[] = [];
    const noDueTasks: Task[] = [];

    const sorted = [...tasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

    sorted.forEach((task) => {
      if (!task.dueDate) {
        noDueTasks.push(task);
        return;
      }
      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);

      if (task.status === "done") {
        // Put done tasks in their date group
        if (due < today) overdue.push(task);
        else if (due.getTime() === today.getTime()) todayTasks.push(task);
        else if (due < weekEnd) thisWeekTasks.push(task);
        else laterTasks.push(task);
      } else if (due < today) {
        overdue.push(task);
      } else if (due.getTime() === today.getTime()) {
        todayTasks.push(task);
      } else if (due < weekEnd) {
        thisWeekTasks.push(task);
      } else {
        laterTasks.push(task);
      }
    });

    const sections: { key: string; label: string; tasks: Task[]; color: string; icon: typeof AlertTriangle }[] = [];

    if (overdue.length > 0) {
      sections.push({ key: "overdue", label: t("overdue"), tasks: overdue, color: "text-rose-600", icon: AlertTriangle });
    }
    if (todayTasks.length > 0) {
      sections.push({ key: "today", label: t("today"), tasks: todayTasks, color: "text-blue-600", icon: Sparkles });
    }
    if (thisWeekTasks.length > 0) {
      sections.push({ key: "week", label: t("thisWeek"), tasks: thisWeekTasks, color: "text-violet-600", icon: Calendar });
    }
    if (laterTasks.length > 0) {
      sections.push({ key: "later", label: t("dueSoon"), tasks: laterTasks, color: "text-emerald-600", icon: ArrowDown });
    }
    if (noDueTasks.length > 0) {
      sections.push({ key: "nodate", label: t("noDueDate"), tasks: noDueTasks, color: "text-amber-600", icon: Circle });
    }

    return sections;
  }, [tasks, t]);

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border bg-card shadow-sm p-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-violet-500" />
        </div>
        <p className="font-semibold text-lg">{t("noTasks")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("noTasksHint")}</p>
      </div>
    );
  }

  const cycleStatus = (task: Task) => {
    const next: Record<TaskStatus, TaskStatus> = { todo: "in_progress", in_progress: "done", done: "todo" };
    onStatusChange(task.id, next[task.status]);
  };

  return (
    <div className="space-y-6">
      {grouped.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div key={section.key} className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="px-5 py-3 border-b bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50">
              <div className="flex items-center gap-2.5">
                <SectionIcon className={`h-4 w-4 ${section.color}`} />
                <h3 className={`font-bold text-sm ${section.color}`}>{section.label}</h3>
                <Badge variant="outline" className="text-[10px] py-0 h-5">{section.tasks.length}</Badge>
              </div>
            </div>

            {/* Timeline items */}
            <div className="relative">
              {section.tasks.map((task, idx) => {
                const config = STATUS_CONFIG[task.status];
                const StatusIcon = config.icon;
                const PrioIcon = PRIORITY_ICON[task.priority];
                const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== "done";
                const isLast = idx === section.tasks.length - 1;

                return (
                  <div key={task.id} className="relative flex gap-4 px-5 py-3 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors group">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center shrink-0">
                      <button
                        onClick={() => cycleStatus(task)}
                        className={`h-8 w-8 rounded-full ring-2 flex items-center justify-center ${config.ring} hover:scale-110 transition-transform z-10`}
                      >
                        <StatusIcon className={`h-4 w-4 ${config.color}`} />
                      </button>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 mt-1 ${config.line}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-semibold text-sm ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </p>
                            <PrioIcon className={`h-3.5 w-3.5 ${PRIORITY_COLORS[task.priority]}`} />
                          </div>

                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                          )}

                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            {task.dueDate && (
                              <span className={`text-[11px] font-medium flex items-center gap-1 ${isOverdue ? "text-rose-600" : "text-muted-foreground"}`}>
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString(fmtLocale, { day: "numeric", month: "short" })}
                                {task.dueTime && <span className="font-mono ms-0.5">{task.dueTime}</span>}
                              </span>
                            )}
                            {(task.linkedLeadName || task.linkedCustomerName) && (
                              <span className="text-[11px] text-blue-600 flex items-center gap-1">
                                <Link2 className="h-3 w-3" />
                                {task.linkedLeadName || task.linkedCustomerName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(task.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
