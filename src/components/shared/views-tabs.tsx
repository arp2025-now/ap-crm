"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, X, Pencil, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SavedView } from "@/hooks/use-saved-views";

interface ViewsTabsProps {
  views: SavedView[];
  activeViewId: string | null;
  isDirty: boolean;
  onSelectView: (view: SavedView | null) => void;
  onSaveView: (name: string) => void;
  onUpdateView: (id: string) => void;
  onDeleteView: (id: string) => void;
  onRenameView: (id: string, name: string) => void;
}

export function ViewsTabs({
  views, activeViewId, isDirty,
  onSelectView, onSaveView, onUpdateView, onDeleteView, onRenameView,
}: ViewsTabsProps) {
  const tc = useTranslations("common");
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingNew) inputRef.current?.focus();
  }, [addingNew]);

  const handleSave = () => {
    if (newName.trim()) {
      onSaveView(newName.trim());
    }
    setAddingNew(false);
    setNewName("");
  };

  const handleRename = (id: string) => {
    if (editName.trim()) onRenameView(id, editName.trim());
    setEditingId(null);
    setEditName("");
  };

  const startEdit = (view: SavedView, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(view.id);
    setEditName(view.name);
  };

  return (
    <div className="flex items-center gap-1 mb-3 flex-wrap">
      {/* "All" tab */}
      <button
        onClick={() => onSelectView(null)}
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
          activeViewId === null
            ? "bg-primary text-primary-foreground border-primary"
            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground bg-transparent"
        )}
      >
        {tc("allRecords")}
      </button>

      {/* Saved view tabs */}
      {views.map((view) => {
        const isActive = view.id === activeViewId;
        return (
          <div key={view.id} className="group/tab relative flex items-center">
            {editingId === view.id ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(view.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="h-7 w-32 text-sm px-2"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRename(view.id)}>
                  <Check className="h-3.5 w-3.5 text-secondary" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => onSelectView(view)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border pe-2",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground bg-transparent"
                )}
              >
                {view.name}
                {isActive && isDirty && (
                  <span className="h-1.5 w-1.5 rounded-full bg-warning flex-shrink-0" />
                )}
                {/* Delete on hover */}
                <span
                  onClick={(e) => { e.stopPropagation(); onDeleteView(view.id); }}
                  className="opacity-0 group-hover/tab:opacity-100 ms-0.5 p-0.5 rounded hover:text-destructive transition-opacity"
                >
                  <X className="h-3 w-3" />
                </span>
              </button>
            )}
            {/* Rename button on hover (not in edit mode) */}
            {editingId !== view.id && (
              <button
                onClick={(e) => startEdit(view, e)}
                className="opacity-0 group-hover/tab:opacity-100 absolute -top-1 -end-1 p-0.5 rounded-full bg-muted border text-muted-foreground hover:text-foreground transition-opacity"
              >
                <Pencil className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        );
      })}

      {/* Update active view */}
      {activeViewId && isDirty && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs gap-1 border-warning text-warning hover:bg-warning/10"
          onClick={() => onUpdateView(activeViewId)}
        >
          <RefreshCw className="h-3 w-3" />
          {tc("updateView")}
        </Button>
      )}

      {/* Add new view */}
      {addingNew ? (
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") { setAddingNew(false); setNewName(""); }
            }}
            placeholder={tc("viewNamePlaceholder")}
            className="h-7 w-32 text-sm px-2"
          />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave}>
            <Check className="h-3.5 w-3.5 text-secondary" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setAddingNew(false); setNewName(""); }}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/50 transition-colors"
        >
          <Plus className="h-3 w-3" />
          {tc("saveView")}
        </button>
      )}
    </div>
  );
}
