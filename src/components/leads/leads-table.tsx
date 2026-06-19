"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Mail, Phone, MoreVertical, Pencil, Trash2, UserCheck,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { HeatBadge } from "./heat-badge";
import { getInitials, formatCurrency } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import type { FieldDefinition } from "@/lib/field-definitions";

// Color palette for avatar backgrounds
const AVATAR_COLORS = [
  "bg-violet-500/15 text-violet-600",
  "bg-rose-500/15 text-rose-600",
  "bg-amber-500/15 text-amber-600",
  "bg-emerald-500/15 text-emerald-600",
  "bg-sky-500/15 text-sky-600",
  "bg-pink-500/15 text-pink-600",
  "bg-teal-500/15 text-teal-600",
  "bg-indigo-500/15 text-indigo-600",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface LeadsTableProps {
  leads: Lead[];
  fields: FieldDefinition[];
  visibleColumns: string[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onConvert: (lead: Lead) => void;
}

export function LeadsTable({
  leads, fields, visibleColumns, onEdit, onDelete, onConvert,
}: LeadsTableProps) {
  const t = useTranslations("leads");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";

  const show = (col: string) => visibleColumns.includes(col);

  // Look up heat level option from field definitions
  const heatField = fields.find((f) => f.id === "heatLevel");
  const getHeatOption = (level: string) =>
    heatField?.options?.find((o) => o.id === level) ?? { label: level, color: undefined };

  // Status option lookup
  const statusField = fields.find((f) => f.id === "status");
  const getStatusOption = (status: string) =>
    statusField?.options?.find((o) => o.id === status) ?? { label: status, color: undefined };

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:via-emerald-500/20 dark:to-cyan-500/20 border-b-2 border-emerald-200 dark:border-emerald-800">
            <TableHead className="min-w-[200px] font-bold text-emerald-800 dark:text-emerald-300">{t("contact")}</TableHead>
            {show("phone") && <TableHead className="min-w-[120px] font-bold text-emerald-800 dark:text-emerald-300">{t("phone")}</TableHead>}
            {show("company") && <TableHead className="min-w-[120px] font-bold text-emerald-800 dark:text-emerald-300">{t("company")}</TableHead>}
            {show("heatLevel") && <TableHead className="min-w-[100px] font-bold text-emerald-800 dark:text-emerald-300">{t("heatLevel")}</TableHead>}
            {show("status") && <TableHead className="min-w-[120px] font-bold text-emerald-800 dark:text-emerald-300">{t("statusLabel")}</TableHead>}
            {show("pipelineValue") && <TableHead className="min-w-[100px] font-bold text-emerald-800 dark:text-emerald-300">{t("value")}</TableHead>}
            {show("lastContact") && <TableHead className="min-w-[110px] font-bold text-emerald-800 dark:text-emerald-300">{t("lastContact")}</TableHead>}
            <TableHead className="w-[120px] font-bold text-emerald-800 dark:text-emerald-300">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-muted-foreground font-medium">{tc("noResults")}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => {
              const heatOpt = getHeatOption(lead.heatLevel);
              const statusOpt = getStatusOption(lead.status);
              const isConverted = lead.status === "converted";
              const avatarColor = getAvatarColor(lead.customerName);

              return (
                <TableRow key={lead.id} onClick={() => router.push(`/${locale}/leads/${lead.id}`)} className="group cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-emerald-950/20 dark:hover:to-teal-950/20 transition-all">
                  {/* Contact */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className={`${avatarColor} text-xs font-bold`}>
                          {getInitials(lead.customerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-sm">{lead.customerName}</p>
                          {isConverted && (
                            <Badge className="text-[10px] py-0 h-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 gap-0.5">
                              <UserCheck className="h-2.5 w-2.5" />
                              {t("converted")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{lead.customerEmail}</p>
                      </div>
                    </div>
                  </TableCell>

                  {show("phone") && (
                    <TableCell className="text-sm text-muted-foreground font-mono">{lead.phone}</TableCell>
                  )}

                  {show("company") && (
                    <TableCell>
                      {lead.company ? (
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <span className="h-2 w-2 rounded-full bg-violet-400 flex-shrink-0" />
                          {lead.company}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                  )}

                  {show("heatLevel") && (
                    <TableCell>
                      <HeatBadge
                        level={lead.heatLevel}
                        label={heatOpt.label}
                        color={heatOpt.color}
                      />
                    </TableCell>
                  )}

                  {show("status") && (
                    <TableCell>
                      {statusOpt && (
                        <Badge
                          variant="outline"
                          className="text-xs gap-1 font-semibold"
                          style={statusOpt.color ? { borderColor: statusOpt.color, color: statusOpt.color, backgroundColor: statusOpt.color + "15" } : {}}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                            style={statusOpt.color ? { backgroundColor: statusOpt.color } : {}}
                          />
                          {statusOpt.label}
                        </Badge>
                      )}
                    </TableCell>
                  )}

                  {show("pipelineValue") && (
                    <TableCell>
                      <span className="font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {formatCurrency(lead.pipelineValue, fmtLocale)}
                      </span>
                    </TableCell>
                  )}

                  {show("lastContact") && (
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(lead.lastContactAt).toLocaleDateString(fmtLocale)}
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(lead)}>
                            <Pencil className="h-4 w-4 me-2" />
                            {tc("edit")}
                          </DropdownMenuItem>
                          {!isConverted && (
                            <DropdownMenuItem onClick={() => onConvert(lead)}>
                              <UserCheck className="h-4 w-4 me-2" />
                              {t("convertToCustomer")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(lead.id)}
                          >
                            <Trash2 className="h-4 w-4 me-2" />
                            {tc("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
