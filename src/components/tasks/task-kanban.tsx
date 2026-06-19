"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Circle, Clock, CheckCircle2, Calendar, Link2, User,
  AlertTriangle, Pencil, Trash2, GripVertical, Plus,
  Flame, Zap, Snowflake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task, TaskStatus } from "@/lib/types";

const COLUMNS: { status: TaskStatus; gradient: string; borderColor: string; dotColor: string; iconBg: string }[] = [
  {
    status: "todo",
    gradient: "from-slate-500/10 via-slate-500/5 to-transparent",
    borderColor: "border-slate-300 dark:border-slate-600",
    dotColor: "bg-slate-400",
    iconBg: "bg-slate-100 dark:bg-slate-800",
  },
  {
    status: "in_progress",
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    borderColor: "border-blue-300 dark:border-blue-600",
    dotColor: "bg-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
  },
  {
    status: "done",
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    borderColor: "border-emerald-300 dark:border-emerald-600",
    dotColor: "bg-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
  },
];

const STATUS_ICON: Record<TaskStatus, typeof Circle> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
};

const PRIORITY_STYLES = {
  low: { bg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700", icon: Snowflake },
  medium: { bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700", icon: Zap },
  high: { bg: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700", icon: Flame },
};

interface TaskKanbanProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAdd: () => void;
}

export function TaskKanban({ tasks, onEdit, onDelete, onStatusChange, onAdd }: TaskKanbanProps) {
  const t = useTranslations("tasks");
  const locale = useLocale();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

  const now = new Date().toISOString();

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
    // Semi-transparent drag image
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDropTarget(null);
    dragCounter.current = {};
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragEnter = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    dragCounter.current[status] = (dragCounter.current[status] || 0) + 1;
    setDropTarget(status);
  };

  const handleDragLeave = (e: React.DragEvent, status: TaskStatus) => {
    dragCounter.current[status] = (dragCounter.current[status] || 0) - 1;
    if (dragCounter.current[status] <= 0) {
      dragCounter.current[status] = 0;
      if (dropTarget === status) setDropTarget(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onStatusChange(taskId, status);
    }
    setDraggedTaskId(null);
    setDropTarget(null);
    dragCounter.current = {};
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        const ColIcon = STATUS_ICON[col.status];
        const isDropping = dropTarget === col.status && draggedTaskId !== null;
        const draggedTask = tasks.find((t) => t.id === draggedTaskId);
        const isDraggedFromThis = draggedTask?.status === col.status;

        return (
          <div
            key={col.status}
            className={`rounded-2xl border-2 transition-all duration-300 ${
              isDropping && !isDraggedFromThis
                ? `${col.borderColor} shadow-lg scale-[1.01] bg-gradient-to-b ${col.gradient}`
                : "border-border/50 bg-card/50"
            }`}
            onDragEnter={(e) => handleDragEnter(e, col.status)}
            onDragLeave={(e) => handleDragLeave(e, col.status)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            {/* Column Header */}
            <div className={`p-4 border-b bg-gradient-to-r ${col.gradient} rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-xl ${col.iconBg} flex items-center justify-center`}>
                    <ColIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">
                      {col.status === "todo" ? t("statusTodo") :
                       col.status === "in_progress" ? t("statusInProgress") :
                       t("statusDone")}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${col.iconBg}`}>
                    {columnTasks.length}
                  </span>
                </div>
              </div>
              {/* Progress bar */}
              {tasks.length > 0 && (
                <div className="mt-3 h-1.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${col.dotColor} transition-all duration-500`}
                    style={{ width: `${(columnTasks.length / tasks.length) * 100}%` }}
                  />
                </div>
              )}
            </div>

            {/* Task Cards */}
            <div className="p-3 space-y-2.5 min-h-[200px]">
              {isDropping && !isDraggedFromThis && (
                <div className={`border-2 border-dashed rounded-xl p-4 text-center text-sm font-medium text-muted-foreground ${col.borderColor} animate-pulse`}>
                  {t("dropHere")}
                </div>
              )}

              {columnTasks.length === 0 && !isDropping && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className={`h-12 w-12 rounded-2xl ${col.iconBg} flex items-center justify-center mb-3 opacity-50`}>
                    <ColIcon className="h-6 w-6" />
                  </div>
                  <p className="text-xs text-muted-foreground">{t("noTasksInColumn")}</p>
                </div>
              )}

              {columnTasks.map((task) => {
                const isOverdue = task.dueDate && task.dueDate < now && task.status !== "done";
                const prioStyle = PRIORITY_STYLES[task.priority];
                const PrioIcon = prioStyle.icon;
                const isDragging = draggedTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`group relative rounded-xl border bg-card p-3.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
                      isDragging ? "opacity-50 scale-95" : "hover:-translate-y-0.5"
                    } ${isOverdue ? "border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20" : ""}`}
                  >
                    {/* Grab handle */}
                    <div className="absolute top-2.5 start-1.5 opacity-0 group-hover:opacity-40 transition-opacity">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Priority indicator bar */}
                    <div className={`absolute top-3 end-3 h-2 w-2 rounded-full ${
                      task.priority === "high" ? "bg-rose-500 animate-pulse" :
                      task.priority === "medium" ? "bg-amber-500" : "bg-slate-300"
                    }`} />

                    <div className="ps-4">
                      {/* Title */}
                      <p className={`font-semibold text-sm leading-snug ${
                        task.status === "done" ? "line-through text-muted-foreground" : ""
                      }`}>
                        {task.title}
                      </p>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                      )}

                      {/* Metadata pills */}
                      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] py-0 h-5 gap-0.5 ${prioStyle.bg}`}>
                          <PrioIcon className="h-2.5 w-2.5" />
                          {t(`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}` as any)}
                        </Badge>

                        {task.dueDate && (
                          <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                            isOverdue
                              ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400"
                              : "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400"
                          }`}>
                            {isOverdue ? <AlertTriangle className="h-2.5 w-2.5" /> : <Calendar className="h-2.5 w-2.5" />}
                            {new Date(task.dueDate).toLocaleDateString(locale === "he" ? "he-IL" : "en-US", { day: "numeric", month: "short" })}
                            {task.dueTime && <span className="font-mono ms-0.5">{task.dueTime}</span>}
                          </span>
                        )}
                      </div>

                      {/* Linked entity */}
                      {(task.linkedLeadName || task.linkedCustomerName) && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-blue-600 dark:text-blue-400">
                          <Link2 className="h-2.5 w-2.5" />
                          <span className="truncate">{task.linkedLeadName || task.linkedCustomerName}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons on hover */}
                    <div className="absolute bottom-2 end-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                        className="h-6 w-6 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center justify-center transition-colors"
                      >
                        <Pencil className="h-3 w-3 text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                        className="h-6 w-6 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/30 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="h-3 w-3 text-rose-600" />
                      </button>
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
