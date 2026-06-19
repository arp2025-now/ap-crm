"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Upload, Trash2, RotateCcw, Settings, Palette, Building2, Image,
  User, Users, Shield, Mail, Phone, Globe, MapPin, Hash, Plus,
  Pencil, CheckCircle2, XCircle, Crown, Eye, UserCheck, Sparkles,
  GripVertical, GitBranch, SlidersHorizontal,
} from "lucide-react";
import { useCustomFieldDefinitions, NewFieldInput } from "@/hooks/use-custom-field-definitions";
import { EntityType, FieldType } from "@/lib/custom-fields/types";
import { useBranding } from "@/hooks/use-branding";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useCrmUsers } from "@/hooks/use-crm-users";
import { usePipelineStages } from "@/hooks/use-pipeline-stages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";
import type { CrmUser, CrmUserRole, PermissionLevel } from "@/lib/types";

const TABS = ["profile", "branding", "users", "pipeline", "custom_fields"] as const;
type SettingsTab = typeof TABS[number];

const TAB_ICONS: Record<SettingsTab, typeof User> = {
  profile: User,
  branding: Palette,
  users: Users,
  pipeline: GitBranch,
  custom_fields: SlidersHorizontal,
};


const ROLE_CONFIG: Record<CrmUserRole, { icon: typeof Crown; color: string; bg: string }> = {
  admin: { icon: Crown, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700" },
  manager: { icon: Shield, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-700" },
  agent: { icon: UserCheck, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700" },
  viewer: { icon: Eye, color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
};

const PERM_COLORS: Record<PermissionLevel, string> = {
  full: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200",
  readonly: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200",
  none: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200",
};

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { branding, updateBranding, resetBranding } = useBranding();
  const { profile, updateProfile } = useUserProfile();
  const { users, addUser, updateUser, deleteUser, DEFAULT_PERMISSIONS } = useCrmUsers();
  const { stages, addStage, deleteStage } = usePipelineStages();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TAB_LABELS: Record<SettingsTab, string> = {
    profile: t('tabProfile'),
    branding: t('tabBranding'),
    users: t('tabUsers'),
    pipeline: t('tabPipeline'),
    custom_fields: 'שדות מותאמים',
  };

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [newStageName, setNewStageName] = useState("");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CrmUser | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<CrmUserRole>("agent");
  const [profileSaved, setProfileSaved] = useState(false);

  // Custom fields tab state
  const [cfEntityType, setCfEntityType] = useState<EntityType>('lead');
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldChoices, setNewFieldChoices] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const {
    fields: customFields,
    loading: cfLoading,
    addField,
    deleteField,
  } = useCustomFieldDefinitions(cfEntityType);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateBranding({ logoDataUrl: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const openUserDialog = (user?: CrmUser) => {
    if (user) {
      setEditingUser(user);
      setFormName(user.name);
      setFormEmail(user.email);
      setFormRole(user.role);
    } else {
      setEditingUser(null);
      setFormName("");
      setFormEmail("");
      setFormRole("agent");
    }
    setUserDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!formName.trim() || !formEmail.trim()) return;
    if (editingUser) {
      updateUser(editingUser.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        permissions: DEFAULT_PERMISSIONS[formRole],
      });
    } else {
      addUser({ name: formName.trim(), email: formEmail.trim(), role: formRole });
    }
    setUserDialogOpen(false);
  };

  function handleAddStage() {
    if (!newStageName.trim()) return;
    addStage({ name: newStageName.trim(), color: '#6366f1' });
    setNewStageName('');
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -start-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Settings className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
            <p className="text-white/70 text-sm mt-0.5">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-card border text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950/30"
              }`}
            >
              <Icon className="h-4 w-4" />
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === "profile" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{t("userProfile")}</h2>
                <p className="text-xs text-muted-foreground">{t("userProfileDesc")}</p>
              </div>
            </div>

            {/* Avatar area */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border">
              <Avatar className="h-16 w-16 rounded-2xl">
                <AvatarFallback className="bg-blue-600 text-white text-xl font-bold rounded-2xl">
                  {getInitials(profile.fullName || "U")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-lg">{profile.fullName || "—"}</p>
                <p className="text-sm text-muted-foreground">{profile.companyName || "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => updateProfile({ fullName: e.target.value })}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateProfile({ phone: e.target.value })}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("email")}
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("companyName")}
                </label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => updateProfile({ companyName: e.target.value })}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("companyId")}
                </label>
                <input
                  type="text"
                  value={profile.companyId}
                  onChange={(e) => updateProfile({ companyId: e.target.value })}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  placeholder="ח״פ / עוסק מורשה"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("website")}
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => updateProfile({ website: e.target.value })}
                  className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  placeholder="https://"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {t("address")}
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => updateProfile({ address: e.target.value })}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSaveProfile} className="shadow-md">
                {t("saveProfile")}
              </Button>
              {profileSaved && (
                <span className="text-sm text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("profileSaved")}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Branding Tab ── */}
      {activeTab === "branding" && (
        <div className="max-w-2xl">
          <div className="rounded-2xl border bg-card p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Palette className="h-5 w-5 text-violet-600" />
              </div>
              <h2 className="text-lg font-bold">{t("branding")}</h2>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                {t("companyName")}
              </label>
              <input
                type="text"
                value={branding.companyName}
                onChange={(e) => updateBranding({ companyName: e.target.value })}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("contactEmail")}</label>
              <input
                type="email"
                value={branding.contactEmail}
                onChange={(e) => updateBranding({ contactEmail: e.target.value })}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Image className="h-3.5 w-3.5 text-muted-foreground" />
                {t("logo")}
              </label>
              <div className="flex items-center gap-4">
                {branding.logoDataUrl ? (
                  <div className="relative group">
                    <img src={branding.logoDataUrl} alt="Logo" className="h-16 w-16 rounded-xl object-contain border bg-white p-1" />
                    <button
                      onClick={() => updateBranding({ logoDataUrl: undefined })}
                      className="absolute -top-2 -end-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 flex items-center justify-center text-blue-400">
                    <Upload className="h-5 w-5" />
                  </div>
                )}
                <div className="space-y-1">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 me-2" />
                    {t("uploadLogo")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("primaryColor")}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={branding.primaryColor} onChange={(e) => updateBranding({ primaryColor: e.target.value })} className="h-10 w-10 rounded-lg border cursor-pointer" />
                  <input type="text" value={branding.primaryColor} onChange={(e) => updateBranding({ primaryColor: e.target.value })} className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("secondaryColor")}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={branding.secondaryColor} onChange={(e) => updateBranding({ secondaryColor: e.target.value })} className="h-10 w-10 rounded-lg border cursor-pointer" />
                  <input type="text" value={branding.secondaryColor} onChange={(e) => updateBranding({ secondaryColor: e.target.value })} className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm font-mono" />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("preview")}</label>
              <div className="rounded-xl overflow-hidden border">
                <div className="p-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.primaryColor}cc)` }}>
                  {branding.logoDataUrl ? (
                    <img src={branding.logoDataUrl} alt="" className="h-8 w-8 rounded-lg object-contain bg-white/20 p-0.5" />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-xs">{branding.companyName.charAt(0)}</div>
                  )}
                  <div>
                    <p className="text-white font-bold text-sm">{branding.companyName}</p>
                    <p className="text-white/70 text-xs">{branding.contactEmail}</p>
                  </div>
                </div>
                <div className="p-4 flex gap-2">
                  <div className="rounded-lg px-3 py-1.5 text-xs text-white font-medium" style={{ backgroundColor: branding.primaryColor }}>Primary</div>
                  <div className="rounded-lg px-3 py-1.5 text-xs text-white font-medium" style={{ backgroundColor: branding.secondaryColor }}>Secondary</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" onClick={resetBranding}>
                <RotateCcw className="h-4 w-4 me-2" />
                {t("resetDefaults")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Users Tab ── */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{t("usersManagement")}</h2>
                  <p className="text-xs text-muted-foreground">{t("usersManagementDesc")}</p>
                </div>
              </div>
              <Button onClick={() => openUserDialog()} className="shadow-md">
                <Plus className="h-4 w-4 me-1" />
                {t("addUser")}
              </Button>
            </div>

            {/* Current user card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 rounded-xl">
                  <AvatarFallback className="bg-blue-600 text-white text-lg font-bold rounded-xl">
                    {getInitials(profile.fullName || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{profile.fullName}</p>
                    <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700 text-[10px] py-0 h-5 gap-0.5">
                      <Crown className="h-2.5 w-2.5" />
                      {t("roleAdmin")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 border-emerald-200 text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {t("userActive")}
                </Badge>
              </div>
            </div>

            {/* Users list */}
            {users.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="font-semibold text-lg">{t("noUsers")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("noUsersHint")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => {
                  const roleConfig = ROLE_CONFIG[user.role];
                  const RoleIcon = roleConfig.icon;
                  return (
                    <div key={user.id} className="group flex items-center gap-4 p-4 rounded-xl border hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all">
                      <Avatar className="h-10 w-10 rounded-xl">
                        <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-sm font-bold rounded-xl">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <Badge variant="outline" className={`text-[10px] py-0 h-5 gap-0.5 ${roleConfig.bg}`}>
                            <RoleIcon className="h-2.5 w-2.5" />
                            {t(`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` as any)}
                          </Badge>
                          {!user.active && (
                            <Badge variant="outline" className="text-[10px] py-0 h-5 gap-0.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 border-rose-200">
                              <XCircle className="h-2.5 w-2.5" />
                              {t("userInactive")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {/* Permission pills */}
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {(Object.entries(user.permissions) as [string, PermissionLevel][]).map(([key, level]) => (
                            <span key={key} className={`text-[9px] px-1.5 py-0.5 rounded-md border font-medium ${PERM_COLORS[level]}`}>
                              {t(`perm${key.charAt(0).toUpperCase() + key.slice(1)}` as any)}: {t(`perm${level === "full" ? "Full" : level === "readonly" ? "ReadOnly" : "None"}` as any)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openUserDialog(user)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteUser(user.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Pipeline Stages Tab ── */}
      {activeTab === "pipeline" && (
        <div className="max-w-2xl">
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold">שלבי תהליך מכירה</h2>
                <p className="text-xs text-muted-foreground">ניהול שלבי הפייפליין</p>
              </div>
            </div>

            <section className="space-y-4">
              <div className="space-y-2">
                {[...stages].sort((a, b) => a.order - b.order).map((stage) => (
                  <div key={stage.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border rounded-lg">
                    <GripVertical className="w-4 h-4 text-gray-300" />
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="flex-1 text-sm">{stage.name}</span>
                    <button
                      onClick={() => deleteStage(stage.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="מחק שלב"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="שם שלב חדש..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddStage(); }}
                />
                <button
                  onClick={handleAddStage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  הוסף
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ── Custom Fields Tab ── */}
      {activeTab === 'custom_fields' && (
        <div className="max-w-2xl">
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <SlidersHorizontal className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold">שדות מותאמים</h2>
                <p className="text-xs text-muted-foreground">הגדרת שדות נוספים לכל סוג ישות</p>
              </div>
            </div>

            {/* Entity selector */}
            <div className="flex gap-2 flex-wrap">
              {([
                ['lead', 'לידים'],
                ['customer', 'לקוחות'],
                ['task', 'משימות'],
                ['meeting', 'פגישות'],
                ['recording', 'הקלטות'],
                ['whatsapp', 'WhatsApp'],
              ] as [EntityType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => { setCfEntityType(type); setAddFieldOpen(false); }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    cfEntityType === type
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Field list */}
            <div className="space-y-2">
              {cfLoading ? (
                <p className="text-sm text-muted-foreground">טוען...</p>
              ) : customFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">אין שדות מותאמים עדיין</p>
              ) : (
                customFields.map(field => (
                  <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-300" />
                      <div>
                        <p className="text-sm font-medium">{field.name}</p>
                        <p className="text-xs text-muted-foreground">{field.fieldType}{field.isRequired ? ' · חובה' : ''}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteField(field.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                      aria-label="מחק שדה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add field */}
            {!addFieldOpen ? (
              <button
                onClick={() => setAddFieldOpen(true)}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <Plus className="w-4 h-4" />
                הוסף שדה
              </button>
            ) : (
              <div className="border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-slate-800/50">
                <p className="text-sm font-medium">שדה חדש</p>
                <input
                  type="text"
                  placeholder="שם השדה"
                  value={newFieldName}
                  onChange={e => setNewFieldName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  dir="rtl"
                  autoFocus
                />
                <select
                  value={newFieldType}
                  onChange={e => setNewFieldType(e.target.value as FieldType)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                >
                  <option value="text">טקסט</option>
                  <option value="number">מספר</option>
                  <option value="date">תאריך</option>
                  <option value="checkbox">תיבת סימון</option>
                  <option value="dropdown">רשימת בחירה</option>
                  <option value="multi_select">בחירה מרובה</option>
                  <option value="phone">טלפון</option>
                  <option value="url">קישור</option>
                  <option value="file">קובץ</option>
                </select>
                {(newFieldType === 'dropdown' || newFieldType === 'multi_select') && (
                  <input
                    type="text"
                    placeholder="אפשרויות — מופרדות בפסיק (אדום, כחול, ירוק)"
                    value={newFieldChoices}
                    onChange={e => setNewFieldChoices(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    dir="rtl"
                  />
                )}
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFieldRequired}
                    onChange={e => setNewFieldRequired(e.target.checked)}
                    className="rounded"
                  />
                  שדה חובה
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!newFieldName.trim()) return;
                      const input: NewFieldInput = {
                        name: newFieldName.trim(),
                        fieldType: newFieldType,
                        isRequired: newFieldRequired,
                        options: (newFieldType === 'dropdown' || newFieldType === 'multi_select')
                          ? { choices: newFieldChoices.split(',').map(s => s.trim()).filter(Boolean) }
                          : {},
                      };
                      await addField(input);
                      setNewFieldName('');
                      setNewFieldType('text');
                      setNewFieldChoices('');
                      setNewFieldRequired(false);
                      setAddFieldOpen(false);
                    }}
                    disabled={!newFieldName.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    שמור
                  </button>
                  <button
                    onClick={() => {
                      setAddFieldOpen(false);
                      setNewFieldName('');
                      setNewFieldType('text');
                      setNewFieldChoices('');
                      setNewFieldRequired(false);
                    }}
                    className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── User Dialog ── */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? t("editUser") : t("addUser")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("userName")}</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("userEmail")}</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("userRole")}</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as CrmUserRole)}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              >
                <option value="admin">{t("roleAdmin")}</option>
                <option value="manager">{t("roleManager")}</option>
                <option value="agent">{t("roleAgent")}</option>
                <option value="viewer">{t("roleViewer")}</option>
              </select>
              {/* Permission preview */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border mt-2">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">{t("permissions")}:</p>
                <div className="flex flex-wrap gap-1">
                  {(Object.entries(DEFAULT_PERMISSIONS[formRole]) as [string, PermissionLevel][]).map(([key, level]) => (
                    <span key={key} className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${PERM_COLORS[level]}`}>
                      {t(`perm${key.charAt(0).toUpperCase() + key.slice(1)}` as any)}: {t(`perm${level === "full" ? "Full" : level === "readonly" ? "ReadOnly" : "None"}` as any)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialogOpen(false)}>ביטול</Button>
            <Button onClick={handleSaveUser} disabled={!formName.trim() || !formEmail.trim()}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
