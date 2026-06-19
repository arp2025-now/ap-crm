"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  ClipboardList, Plus, Trash2, Copy, Check, Eye, Pencil,
  FileText, BarChart3, Power, PowerOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useForms, useFormResponses } from "@/hooks/use-forms";
import { FormBuilderDialog } from "@/components/forms/form-builder-dialog";
import { FormResponses } from "@/components/forms/form-responses";
import type { WebForm, WebFormStatus } from "@/lib/types";

const STATUS_STYLES: Record<WebFormStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-red-100 text-red-700 border-red-200",
};

export default function FormsPage() {
  const t = useTranslations("forms");
  const locale = useLocale();
  const { forms, addForm, updateForm, deleteForm } = useForms();
  const { responses } = useFormResponses();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<WebForm | null>(null);
  const [viewingResponses, setViewingResponses] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeForms = forms.filter((f) => f.status === "active").length;
  const totalResponses = forms.reduce((sum, f) => sum + f.responseCount, 0);

  const handleSave = (data: Partial<WebForm>) => {
    if (editingForm) {
      updateForm(editingForm.id, data);
    } else {
      const newForm: WebForm = {
        id: `form-${Date.now()}`,
        title: data.title || "",
        description: data.description || "",
        fields: data.fields || [],
        status: "draft",
        linkedLeadId: data.linkedLeadId,
        linkedLeadName: data.linkedLeadName,
        linkedCustomerId: data.linkedCustomerId,
        linkedCustomerName: data.linkedCustomerName,
        responseCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addForm(newForm);
    }
    setEditingForm(null);
  };

  const handleEdit = (form: WebForm) => {
    setEditingForm(form);
    setDialogOpen(true);
  };

  const handleCopyLink = (formId: string) => {
    const url = `${window.location.origin}/${locale}/form/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStatus = (form: WebForm) => {
    const nextStatus: Record<WebFormStatus, WebFormStatus> = {
      draft: "active",
      active: "closed",
      closed: "active",
    };
    updateForm(form.id, { status: nextStatus[form.status] });
  };

  const viewingForm = viewingResponses
    ? forms.find((f) => f.id === viewingResponses)
    : null;
  const viewingFormResponses = viewingResponses
    ? responses.filter((r) => r.formId === viewingResponses)
    : [];

  return (
    <div className="space-y-6 pb-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 p-6 text-white shadow-lg">
        <div className="absolute top-0 end-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 start-0 h-32 w-32 -translate-x-8 translate-y-8 rounded-full bg-emerald-400/20 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
              <p className="text-white/70 text-sm">{t("subtitle")}</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingForm(null);
              setDialogOpen(true);
            }}
            className="bg-white text-teal-700 hover:bg-white/90 font-semibold shadow-lg"
          >
            <Plus className="h-4 w-4 me-1" />
            {t("addForm")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-teal-500/15 flex items-center justify-center">
              <FileText className="h-4 w-4 text-teal-600" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{t("totalForms")}</span>
          </div>
          <p className="text-2xl font-extrabold text-teal-700 dark:text-teal-300">{forms.length}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Power className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{t("activeForms")}</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{activeForms}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-sky-600" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{t("totalResponses")}</span>
          </div>
          <p className="text-2xl font-extrabold text-sky-700 dark:text-sky-300">{totalResponses}</p>
        </div>
      </div>

      {/* Responses Panel (if viewing) */}
      {viewingForm && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-sky-100 flex items-center justify-center">
                <Eye className="h-4 w-4 text-sky-600" />
              </div>
              <h3 className="font-bold">{t("responses")} — {viewingForm.title}</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewingResponses(null)}
            >
              {t("cancel")}
            </Button>
          </div>
          <FormResponses form={viewingForm} responses={viewingFormResponses} />
        </div>
      )}

      {/* Forms List */}
      {forms.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t("noForms")}</p>
          <p className="text-sm">{t("noFormsHint")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map((form) => (
            <div
              key={form.id}
              className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg">{form.title}</h3>
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[form.status]}
                    >
                      {t(`status${form.status.charAt(0).toUpperCase() + form.status.slice(1)}` as any)}
                    </Badge>
                  </div>
                  {form.description && (
                    <p className="text-sm text-muted-foreground mb-2">{form.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{form.fields.length} {t("fields")}</span>
                    <span>{t("responseCount", { count: form.responseCount })}</span>
                    {(form.linkedLeadName || form.linkedCustomerName) && (
                      <span className="text-teal-600">
                        {t("linkedTo")}: {form.linkedLeadName || form.linkedCustomerName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStatus(form)}
                    className="h-8 w-8 p-0"
                    title={form.status === "active" ? t("statusClosed") : t("statusActive")}
                  >
                    {form.status === "active" ? (
                      <Power className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <PowerOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyLink(form.id)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedId === form.id ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingResponses(form.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(form)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteForm(form.id)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      <FormBuilderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        initialData={editingForm}
      />
    </div>
  );
}
