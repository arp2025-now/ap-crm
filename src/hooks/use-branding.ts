"use client";

import { useState, useEffect, useCallback } from "react";
import type { BrandingSettings } from "@/lib/types";

const STORAGE_KEY = "crm-branding";

const DEFAULT_BRANDING: BrandingSettings = {
  companyName: "AP Automations",
  contactEmail: "anat.ugc@gmail.com",
  primaryColor: "#4338ca",
  secondaryColor: "#0d9488",
};

export function useBranding() {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBranding(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const updateBranding = useCallback(
    (updates: Partial<BrandingSettings>) => {
      const updated = { ...branding, ...updates };
      setBranding(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [branding]
  );

  const resetBranding = useCallback(() => {
    setBranding(DEFAULT_BRANDING);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { branding, updateBranding, resetBranding, DEFAULT_BRANDING };
}
