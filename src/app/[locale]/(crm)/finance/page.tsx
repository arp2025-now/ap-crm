"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Wallet, Plus, TrendingUp, TrendingDown, ChevronLeft, ChevronRight,
  Pencil, Trash2, Target, ArrowUpRight, ArrowDownRight, Receipt,
  DollarSign, PieChart, BarChart3, RefreshCw, Users, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinance } from "@/hooks/use-finance";
import { useLeads } from "@/hooks/use-leads";
import { useCustomers } from "@/hooks/use-customers";
import { IncomeDialog } from "@/components/finance/income-dialog";
import { ExpenseDialog } from "@/components/finance/expense-dialog";
import { cn, formatCurrency } from "@/lib/utils";
import type { IncomeRecord, ExpenseRecord, FinanceStatus, ExpenseCategory, IncomeCategory } from "@/lib/types";

type Tab = "income" | "expenses" | "summary";

const STATUS_STYLES: Record<FinanceStatus, string> = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function FinancePage() {
  const t = useTranslations("finance");
  const locale = useLocale();
  const fmt = (n: number) => formatCurrency(n, locale === "he" ? "he-IL" : "en-US");

  const {
    addIncome, updateIncome, deleteIncome,
    addExpense, updateExpense, deleteExpense,
    getMonthData, getTrend,
  } = useFinance();
  const { leads } = useLeads();
  const { customers } = useCustomers();

  // Current month navigation
  const [monthOffset, setMonthOffset] = useState(0);
  const currentMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, [monthOffset]);

  const monthLabel = useMemo(() => {
    const [y, m] = currentMonth.split("-");
    const d = new Date(parseInt(y), parseInt(m) - 1);
    return d.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", { month: "long", year: "numeric" });
  }, [currentMonth, locale]);

  const data = useMemo(() => getMonthData(currentMonth), [getMonthData, currentMonth]);
  const trend = useMemo(() => getTrend(), [getTrend]);

  const [tab, setTab] = useState<Tab>("income");
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeRecord | undefined>();
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | undefined>();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const leadOptions = leads.map((l) => ({ id: l.id, name: l.customerName }));
  const customerOptions = customers.map((c) => ({ id: c.id, name: c.name }));

  // Find linked entity names
  const getLinkedName = (leadId?: string, custId?: string) => {
    if (custId) return customers.find((c) => c.id === custId)?.name;
    if (leadId) return leads.find((l) => l.id === leadId)?.customerName;
    return undefined;
  };

  // Expense category colors for chart
  const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
    payroll: "#6366f1",
    software: "#0ea5e9",
    marketing: "#f59e0b",
    office: "#10b981",
    travel: "#8b5cf6",
    professional: "#ec4899",
    equipment: "#14b8a6",
    other: "#94a3b8",
  };

  const INCOME_CATEGORY_COLORS: Record<IncomeCategory, string> = {
    service: "#6366f1",
    product: "#0ea5e9",
    consulting: "#f59e0b",
    subscription: "#10b981",
    other: "#94a3b8",
  };

  // Budget usage percentage
  const budgetUsage = data.budget ? (data.totalExpenses / data.budget.expenseBudget) * 100 : 0;
  const incomeProgress = data.budget ? (data.totalIncome / data.budget.incomeTarget) * 100 : 0;

  // Build donut chart for expenses
  const expenseSegments = Object.entries(data.expenseByCategory).sort((a, b) => b[1] - a[1]);
  let cumPct = 0;
  const expenseGradient = expenseSegments.map(([cat, val]) => {
    const pct = data.totalExpenses > 0 ? (val / data.totalExpenses) * 100 : 0;
    const start = cumPct;
    cumPct += pct;
    return `${CATEGORY_COLORS[cat as ExpenseCategory] ?? "#94a3b8"} ${start}% ${cumPct}%`;
  }).join(", ");

  // Build bar chart for trend
  const maxTrendVal = Math.max(...trend.map((t) => Math.max(t.income, t.expenses)), 1);

  return (
    <div className="space-y-6 pb-10">
      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -start-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
              <p className="text-white/70 text-sm mt-0.5">{t("subtitle")}</p>
            </div>
          </div>

          {/* Month navigator */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="bg-white/15 border-white/20 text-white backdrop-blur-sm hover:bg-white/25 h-8 w-8"
              onClick={() => setMonthOffset((o) => o - 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[120px] text-center">{monthLabel}</span>
            <Button
              size="icon"
              variant="outline"
              className="bg-white/15 border-white/20 text-white backdrop-blur-sm hover:bg-white/25 h-8 w-8"
              onClick={() => setMonthOffset((o) => o + 1)}
              disabled={monthOffset >= 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("totalIncome")}</p>
              <p className="text-2xl font-extrabold text-emerald-700">{fmt(data.totalIncome)}</p>
              {data.pendingIncome > 0 && (
                <p className="text-xs text-amber-600 mt-1">{t("pendingAmount")}: {fmt(data.pendingIncome)}</p>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
              <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          {data.budget && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{t("target")}: {fmt(data.budget.incomeTarget)}</span>
                <span>{incomeProgress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-emerald-200/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(incomeProgress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Total Expenses */}
        <div className="rounded-2xl border bg-gradient-to-br from-red-50 to-red-100/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("totalExpenses")}</p>
              <p className="text-2xl font-extrabold text-red-700">{fmt(data.totalExpenses)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            </div>
          </div>
          {data.budget && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{t("budget")}: {fmt(data.budget.expenseBudget)}</span>
                <span className={budgetUsage > 100 ? "text-red-600 font-bold" : ""}>{budgetUsage.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-red-200/50 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", budgetUsage > 100 ? "bg-red-600" : budgetUsage > 80 ? "bg-amber-500" : "bg-red-400")}
                  style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Net Profit */}
        <div className="rounded-2xl border bg-gradient-to-br from-violet-50 to-violet-100/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("netProfit")}</p>
              <p className={cn("text-2xl font-extrabold", data.netProfit >= 0 ? "text-violet-700" : "text-red-700")}>
                {fmt(data.netProfit)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
              {data.netProfit >= 0 ? <TrendingUp className="h-5 w-5 text-violet-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("profitMargin")}: {data.profitMargin.toFixed(1)}%
          </p>
        </div>

        {/* Transactions count */}
        <div className="rounded-2xl border bg-gradient-to-br from-sky-50 to-sky-100/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("transactions")}</p>
              <p className="text-2xl font-extrabold text-sky-700">
                {data.income.length + data.expenses.length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15">
              <Receipt className="h-5 w-5 text-sky-600" />
            </div>
          </div>
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
            <span>{data.income.length} {t("incomes")}</span>
            <span>|</span>
            <span>{data.expenses.length} {t("expensesCount")}</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
        {(["income", "expenses", "summary"] as Tab[]).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
              tab === tb ? "bg-white dark:bg-gray-800 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tb === "income" && <ArrowUpRight className="inline h-4 w-4 me-1" />}
            {tb === "expenses" && <ArrowDownRight className="inline h-4 w-4 me-1" />}
            {tb === "summary" && <BarChart3 className="inline h-4 w-4 me-1" />}
            {t(`tab_${tb}`)}
          </button>
        ))}
      </div>

      {/* ── Income Tab ── */}
      {tab === "income" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("incomeList")}</h2>
            <Button onClick={() => { setEditingIncome(undefined); setIncomeDialogOpen(true); }}>
              <Plus className="h-4 w-4 me-1" />
              {t("addIncome")}
            </Button>
          </div>

          {data.income.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">{t("noIncome")}</p>
              <p className="text-sm mt-1">{t("noIncomeHint")}</p>
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 border-b-2 border-emerald-200">
                    <th className="text-start p-3 font-bold text-emerald-800 dark:text-emerald-300">{t("description")}</th>
                    <th className="text-start p-3 font-bold text-emerald-800 dark:text-emerald-300">{t("linkedEntity")}</th>
                    <th className="text-start p-3 font-bold text-emerald-800 dark:text-emerald-300">{t("category")}</th>
                    <th className="text-start p-3 font-bold text-emerald-800 dark:text-emerald-300">{t("amount")}</th>
                    <th className="text-start p-3 font-bold text-emerald-800 dark:text-emerald-300">{t("date")}</th>
                    <th className="text-start p-3 font-bold text-emerald-800 dark:text-emerald-300">{t("status")}</th>
                    <th className="w-20 p-3" />
                  </tr>
                </thead>
                <tbody>
                  {data.income.map((rec) => {
                    const linked = getLinkedName(rec.linkedLeadId, rec.linkedCustomerId);
                    return (
                      <tr key={rec.id} className="border-b hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-indigo-50/50 group">
                        <td className="p-3">
                          <span className="font-semibold">{rec.description}</span>
                          {rec.invoiceNumber && (
                            <span className="text-xs text-muted-foreground block">{rec.invoiceNumber}</span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {linked ? (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Users className="h-3.5 w-3.5" />
                              {linked}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">
                            {t(`incCat_${rec.category}`)}
                          </Badge>
                        </td>
                        <td className="p-3 font-bold text-emerald-600">{fmt(rec.amount)}</td>
                        <td className="p-3 text-sm text-muted-foreground">{rec.date}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={STATUS_STYLES[rec.status]}>
                            {t(`status_${rec.status}`)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => { setEditingIncome(rec); setIncomeDialogOpen(true); }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {confirmDelete === rec.id ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-600"
                                onClick={() => { deleteIncome(rec.id); setConfirmDelete(null); }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setConfirmDelete(rec.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Expenses Tab ── */}
      {tab === "expenses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("expenseList")}</h2>
            <Button onClick={() => { setEditingExpense(undefined); setExpenseDialogOpen(true); }}>
              <Plus className="h-4 w-4 me-1" />
              {t("addExpense")}
            </Button>
          </div>

          {data.expenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">{t("noExpenses")}</p>
              <p className="text-sm mt-1">{t("noExpensesHint")}</p>
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-red-500/10 to-red-400/5 border-b-2 border-red-200">
                    <th className="text-start p-3 font-bold text-red-800 dark:text-red-300">{t("description")}</th>
                    <th className="text-start p-3 font-bold text-red-800 dark:text-red-300">{t("vendor")}</th>
                    <th className="text-start p-3 font-bold text-red-800 dark:text-red-300">{t("category")}</th>
                    <th className="text-start p-3 font-bold text-red-800 dark:text-red-300">{t("amount")}</th>
                    <th className="text-start p-3 font-bold text-red-800 dark:text-red-300">{t("date")}</th>
                    <th className="text-start p-3 font-bold text-red-800 dark:text-red-300">{t("status")}</th>
                    <th className="w-20 p-3" />
                  </tr>
                </thead>
                <tbody>
                  {data.expenses.map((rec) => (
                    <tr key={rec.id} className="border-b hover:bg-gradient-to-r hover:from-red-50/50 hover:to-orange-50/50 group">
                      <td className="p-3">
                        <span className="font-semibold">{rec.description}</span>
                        {rec.isRecurring && (
                          <span className="text-xs text-blue-500 flex items-center gap-0.5 mt-0.5">
                            <RefreshCw className="h-3 w-3" />
                            {t(`freq_${rec.recurringFrequency}`)}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{rec.vendor ?? "—"}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs" style={{
                          backgroundColor: `${CATEGORY_COLORS[rec.category]}15`,
                          color: CATEGORY_COLORS[rec.category],
                          borderColor: `${CATEGORY_COLORS[rec.category]}40`,
                        }}>
                          {t(`expCat_${rec.category}`)}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold text-red-600">{fmt(rec.amount)}</td>
                      <td className="p-3 text-sm text-muted-foreground">{rec.date}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={STATUS_STYLES[rec.status]}>
                          {t(`status_${rec.status}`)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => { setEditingExpense(rec); setExpenseDialogOpen(true); }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {confirmDelete === rec.id ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600"
                              onClick={() => { deleteExpense(rec.id); setConfirmDelete(null); }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setConfirmDelete(rec.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Summary Tab ── */}
      {tab === "summary" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense breakdown donut */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15">
                  <PieChart className="h-4 w-4 text-red-600" />
                </div>
                <h3 className="font-bold">{t("expenseBreakdown")}</h3>
              </div>

              {data.totalExpenses > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-44 h-44">
                    <div
                      className="w-full h-full rounded-full"
                      style={{ background: `conic-gradient(${expenseGradient})` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 bg-card rounded-full flex flex-col items-center justify-center shadow-inner">
                        <p className="text-xs text-muted-foreground font-bold">{t("total")}</p>
                        <p className="text-lg font-black">{fmt(data.totalExpenses)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                    {expenseSegments.map(([cat, val]) => (
                      <div key={cat} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat as ExpenseCategory] }} />
                        <span className="text-xs font-semibold truncate">{t(`expCat_${cat}`)}</span>
                        <span className="text-xs text-muted-foreground ms-auto">{fmt(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">{t("noData")}</p>
              )}
            </div>

            {/* Income breakdown */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15">
                  <PieChart className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="font-bold">{t("incomeBreakdown")}</h3>
              </div>

              {data.totalIncome > 0 ? (
                <div className="space-y-3">
                  {Object.entries(data.incomeByCategory)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, val]) => {
                      const pct = (val / data.totalIncome) * 100;
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold">{t(`incCat_${cat}`)}</span>
                            <span className="text-muted-foreground">{fmt(val)} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: INCOME_CATEGORY_COLORS[cat as IncomeCategory] ?? "#94a3b8",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">{t("noData")}</p>
              )}
            </div>
          </div>

          {/* Trend chart - last 6 months */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15">
                <BarChart3 className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="font-bold">{t("monthlyTrend")}</h3>
            </div>

            <div className="flex items-end gap-3 h-48">
              {trend.map((m) => {
                const incH = maxTrendVal > 0 ? (m.income / maxTrendVal) * 100 : 0;
                const expH = maxTrendVal > 0 ? (m.expenses / maxTrendVal) * 100 : 0;
                const monthName = new Date(parseInt(m.month.split("-")[0]), parseInt(m.month.split("-")[1]) - 1)
                  .toLocaleDateString(locale === "he" ? "he-IL" : "en-US", { month: "short" });

                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 w-full h-40">
                      <div className="flex-1 rounded-t-md bg-emerald-400 transition-all" style={{ height: `${incH}%` }} title={`${t("income")}: ${fmt(m.income)}`} />
                      <div className="flex-1 rounded-t-md bg-red-400 transition-all" style={{ height: `${expH}%` }} title={`${t("expenses")}: ${fmt(m.expenses)}`} />
                    </div>
                    <span className="text-xs text-muted-foreground">{monthName}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-emerald-400" />
                <span className="text-xs font-semibold">{t("income")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-red-400" />
                <span className="text-xs font-semibold">{t("expenses")}</span>
              </div>
            </div>
          </div>

          {/* Budget control */}
          {data.budget && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15">
                  <Target className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="font-bold">{t("budgetControl")}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.budget.categoryBudgets).map(([cat, budgetAmount]) => {
                  const actual = data.expenseByCategory[cat] ?? 0;
                  const usage = budgetAmount > 0 ? (actual / budgetAmount) * 100 : 0;
                  return (
                    <div key={cat} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold">{t(`expCat_${cat}`)}</span>
                        <span className={cn("text-xs font-bold", usage > 100 ? "text-red-600" : usage > 80 ? "text-amber-600" : "text-emerald-600")}>
                          {fmt(actual)} / {fmt(budgetAmount)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", usage > 100 ? "bg-red-500" : usage > 80 ? "bg-amber-500" : "bg-emerald-500")}
                          style={{ width: `${Math.min(usage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Dialogs ── */}
      <IncomeDialog
        open={incomeDialogOpen}
        onClose={() => { setIncomeDialogOpen(false); setEditingIncome(undefined); }}
        onSave={(data) => {
          if (editingIncome) {
            updateIncome(editingIncome.id, data);
          } else {
            addIncome(data);
          }
        }}
        leads={leadOptions}
        customers={customerOptions}
        initial={editingIncome}
      />

      <ExpenseDialog
        open={expenseDialogOpen}
        onClose={() => { setExpenseDialogOpen(false); setEditingExpense(undefined); }}
        onSave={(data) => {
          if (editingExpense) {
            updateExpense(editingExpense.id, data);
          } else {
            addExpense(data);
          }
        }}
        initial={editingExpense}
      />
    </div>
  );
}
