"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  CalendarDays, Plus, ChevronLeft, ChevronRight,
  Clock, Phone as PhoneIcon, Users, Bell, MoreHorizontal,
  Trash2, Pencil, Link2, Video, Globe, Wifi, WifiOff,
  RefreshCw, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCalendar } from "@/hooks/use-calendar";
import { useLeads } from "@/hooks/use-leads";
import { useCustomers } from "@/hooks/use-customers";
import type { CalendarEvent, CalendarEventType, CalendarSync } from "@/lib/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const EVENT_TYPE_CONFIG: Record<CalendarEventType, { icon: typeof Video; color: string; bg: string }> = {
  meeting: { icon: Video, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-700" },
  call: { icon: PhoneIcon, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700" },
  task: { icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700" },
  reminder: { icon: Bell, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-700" },
  other: { icon: MoreHorizontal, color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
};

const SYNC_ICONS: Record<string, { icon: typeof Globe; color: string; brand: string }> = {
  google: { icon: Globe, color: "text-red-500", brand: "bg-gradient-to-br from-red-500 via-yellow-500 to-green-500" },
  outlook: { icon: Globe, color: "text-blue-600", brand: "bg-gradient-to-br from-blue-500 to-blue-700" },
  apple: { icon: Globe, color: "text-slate-700", brand: "bg-gradient-to-br from-slate-600 to-slate-800" },
};

const HE_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const HE_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

export default function CalendarPage() {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const isHe = locale === "he";
  const { events, syncs, addEvent, updateEvent, deleteEvent, toggleSync } = useCalendar();
  const { leads } = useLeads();
  const { customers } = useCustomers();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("10:00");
  const [formAllDay, setFormAllDay] = useState(false);
  const [formType, setFormType] = useState<CalendarEventType>("meeting");
  const [formNotes, setFormNotes] = useState("");
  const [formLinkedLeadId, setFormLinkedLeadId] = useState("");
  const [formLinkedCustomerId, setFormLinkedCustomerId] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; dateKey: string }[] = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      days.push({ date: d, isCurrentMonth: false, isToday: false, dateKey: d.toISOString().slice(0, 10) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isToday = date.toDateString() === today.toDateString();
      days.push({ date, isCurrentMonth: true, isToday, dateKey: date.toISOString().slice(0, 10) });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      days.push({ date, isCurrentMonth: false, isToday: false, dateKey: date.toISOString().slice(0, 10) });
    }
    return days;
  }, [year, month, daysInMonth, firstDayOfWeek, prevMonthDays]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const monthLabel = isHe ? `${HE_MONTHS[month]} ${year}` : currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  const openNew = (date?: string) => {
    setEditingEvent(null);
    setFormTitle("");
    setFormDate(date || new Date().toISOString().slice(0, 10));
    setFormStartTime("09:00");
    setFormEndTime("10:00");
    setFormAllDay(false);
    setFormType("meeting");
    setFormNotes("");
    setFormLinkedLeadId("");
    setFormLinkedCustomerId("");
    setDialogOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDate(event.date);
    setFormStartTime(event.startTime || "09:00");
    setFormEndTime(event.endTime || "10:00");
    setFormAllDay(event.allDay);
    setFormType(event.type);
    setFormNotes(event.notes || "");
    setFormLinkedLeadId(event.linkedLeadId || "");
    setFormLinkedCustomerId(event.linkedCustomerId || "");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;
    const lead = leads.find((l) => l.id === formLinkedLeadId);
    const customer = customers.find((c) => c.id === formLinkedCustomerId);
    const data = {
      title: formTitle.trim(),
      date: formDate,
      startTime: formAllDay ? undefined : formStartTime,
      endTime: formAllDay ? undefined : formEndTime,
      allDay: formAllDay,
      type: formType,
      notes: formNotes.trim() || undefined,
      linkedLeadId: formLinkedLeadId || undefined,
      linkedLeadName: lead?.customerName || undefined,
      linkedCustomerId: formLinkedCustomerId || undefined,
      linkedCustomerName: customer?.name || undefined,
    };
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      addEvent(data);
    }
    setDialogOpen(false);
  };

  // Upcoming events (sidebar)
  const upcomingEvents = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return events
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || "").localeCompare(b.startTime || ""))
      .slice(0, 8);
  }, [events]);

  return (
    <div className="space-y-6 pb-10">
      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -start-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <CalendarDays className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
              <p className="text-white/70 text-sm mt-0.5">{t("subtitle")}</p>
            </div>
          </div>
          <Button onClick={() => openNew()} className="bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-lg">
            <Plus className="h-4 w-4 me-1" />
            {t("addEvent")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Calendar Grid ── */}
        <div className="lg:col-span-3 rounded-2xl border bg-card shadow-sm overflow-hidden">
          {/* Month navigation */}
          <div className="p-4 border-b bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-violet-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-bold min-w-[160px] text-center">{monthLabel}</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setCurrentDate(new Date())}>
                {t("today")}
              </Button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b">
            {HE_DAYS.map((day) => (
              <div key={day} className="p-2 text-center text-xs font-bold text-muted-foreground bg-slate-50/50 dark:bg-slate-900/30">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayEvents = eventsByDate[day.dateKey] || [];
              return (
                <div
                  key={idx}
                  onClick={() => openNew(day.dateKey)}
                  className={`min-h-[100px] border-b border-e p-1.5 cursor-pointer transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/20 ${
                    !day.isCurrentMonth ? "bg-slate-50/50 dark:bg-slate-950/30" :
                    day.isToday ? "bg-blue-50/70 dark:bg-blue-950/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full ${
                      day.isToday ? "bg-blue-600 text-white font-bold" :
                      !day.isCurrentMonth ? "text-muted-foreground/40" : "text-foreground"
                    }`}>
                      {day.date.getDate()}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((evt) => {
                      const cfg = EVENT_TYPE_CONFIG[evt.type];
                      return (
                        <button
                          key={evt.id}
                          onClick={(e) => { e.stopPropagation(); openEdit(evt); }}
                          className={`w-full text-start text-[10px] leading-tight px-1.5 py-1 rounded-md truncate font-medium border transition-all hover:scale-[1.02] ${cfg.bg}`}
                        >
                          {!evt.allDay && evt.startTime && (
                            <span className="opacity-60">{evt.startTime} </span>
                          )}
                          {evt.title}
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <p className="text-[9px] text-center text-muted-foreground font-medium">+{dayEvents.length - 3}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Sync section */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
              </div>
              <h4 className="font-bold text-sm">{t("syncCalendar")}</h4>
            </div>
            {syncs.map((sync) => {
              const cfg = SYNC_ICONS[sync.provider];
              return (
                <div key={sync.provider} className="flex items-center justify-between p-3 rounded-xl border bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-lg ${cfg.brand} flex items-center justify-center`}>
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t(`sync${sync.provider.charAt(0).toUpperCase() + sync.provider.slice(1)}` as any)}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {sync.connected ? (
                          <>
                            <Wifi className="h-2.5 w-2.5 text-emerald-500" />
                            <span className="text-[10px] text-emerald-600 font-medium">{t("syncConnected")}</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="h-2.5 w-2.5 text-slate-400" />
                            <span className="text-[10px] text-slate-400 font-medium">{t("syncDisconnected")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={sync.connected ? "ghost" : "outline"}
                    size="sm"
                    className="text-xs h-7 rounded-lg"
                    onClick={() => toggleSync(sync.provider)}
                  >
                    {sync.connected ? t("syncDisconnect") : t("syncConnect")}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Upcoming events */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-sky-500/15 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              </div>
              <h4 className="font-bold text-sm">{t("upcomingEvents")}</h4>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">{t("noEvents")}</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((evt) => {
                  const cfg = EVENT_TYPE_CONFIG[evt.type];
                  const EvtIcon = cfg.icon;
                  return (
                    <button
                      key={evt.id}
                      onClick={() => openEdit(evt)}
                      className="w-full text-start p-2.5 rounded-xl border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-lg ${cfg.bg} border flex items-center justify-center shrink-0`}>
                          <EvtIcon className={`h-3 w-3 ${cfg.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{evt.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(evt.date).toLocaleDateString(isHe ? "he-IL" : "en-US", { day: "numeric", month: "short" })}
                            {evt.startTime && ` • ${evt.startTime}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Event Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? t("editEvent") : t("addEvent")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("eventTitle")}</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("eventDate")}</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("eventType")}</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as CalendarEventType)}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                >
                  <option value="meeting">{t("typeMeeting")}</option>
                  <option value="call">{t("typeCall")}</option>
                  <option value="task">{t("typeTask")}</option>
                  <option value="reminder">{t("typeReminder")}</option>
                  <option value="other">{t("typeOther")}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formAllDay}
                onChange={(e) => setFormAllDay(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="allDay" className="text-sm font-medium">{t("allDay")}</label>
            </div>

            {!formAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("eventTime")}</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("eventEndTime")}</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("eventNotes")}</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("linkedTo")} - ליד</label>
                <select
                  value={formLinkedLeadId}
                  onChange={(e) => setFormLinkedLeadId(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                >
                  <option value="">ללא</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.customerName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("linkedTo")} - לקוח</label>
                <select
                  value={formLinkedCustomerId}
                  onChange={(e) => setFormLinkedCustomerId(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                >
                  <option value="">ללא</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            {editingEvent && (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive me-auto"
                onClick={() => { deleteEvent(editingEvent.id); setDialogOpen(false); }}
              >
                <Trash2 className="h-4 w-4 me-1" />
                {t("deleteEvent")}
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>ביטול</Button>
            <Button onClick={handleSave} disabled={!formTitle.trim()}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
