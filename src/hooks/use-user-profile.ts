"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types";

const STORAGE_KEY = "crm-user-profile";

const DEFAULT_PROFILE: UserProfile = {
  fullName: "ענת",
  phone: "",
  email: "",
  companyName: "AP Automations",
  companyId: "",
  address: "",
  website: "",
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProfile(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      const updated = { ...profile, ...updates };
      setProfile(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [profile]
  );

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { profile, updateProfile, resetProfile, DEFAULT_PROFILE };
}
