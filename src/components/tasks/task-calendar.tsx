"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ChevronLeft, ChevronRight, Circle, Clock, CheckCircle2,
  Flame, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task, TaskStatus } from "@/lib/types";

const STATUS_DOT: Record<TaskStatus, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-blue-500",
  done: "bg-emerald-500",
};

const PRIORITY_RING: Record<string, string> = {
  high: "ring-2 ring-rose-400 ring-offset-1",
  medium: "",
  low: "",
};

const HE_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const EN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HE_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

interface TaskCalendarProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export function TaskCalendar({ tasks, onEdit, onStatusChange }: TaskCalendarProps) {
  const t = useTranslations("tasks");
  const locale = useLocale();
  const isHe = locale === "he";
  const dayNames = isHe ? HE_DAYS : EN_DAYS;

  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Previous month fill
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      days.push({ date: d, isCurrentMonth: false, isToday: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
      });
    }

    // Next month fill
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false, isToday: false });
    }

    return days;
  }, [year, month, daysInMonth, firstDayOfWeek, prevMonthDays, today]);

  // Index tasks by date
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const key = task.dueDate.slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [tasks]);

  const monthLabel = isHe
    ? `${HE_MONTHS[month]} ${year}`
    : currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Tasks without due date
  const unscheduled = tasks.filter((t) => !t.dueDate);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 border-b bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-violet-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={prevMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-bold min-w-[160px] text-center">{monthLabel}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={nextMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={goToday}>
              {t("today")}
            </Button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-xs font-bold text-muted-foreground bg-slate-50/50 dark:bg-slate-900/30">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dateKey = day.date.toISOString().slice(0, 10);
            const dayTasks = tasksByDate[dateKey] || [];
            const isPast = day.date < today && !day.isToday;

            return (
              <div
                key={idx}
                className={`min-h-[90px] border-b border-e p-1.5 transition-colors ${
                  !day.isCurrentMonth ? "bg-slate-50/50 dark:bg-slate-950/30" :
                  day.isToday ? "bg-blue-50/70 dark:bg-blue-950/30" :
                  ""
                }`}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full ${
                    day.isToday
                      ? "bg-blue-600 text-white font-bold"
                      : !day.isCurrentMonth
                      ? "text-muted-foreground/40"
                      : "text-foreground"
                  }`}>
                    {day.date.getDate()}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[9px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Task pills */}
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => {
                    const isOverdue = isPast && task.status !== "done";
                    return (
                      <button
                        key={task.id}
                        onClick={() => onEdit(task)}
                        className={`w-full text-start text-[10px] leading-tight px-1.5 py-1 rounded-md truncate font-medium transition-all hover:scale-[1.02] ${
                          task.status === "done"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 line-through"
                            : isOverdue
                            ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                            : task.status === "in_progress"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        } ${task.priority === "high" ? "border border-rose-300 dark:border-rose-700" : ""}`}
                      >
                        {task.title}
                      </button>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <p className="text-[9px] text-center text-muted-foreground font-medium">
                      +{dayTasks.length - 3}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unscheduled tasks */}
      {unscheduled.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <h4 className="font-bold text-sm">{t("noDueDate")} ({unscheduled.length})</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {unscheduled.map((task) => (
              <button
                key={task.id}
                onClick={() => onEdit(task)}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[task.status]}`} />
                {task.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
