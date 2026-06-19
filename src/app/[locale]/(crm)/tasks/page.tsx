"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  CheckSquare, Plus, Trash2, Pencil, Calendar, User, Link2,
  Circle, Clock, CheckCircle2, AlertTriangle,
  List, Columns3, CalendarDays, GitBranch,
  Flame, Zap as ZapIcon, Snowflake, Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/hooks/use-tasks";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskKanban } from "@/components/tasks/task-kanban";
import { TaskCalendar } from "@/components/tasks/task-calendar";
import { TaskTimeline } from "@/components/tasks/task-timeline";
import type { Task, TaskStatus } from "@/lib/types";

type ViewMode = "list" | "kanban" | "calendar" | "timeline";

const VIEW_CONFIG: { key: ViewMode; icon: typeof List }[] = [
  { key: "list", icon: List },
  { key: "kanban", icon: Columns3 },
  { key: "calendar", icon: CalendarDays },
  { key: "timeline", icon: GitBranch },
];

const STATUS_CONFIG: Record<TaskStatus, { icon: typeof Circle; color: string; bg: string }> = {
  todo: { icon: Circle, color: "text-slate-500", bg: "bg-slate-100 text-slate-700 border-slate-200" },
  in_progress: { icon: Clock, color: "text-blue-500", bg: "bg-blue-100 text-blue-700 border-blue-200" },
  done: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const PRIORITY_CONFIG = {
  low: { bg: "bg-slate-100 text-slate-600 border-slate-200", icon: Snowflake },
  medium: { bg: "bg-amber-100 text-amber-700 border-amber-200", icon: ZapIcon },
  high: { bg: "bg-rose-100 text-rose-700 border-rose-200", icon: Flame },
};

export default function TasksPage() {
  const t = useTranslations("tasks");
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const filteredTasks = filterStatus === "all" ? tasks : tasks.filter((t) => t.status === filterStatus);

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const now = new Date().toISOString();

  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const stats = [
    { label: t("totalTasks"), value: tasks.length, iconBg: "bg-violet-500/15", iconColor: "text-violet-600", valueColor: "text-violet-700 dark:text-violet-300", icon: CheckSquare },
    { label: t("todoTasks"), value: todoCount, iconBg: "bg-slate-500/15", iconColor: "text-slate-600", valueColor: "text-slate-700 dark:text-slate-300", icon: Circle },
    { label: t("inProgressTasks"), value: inProgressCount, iconBg: "bg-blue-500/15", iconColor: "text-blue-600", valueColor: "text-blue-700 dark:text-blue-300", icon: Clock },
    { label: t("completionRate"), value: `${completionRate}%`, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-600", valueColor: "text-emerald-700 dark:text-emerald-300", icon: TrendingUp, hasBar: true, barValue: completionRate },
  ];

  const cycleStatus = (task: Task) => {
    const next: Record<TaskStatus, TaskStatus> = { todo: "in_progress", in_progress: "done", done: "todo" };
    updateTask(task.id, { status: next[task.status] });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -start-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <CheckSquare className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
              <p className="text-white/70 text-sm mt-0.5">{t("subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode switcher */}
            <div className="flex bg-white/15 backdrop-blur-sm rounded-xl p-1 gap-0.5">
              {VIEW_CONFIG.map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === key
                      ? "bg-white text-blue-700 shadow-md"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  title={t(`view${key.charAt(0).toUpperCase() + key.slice(1)}` as any)}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <Button
              onClick={() => { setEditingTask(null); setDialogOpen(true); }}
              className="bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-lg"
            >
              <Plus className="h-4 w-4 me-1" />
              {t("addTask")}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <div className={`h-8 w-8 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>
              <p className={`text-2xl font-extrabold ${stat.valueColor}`}>{stat.value}</p>
              {/* Progress bar for completion rate */}
              {"hasBar" in stat && stat.hasBar && (
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                    style={{ width: `${stat.barValue}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Filter Tabs (for list and timeline views) ── */}
      {(viewMode === "list" || viewMode === "timeline") && (
        <div className="flex gap-2 flex-wrap">
          {(["all", "todo", "in_progress", "done"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterStatus === s
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-card border text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950/30"
              }`}
            >
              {s === "all" ? `${t("totalTasks")} (${tasks.length})` :
               s === "todo" ? `${t("statusTodo")} (${todoCount})` :
               s === "in_progress" ? `${t("statusInProgress")} (${inProgressCount})` :
               `${t("statusDone")} (${doneCount})`}
            </button>
          ))}
        </div>
      )}

      {/* ── View Content ── */}
      {viewMode === "list" && (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-violet-500" />
              </div>
              <p className="font-semibold text-lg">{t("noTasks")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("noTasksHint")}</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredTasks.map((task) => {
                const statusConfig = STATUS_CONFIG[task.status];
                const StatusIcon = statusConfig.icon;
                const prioConfig = PRIORITY_CONFIG[task.priority];
                const PrioIcon = prioConfig.icon;
                const isOverdue = task.dueDate && task.dueDate < now && task.status !== "done";

                return (
                  <div key={task.id} className="flex items-start gap-3 p-4 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors group">
                    <button onClick={() => cycleStatus(task)} className="mt-0.5 shrink-0 hover:scale-110 transition-transform">
                      <StatusIcon className={`h-5 w-5 ${statusConfig.color} transition-colors`} />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        <Badge variant="outline" className={`text-[10px] py-0 h-5 gap-0.5 ${prioConfig.bg}`}>
                          <PrioIcon className="h-2.5 w-2.5" />
                          {t(`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}` as any)}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] py-0 h-5 ${statusConfig.bg}`}>
                          {t(`status${task.status === "todo" ? "Todo" : task.status === "in_progress" ? "InProgress" : "Done"}`)}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">{task.description}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {task.dueDate && (
                          <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                            {isOverdue && <AlertTriangle className="h-3 w-3" />}
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString("he-IL")}
                            {task.dueTime && <span className="font-mono">{task.dueTime}</span>}
                          </span>
                        )}
                        {(task.linkedLeadName || task.linkedCustomerName) && (
                          <span className="text-xs text-blue-600 flex items-center gap-1">
                            <Link2 className="h-3 w-3" />
                            {task.linkedLeadName || task.linkedCustomerName}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.createdBy}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(task)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {viewMode === "kanban" && (
        <TaskKanban
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={deleteTask}
          onStatusChange={(id, status) => updateTask(id, { status })}
          onAdd={() => { setEditingTask(null); setDialogOpen(true); }}
        />
      )}

      {viewMode === "calendar" && (
        <TaskCalendar
          tasks={tasks}
          onEdit={handleEdit}
          onStatusChange={(id, status) => updateTask(id, { status })}
        />
      )}

      {viewMode === "timeline" && (
        <TaskTimeline
          tasks={filteredTasks}
          onEdit={handleEdit}
          onDelete={deleteTask}
          onStatusChange={(id, status) => updateTask(id, { status })}
        />
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={(data) => {
          if (editingTask) {
            updateTask(editingTask.id, data);
          } else {
            addTask(data as any);
          }
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
