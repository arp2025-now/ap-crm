"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Trash2, Plus, Lock, Check, X, GripVertical, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FieldDefinition, FieldOption, FieldType } from "@/lib/field-definitions";

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "טקסט",
  number: "מספר",
  dropdown: "רשימה",
  status: "סטטוס",
  textarea: "אזור טקסט",
};

const PRESET_COLORS = [
  "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981",
  "#ef4444", "#06b6d4", "#f97316", "#6b7280",
];

interface FieldManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: FieldDefinition[];
  onUpdateField: (id: string, updates: Partial<FieldDefinition>) => void;
  onDeleteField: (id: string) => void;
  onAddField: (data: { name: string; type: FieldType; options?: FieldOption[] }) => void;
}

export function FieldManagerDialog({
  open, onOpenChange, fields, onUpdateField, onDeleteField, onAddField,
}: FieldManagerDialogProps) {
  const t = useTranslations("leads");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editOptions, setEditOptions] = useState<FieldOption[]>([]);

  // New field form
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<FieldType>("text");
  const [newOptions, setNewOptions] = useState<FieldOption[]>([]);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionColor, setNewOptionColor] = useState(PRESET_COLORS[0]);

  const startEdit = (field: FieldDefinition) => {
    setEditingId(field.id);
    setEditName(field.name);
    setEditOptions(field.options ? [...field.options] : []);
  };

  const saveEdit = (id: string) => {
    onUpdateField(id, { name: editName, options: editOptions.length > 0 ? editOptions : undefined });
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const addEditOption = () => {
    if (!newOptionLabel.trim()) return;
    setEditOptions((prev) => [
      ...prev,
      { id: `opt_${Date.now()}`, label: newOptionLabel.trim(), color: newOptionColor },
    ]);
    setNewOptionLabel("");
    setNewOptionColor(PRESET_COLORS[0]);
  };

  const removeEditOption = (optId: string) =>
    setEditOptions((prev) => prev.filter((o) => o.id !== optId));

  const handleAddField = () => {
    if (!newName.trim()) return;
    onAddField({
      name: newName.trim(),
      type: newType,
      options: (newType === "dropdown" || newType === "status") && newOptions.length > 0
        ? newOptions
        : undefined,
    });
    setNewName("");
    setNewType("text");
    setNewOptions([]);
    setNewOptionLabel("");
  };

  const addNewOption = () => {
    if (!newOptionLabel.trim()) return;
    setNewOptions((prev) => [
      ...prev,
      { id: `opt_${Date.now()}`, label: newOptionLabel.trim(), color: newOptionColor },
    ]);
    setNewOptionLabel("");
    setNewOptionColor(PRESET_COLORS[0]);
  };

  const removeNewOption = (optId: string) =>
    setNewOptions((prev) => prev.filter((o) => o.id !== optId));

  const [showIds, setShowIds] = useState(false);

  const systemFields = fields.filter((f) => f.isSystem);
  const customFields = fields.filter((f) => !f.isSystem);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" showCloseButton>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{t("manageFields")}</DialogTitle>
            <button
              onClick={() => setShowIds((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border transition-colors me-6",
                showIds
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <Hash className="h-3 w-3" />
              מזהים
            </button>
          </div>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          {/* System fields */}
          <section>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {t("systemFields")}
            </p>
            <div className="grid gap-1">
              {systemFields.map((field) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  showId={showIds}
                  isEditing={editingId === field.id}
                  editName={editName}
                  editOptions={editOptions}
                  newOptionLabel={editingId === field.id ? newOptionLabel : ""}
                  newOptionColor={newOptionColor}
                  onEditNameChange={setEditName}
                  onStartEdit={() => startEdit(field)}
                  onSaveEdit={() => saveEdit(field.id)}
                  onCancelEdit={cancelEdit}
                  onDelete={() => {}}
                  onAddOption={addEditOption}
                  onRemoveOption={removeEditOption}
                  onNewOptionLabelChange={setNewOptionLabel}
                  onNewOptionColorChange={setNewOptionColor}
                  presetColors={PRESET_COLORS}
                />
              ))}
            </div>
          </section>

          {/* Custom fields */}
          <section>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {t("customFields")}
            </p>
            <div className="grid gap-1">
              {customFields.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">{t("noCustomFields")}</p>
              )}
              {customFields.map((field) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  showId={showIds}
                  isEditing={editingId === field.id}
                  editName={editName}
                  editOptions={editOptions}
                  newOptionLabel={editingId === field.id ? newOptionLabel : ""}
                  newOptionColor={newOptionColor}
                  onEditNameChange={setEditName}
                  onStartEdit={() => startEdit(field)}
                  onSaveEdit={() => saveEdit(field.id)}
                  onCancelEdit={cancelEdit}
                  onDelete={() => onDeleteField(field.id)}
                  onAddOption={addEditOption}
                  onRemoveOption={removeEditOption}
                  onNewOptionLabelChange={setNewOptionLabel}
                  onNewOptionColorChange={setNewOptionColor}
                  presetColors={PRESET_COLORS}
                />
              ))}
            </div>
          </section>

          {/* Add new field */}
          <section className="rounded-lg border p-3 grid gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("addField")}
            </p>
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("fieldNamePlaceholder")}
                className="flex-1"
              />
              <Select value={newType} onValueChange={(v) => { setNewType(v as FieldType); setNewOptions([]); }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map((type) => (
                    <SelectItem key={type} value={type}>{FIELD_TYPE_LABELS[type]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options editor for dropdown/status */}
            {(newType === "dropdown" || newType === "status") && (
              <OptionsEditor
                options={newOptions}
                showColors={newType === "status"}
                newLabel={newOptionLabel}
                newColor={newOptionColor}
                presetColors={PRESET_COLORS}
                onNewLabelChange={setNewOptionLabel}
                onNewColorChange={setNewOptionColor}
                onAdd={addNewOption}
                onRemove={removeNewOption}
              />
            )}

            <Button type="button" onClick={handleAddField} disabled={!newName.trim()} size="sm" className="self-start">
              <Plus className="h-4 w-4 me-1" />
              {t("addField")}
            </Button>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {useTranslations("common")("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FieldRowProps {
  field: FieldDefinition;
  showId?: boolean;
  isEditing: boolean;
  editName: string;
  editOptions: FieldOption[];
  newOptionLabel: string;
  newOptionColor: string;
  presetColors: string[];
  onEditNameChange: (v: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onAddOption: () => void;
  onRemoveOption: (id: string) => void;
  onNewOptionLabelChange: (v: string) => void;
  onNewOptionColorChange: (v: string) => void;
}

function FieldRow({
  field, showId, isEditing, editName, editOptions, newOptionLabel, newOptionColor, presetColors,
  onEditNameChange, onStartEdit, onSaveEdit, onCancelEdit, onDelete,
  onAddOption, onRemoveOption, onNewOptionLabelChange, onNewOptionColorChange,
}: FieldRowProps) {
  const showOptions = isEditing && (field.type === "dropdown" || field.type === "status");

  return (
    <div className={cn("rounded-lg border px-3 py-2 grid gap-2 transition-colors", isEditing && "bg-muted/30")}>
      {showId && (
        <div className="flex flex-col gap-1 ps-6 pb-1 border-b border-dashed border-border/50">
          <code className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded w-fit">
            field: {field.id}
          </code>
          {field.options && field.options.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              {opt.color && (
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
              )}
              <code className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                {opt.label}: {opt.id}
              </code>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        {!field.isSystem && (
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
        )}
        {field.isSystem && (
          <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        )}

        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            className="h-7 flex-1"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm font-medium">{field.name}</span>
        )}

        <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
          {FIELD_TYPE_LABELS[field.type]}
        </span>

        {isEditing ? (
          <div className="flex gap-1 flex-shrink-0">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onSaveEdit}>
              <Check className="h-3.5 w-3.5 text-secondary" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCancelEdit}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1 flex-shrink-0">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onStartEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {!field.isSystem && (
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Options editor when editing */}
      {showOptions && (
        <OptionsEditor
          options={editOptions}
          showColors={field.type === "status"}
          newLabel={newOptionLabel}
          newColor={newOptionColor}
          presetColors={presetColors}
          onNewLabelChange={onNewOptionLabelChange}
          onNewColorChange={onNewOptionColorChange}
          onAdd={onAddOption}
          onRemove={onRemoveOption}
        />
      )}

      {/* Show existing options (read-only when not editing) */}
      {!isEditing && field.options && field.options.length > 0 && (
        <div className="flex flex-wrap gap-1 ps-6">
          {field.options.map((opt) => (
            <span
              key={opt.id}
              className="text-xs px-2 py-0.5 rounded-full border"
              style={field.type === "status" && opt.color ? { borderColor: opt.color, color: opt.color } : {}}
            >
              {opt.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface OptionsEditorProps {
  options: FieldOption[];
  showColors: boolean;
  newLabel: string;
  newColor: string;
  presetColors: string[];
  onNewLabelChange: (v: string) => void;
  onNewColorChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}

function OptionsEditor({
  options, showColors, newLabel, newColor, presetColors,
  onNewLabelChange, onNewColorChange, onAdd, onRemove,
}: OptionsEditorProps) {
  return (
    <div className="ps-6 grid gap-2">
      {options.map((opt) => (
        <div key={opt.id} className="flex items-center gap-2">
          {showColors && opt.color && (
            <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
          )}
          <span className="flex-1 text-sm">{opt.label}</span>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onRemove(opt.id)}>
            <X className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Input
          value={newLabel}
          onChange={(e) => onNewLabelChange(e.target.value)}
          placeholder="הוסף אפשרות..."
          className="h-7 flex-1 text-sm"
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())}
        />
        {showColors && (
          <div className="flex gap-1">
            {presetColors.slice(0, 5).map((c) => (
              <button
                key={c}
                type="button"
                className={cn("h-5 w-5 rounded-full border-2", newColor === c ? "border-foreground" : "border-transparent")}
                style={{ backgroundColor: c }}
                onClick={() => onNewColorChange(c)}
              />
            ))}
          </div>
        )}
        <Button size="sm" variant="outline" className="h-7 px-2" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
