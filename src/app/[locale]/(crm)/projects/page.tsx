"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Plus, FolderKanban, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/use-projects";
import { ProjectDialog } from "@/components/projects/project-dialog";
import type { Project, ProjectStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "תכנון",
  active: "פעיל",
  on_hold: "מושהה",
  completed: "הושלם",
  cancelled: "בוטל",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: "bg-slate-100 text-slate-700 border-slate-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  on_hold: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const TYPE_LABELS: Record<string, string> = {
  automation: "אוטומציה",
  crm: "הטמעת CRM",
};

const VAT_RATE = 0.17;

export default function ProjectsPage() {
  const locale = useLocale();
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | undefined>();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");

  const filtered = statusFilter === "all" ? projects : projects.filter((p) => p.status === statusFilter);

  const totalActive = projects.filter((p) => p.status === "active").length;
  const totalRevenue = projects
    .filter((p) => p.status === "active" || p.status === "completed")
    .reduce((sum, p) => sum + (p.priceExclVat ?? 0) * (1 + VAT_RATE), 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">פרויקטים</h1>
          <p className="text-sm text-muted-foreground">{projects.length} פרויקטים סה"כ</p>
        </div>
        <Button onClick={() => { setEditProject(undefined); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 me-1" />
          פרויקט חדש
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">פעילים</p>
          <p className="text-3xl font-extrabold text-emerald-600">{totalActive}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">הושלמו</p>
          <p className="text-3xl font-extrabold text-blue-600">
            {projects.filter((p) => p.status === "completed").length}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">שווי כולל מע"מ</p>
          <p className="text-2xl font-extrabold text-violet-600">
            ₪{Math.round(totalRevenue).toLocaleString("he-IL")}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "planning", "active", "on_hold", "completed", "cancelled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-input hover:bg-muted/50"
            }`}
          >
            {s === "all" ? "הכל" : STATUS_LABELS[s]}
            <span className="ms-1.5 opacity-60">
              {s === "all" ? projects.length : projects.filter((p) => p.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {/* Projects list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FolderKanban className="h-12 w-12 mb-3 opacity-30" />
          <p>אין פרויקטים</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <div key={project.id} className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base truncate">{project.name}</h3>
                    <Badge className={`text-xs border shrink-0 ${STATUS_COLORS[project.status]}`}>
                      {STATUS_LABELS[project.status]}
                    </Badge>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {TYPE_LABELS[project.type] ?? project.type}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                    {project.startDate && (
                      <span>התחלה: {formatDate(project.startDate, fmtLocale)}</span>
                    )}
                    {project.expectedEndDate && (
                      <span>צפי סיום: {formatDate(project.expectedEndDate, fmtLocale)}</span>
                    )}
                    {project.priceExclVat != null && (
                      <span className="font-semibold text-emerald-600">
                        ₪{Math.round(project.priceExclVat * (1 + VAT_RATE)).toLocaleString("he-IL")} כולל מע"מ
                      </span>
                    )}
                  </div>

                  {project.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{project.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {project.specDocUrl && (
                    <a href={project.specDocUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => { setEditProject(project); setDialogOpen(true); }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                    onClick={() => deleteProject(project.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={async (data) => {
          if (editProject) {
            await updateProject(editProject.id, data);
          } else {
            await addProject(data);
          }
        }}
        initial={editProject}
      />
    </div>
  );
}
