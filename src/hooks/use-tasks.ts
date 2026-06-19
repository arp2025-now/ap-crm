"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, TaskStatus, TaskPriority } from "@/lib/types";
import { logActivity } from "@/hooks/use-activity-log";

const STORAGE_KEY = "crm-tasks";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  const save = useCallback((updated: Task[]) => {
    setTasks(updated);
    saveTasks(updated);
  }, []);

  const addTask = useCallback((data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    linkedLeadId?: string;
    linkedLeadName?: string;
    linkedCustomerId?: string;
    linkedCustomerName?: string;
  }) => {
    const task: Task = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description || "",
      status: "todo",
      priority: data.priority || "medium",
      dueDate: data.dueDate,
      linkedLeadId: data.linkedLeadId,
      linkedLeadName: data.linkedLeadName,
      linkedCustomerId: data.linkedCustomerId,
      linkedCustomerName: data.linkedCustomerName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "×¢× ×ª",
    };
    save([task, ...tasks]);
    logActivity("create", "task", task.id, data.title);
    return task;
  }, [tasks, save]);

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    const prev = tasks.find((t) => t.id === id);
    save(tasks.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t)));
    if (prev) {
      if (data.status && data.status !== prev.status) {
        logActivity("status_change", "task", id, prev.title, undefined, { status: { from: prev.status, to: data.status } });
      } else {
        const changes = Object.keys(data).filter(
          (k) => (data as unknown as Record<string, unknown>)[k] !== (prev as unknown as Record<string, unknown>)[k]
        );
        logActivity("update", "task", id, prev.title, changes.join(", "));
      }
    }
  }, [tasks, save]);

  const deleteTask = useCallback((id: string) => {
    const prev = tasks.find((t) => t.id === id);
    save(tasks.filter((t) => t.id !== id));
    if (prev) {
      logActivity("delete", "task", id, prev.title);
    }
  }, [tasks, save]);

  const getTasksForLead = useCallback((leadId: string) => {
    return tasks.filter((t) => t.linkedLeadId === leadId);
  }, [tasks]);

  const getTasksForCustomer = useCallback((customerId: string) => {
    return tasks.filter((t) => t.linkedCustomerId === customerId);
  }, [tasks]);

  return { tasks, addTask, updateTask, deleteTask, getTasksForLead, getTasksForCustomer };
}
