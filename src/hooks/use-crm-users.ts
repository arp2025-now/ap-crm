"use client";

import { useState, useEffect, useCallback } from "react";
import type { CrmUser, CrmUserRole, CrmUserPermissions } from "@/lib/types";

const STORAGE_KEY = "crm-users";

const DEFAULT_PERMISSIONS: Record<CrmUserRole, CrmUserPermissions> = {
  admin: { leads: "full", customers: "full", quotes: "full", finance: "full", settings: "full" },
  manager: { leads: "full", customers: "full", quotes: "full", finance: "readonly", settings: "readonly" },
  agent: { leads: "full", customers: "full", quotes: "readonly", finance: "none", settings: "none" },
  viewer: { leads: "readonly", customers: "readonly", quotes: "readonly", finance: "none", settings: "none" },
};

function loadUsers(): CrmUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useCrmUsers() {
  const [users, setUsers] = useState<CrmUser[]>([]);

  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  const save = useCallback((updated: CrmUser[]) => {
    setUsers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addUser = useCallback((data: {
    name: string;
    email: string;
    role: CrmUserRole;
  }) => {
    const user: CrmUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      active: true,
      permissions: DEFAULT_PERMISSIONS[data.role],
      createdAt: new Date().toISOString(),
    };
    save([user, ...users]);
    return user;
  }, [users, save]);

  const updateUser = useCallback((id: string, data: Partial<CrmUser>) => {
    save(users.map((u) => (u.id === id ? { ...u, ...data } : u)));
  }, [users, save]);

  const deleteUser = useCallback((id: string) => {
    save(users.filter((u) => u.id !== id));
  }, [users, save]);

  return { users, addUser, updateUser, deleteUser, DEFAULT_PERMISSIONS };
}
