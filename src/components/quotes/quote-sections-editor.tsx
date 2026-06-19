"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  BookmarkPlus, BookTemplate, Pencil, Check, X,
  AlignLeft, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type { QuoteSection, QuoteSectionTemplate } from "@/lib/types";

interface QuoteSectionsEditorProps {
  sections: QuoteSection[];
  onChange: (sections: QuoteSection[]) => void;
  templates: QuoteSectionTemplate[];
  onSaveTemplate: (name: string, sections: QuoteSection[]) => void;
  onUpdateTemplate: (id: string, data: { name?: string; sections?: QuoteSection[] }) => void;
  onDeleteTemplate: (id: string) => void;
  onApplyTemplate: (templateId: string) => QuoteSection[];
}

export function QuoteSectionsEditor({
  sections,
  onChange,
  templates,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onApplyTemplate,
}: QuoteSectionsEditorProps) {
  const t = useTranslations("quotes");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState("");

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addSection = () => {
    const newSection: QuoteSection = {
      id: `sec-${Date.now()}`,
      title: t("newSection"),
      content: "",
      order: sections.length,
    };
    onChange([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    const updated = sections
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order: i }));
    onChange(updated);
  };

  const updateSection = (id: string, data: Partial<QuoteSection>) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    const idx = sorted.findIndex((s) => s.id === id);
    if (direction === "up" && idx <= 0) return;
    if (direction === "down" && idx >= sorted.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const updated = sorted.map((s, i) => {
      if (i === idx) return { ...s, order: swapIdx };
      if (i === swapIdx) return { ...s, order: idx };
      return s;
    });
    onChange(updated);
  };

  const startEditTitle = (section: QuoteSection) => {
    setEditingTitleId(section.id);
    setEditingTitle(section.title);
  };

  const commitEditTitle = () => {
    if (editingTitleId && editingTitle.trim()) {
      updateSection(editingTitleId, { title: editingTitle.trim() });
    }
    setEditingTitleId(null);
  };

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) return;
    onSaveTemplate(newTemplateName.trim(), sections);
    setNewTemplateName("");
    setTemplateDialogOpen(false);
  };

  const handleApplyTemplate = (tplId: string) => {
    const newSections = onApplyTemplate(tplId);
    onChange(newSections);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-teal-500/15 flex items-center justify-center">
            <Layers className="h-4 w-4 text-teal-600" />
          </div>
          {t("sections")}
          <span className="text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/40 rounded-full px-2.5 py-0.5">
            {sections.length}
          </span>
        </h3>
        <div className="flex items-center gap-1.5">
          {/* Template dropdown */}
          {templates.length > 0 && (
            <div className="relative group">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <BookTemplate className="h-3.5 w-3.5" />
                {t("applyTemplate")}
              </Button>
              <div className="absolute end-0 top-full mt-1 w-56 bg-popover border rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl.id)}
                    className="w-full text-start px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>{tpl.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {tpl.sections.length} {t("sectionsCount")}
                    </span>
                  </button>
                ))}
                <div className="border-t my-1" />
                <button
                  onClick={() => setTemplateManagerOpen(true)}
                  className="w-full text-start px-3 py-2 text-sm hover:bg-muted transition-colors text-muted-foreground flex items-center gap-1.5"
                >
                  <Pencil className="h-3 w-3" />
                  {t("manageTemplates")}
                </button>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setTemplateDialogOpen(true)}
            disabled={sections.length === 0}
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            {t("saveAsTemplate")}
          </Button>

          <Button size="sm" className="gap-1.5 text-xs" onClick={addSection}>
            <Plus className="h-3.5 w-3.5" />
            {t("addSection")}
          </Button>
        </div>
      </div>

      {/* Section cards */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-teal-300/40 dark:border-teal-700/40 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/20 dark:to-cyan-950/20 p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <AlignLeft className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t("noSections")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("noSectionsHint")}</p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={addSection}>
                <Plus className="h-3.5 w-3.5 me-1.5" />
                {t("addSection")}
              </Button>
              {templates.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApplyTemplate(templates[0].id)}
                >
                  <BookTemplate className="h-3.5 w-3.5 me-1.5" />
                  {t("useTemplate")}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((section, idx) => {
            const isCollapsed = collapsedIds.has(section.id);
            const isEditingTitle = editingTitleId === section.id;

            return (
              <div
                key={section.id}
                className="group rounded-2xl border bg-card transition-all duration-200 hover:shadow-md hover:border-teal-300/40 dark:hover:border-teal-700/40 relative overflow-hidden"
              >
                {/* Color accent stripe */}
                <div className="absolute top-0 end-0 bottom-0 w-1 rounded-e-2xl" style={{ background: `hsl(${(idx * 60 + 160) % 360}, 70%, 55%)` }} />
                {/* Section header */}
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <div className="flex items-center gap-0.5 text-muted-foreground/40">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveSection(section.id, "up")}
                      disabled={idx === 0}
                      className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveSection(section.id, "down")}
                      disabled={idx === sorted.length - 1}
                      className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Title — editable inline */}
                  {isEditingTitle ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="h-7 text-sm font-semibold"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEditTitle();
                          if (e.key === "Escape") setEditingTitleId(null);
                        }}
                      />
                      <button
                        onClick={commitEditTitle}
                        className="h-6 w-6 rounded flex items-center justify-center text-secondary hover:bg-secondary/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingTitleId(null)}
                        className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:bg-muted"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditTitle(section)}
                      className="flex-1 text-start flex items-center gap-2"
                    >
                      <span className="text-sm font-semibold hover:text-primary transition-colors">
                        {section.title}
                      </span>
                      <Pencil className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-all" />
                    </button>
                  )}

                  {/* Collapse / delete */}
                  <div className="flex items-center gap-1 ms-auto">
                    <button
                      onClick={() => toggleCollapse(section.id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? (document.documentElement.dir === "rtl" ? "rotate-90" : "-rotate-90") : ""}`}
                      />
                    </button>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-destructive/60 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Section content */}
                {!isCollapsed && (
                  <div className="px-3 pb-3">
                    <textarea
                      className="w-full rounded-lg border border-input/50 bg-muted/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-transparent transition-all resize-y min-h-[80px]"
                      value={section.content}
                      onChange={(e) => updateSection(section.id, { content: e.target.value })}
                      placeholder={t("sectionPlaceholder")}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Save as template dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("saveAsTemplate")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">{t("templateName")}</label>
              <Input
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder={t("templateNamePlaceholder")}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveAsTemplate();
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("templateSaveHint", { count: sections.length })}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSaveAsTemplate} disabled={!newTemplateName.trim()}>
              <BookmarkPlus className="h-4 w-4 me-1.5" />
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template manager dialog */}
      <Dialog open={templateManagerOpen} onOpenChange={setTemplateManagerOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("manageTemplates")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-[400px] overflow-y-auto">
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">{t("noTemplates")}</p>
            ) : (
              templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-center gap-3 rounded-lg border p-3 group hover:border-primary/20 transition-colors"
                >
                  {editingTemplateId === tpl.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingTemplateName}
                        onChange={(e) => setEditingTemplateName(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            onUpdateTemplate(tpl.id, { name: editingTemplateName.trim() });
                            setEditingTemplateId(null);
                          }
                          if (e.key === "Escape") setEditingTemplateId(null);
                        }}
                      />
                      <button
                        onClick={() => {
                          onUpdateTemplate(tpl.id, { name: editingTemplateName.trim() });
                          setEditingTemplateId(null);
                        }}
                        className="h-7 w-7 rounded flex items-center justify-center text-secondary hover:bg-secondary/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tpl.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tpl.sections.length} {t("sectionsCount")} &middot;{" "}
                          {tpl.sections.map((s) => s.title).join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            onUpdateTemplate(tpl.id, {
                              sections: sections.map(({ id, title, content, order }) => ({ id, title, content, order })),
                            });
                          }}
                          className="h-7 px-2 rounded text-xs text-muted-foreground hover:bg-muted transition-colors"
                          title={t("updateTemplateFromCurrent")}
                        >
                          {t("updateShort")}
                        </button>
                        <button
                          onClick={() => {
                            setEditingTemplateId(tpl.id);
                            setEditingTemplateName(tpl.name);
                          }}
                          className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => onDeleteTemplate(tpl.id)}
                          className="h-7 w-7 rounded flex items-center justify-center text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
