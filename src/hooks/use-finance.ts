"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  IncomeRecord, ExpenseRecord, MonthlyBudget,
  IncomeCategory, ExpenseCategory, FinanceStatus,
} from "@/lib/types";
import { logActivity } from "@/hooks/use-activity-log";

const INCOME_KEY = "crm-income";
const EXPENSE_KEY = "crm-expenses";
const BUDGET_KEY = "crm-budgets";

// ── Mock seed data ──

const mockIncome: IncomeRecord[] = [
  {
    id: "inc-1", amount: 14200, date: "2026-05-01",
    description: "הטמעת CRM - TechVision Systems",
    category: "service", linkedCustomerId: "cust-1",
    paymentMethod: "transfer", invoiceNumber: "INV-8821",
    status: "completed", createdAt: "2026-05-01T10:00:00Z", updatedAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "inc-2", amount: 5800, date: "2026-05-10",
    description: "ייעוץ אוטומציה - Nexus Digital",
    category: "consulting", linkedCustomerId: "cust-2",
    paymentMethod: "credit", invoiceNumber: "INV-8834",
    status: "pending", createdAt: "2026-05-10T10:00:00Z", updatedAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "inc-3", amount: 38000, date: "2026-05-15",
    description: "פרויקט Make.com - FinTech Global",
    category: "service", linkedCustomerId: "cust-4",
    paymentMethod: "transfer", invoiceNumber: "INV-8850",
    status: "completed", createdAt: "2026-05-15T10:00:00Z", updatedAt: "2026-05-15T10:00:00Z",
  },
  {
    id: "inc-4", amount: 9200, date: "2026-05-18",
    description: "מנוי חודשי תחזוקה - BuildCo",
    category: "subscription", linkedCustomerId: "cust-5",
    paymentMethod: "credit", invoiceNumber: "INV-8862",
    status: "pending", createdAt: "2026-05-18T10:00:00Z", updatedAt: "2026-05-18T10:00:00Z",
  },
  {
    id: "inc-5", amount: 22450, date: "2026-04-20",
    description: "אוטומציית שיווק - Logistix Corp",
    category: "service", linkedCustomerId: "cust-3",
    paymentMethod: "transfer", invoiceNumber: "INV-8799",
    status: "completed", createdAt: "2026-04-20T10:00:00Z", updatedAt: "2026-04-20T10:00:00Z",
  },
  {
    id: "inc-6", amount: 3500, date: "2026-04-05",
    description: "סדנת הדרכה",
    category: "other",
    paymentMethod: "cash", status: "completed",
    createdAt: "2026-04-05T10:00:00Z", updatedAt: "2026-04-05T10:00:00Z",
  },
  {
    id: "inc-7", amount: 67000, date: "2026-04-18",
    description: "הטמעת n8n + CRM - TechVision Systems",
    category: "service", linkedCustomerId: "cust-1",
    paymentMethod: "transfer", invoiceNumber: "INV-8810",
    status: "completed", createdAt: "2026-04-18T10:00:00Z", updatedAt: "2026-04-18T10:00:00Z",
  },
];

const mockExpenses: ExpenseRecord[] = [
  {
    id: "exp-1", amount: 12000, date: "2026-05-01",
    description: "משכורת - עובד 1", category: "payroll",
    vendor: "שכר", paymentMethod: "transfer",
    status: "completed", isRecurring: true, recurringFrequency: "monthly",
    createdAt: "2026-05-01T10:00:00Z", updatedAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "exp-2", amount: 12000, date: "2026-05-01",
    description: "משכורת - עובד 2", category: "payroll",
    vendor: "שכר", paymentMethod: "transfer",
    status: "completed", isRecurring: true, recurringFrequency: "monthly",
    createdAt: "2026-05-01T10:00:00Z", updatedAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "exp-3", amount: 890, date: "2026-05-03",
    description: "Make.com Pro", category: "software",
    vendor: "Make.com", paymentMethod: "credit",
    status: "completed", isRecurring: true, recurringFrequency: "monthly",
    createdAt: "2026-05-03T10:00:00Z", updatedAt: "2026-05-03T10:00:00Z",
  },
  {
    id: "exp-4", amount: 450, date: "2026-05-05",
    description: "n8n Cloud", category: "software",
    vendor: "n8n", paymentMethod: "credit",
    status: "completed", isRecurring: true, recurringFrequency: "monthly",
    createdAt: "2026-05-05T10:00:00Z", updatedAt: "2026-05-05T10:00:00Z",
  },
  {
    id: "exp-5", amount: 2400, date: "2026-05-08",
    description: "קמפיין פייסבוק - מאי", category: "marketing",
    vendor: "Meta", paymentMethod: "credit",
    status: "completed",
    createdAt: "2026-05-08T10:00:00Z", updatedAt: "2026-05-08T10:00:00Z",
  },
  {
    id: "exp-6", amount: 1200, date: "2026-05-10",
    description: "קמפיין גוגל - מאי", category: "marketing",
    vendor: "Google", paymentMethod: "credit",
    status: "completed",
    createdAt: "2026-05-10T10:00:00Z", updatedAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "exp-7", amount: 350, date: "2026-05-12",
    description: "ציוד משרדי", category: "office",
    vendor: "Office Depot", paymentMethod: "credit",
    status: "completed",
    createdAt: "2026-05-12T10:00:00Z", updatedAt: "2026-05-12T10:00:00Z",
  },
  {
    id: "exp-8", amount: 1800, date: "2026-05-15",
    description: "רואה חשבון - חודשי", category: "professional",
    vendor: "משרד רו\"ח כהן", paymentMethod: "transfer",
    status: "completed", isRecurring: true, recurringFrequency: "monthly",
    createdAt: "2026-05-15T10:00:00Z", updatedAt: "2026-05-15T10:00:00Z",
  },
  // April expenses
  {
    id: "exp-9", amount: 24000, date: "2026-04-01",
    description: "משכורות אפריל", category: "payroll",
    vendor: "שכר", paymentMethod: "transfer", status: "completed",
    createdAt: "2026-04-01T10:00:00Z", updatedAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "exp-10", amount: 1340, date: "2026-04-03",
    description: "תוכנות אפריל", category: "software",
    vendor: "שונות", paymentMethod: "credit", status: "completed",
    createdAt: "2026-04-03T10:00:00Z", updatedAt: "2026-04-03T10:00:00Z",
  },
  {
    id: "exp-11", amount: 3200, date: "2026-04-10",
    description: "שיווק אפריל", category: "marketing",
    vendor: "Meta + Google", paymentMethod: "credit", status: "completed",
    createdAt: "2026-04-10T10:00:00Z", updatedAt: "2026-04-10T10:00:00Z",
  },
  {
    id: "exp-12", amount: 1800, date: "2026-04-15",
    description: "רו\"ח אפריל", category: "professional",
    vendor: "משרד רו\"ח כהן", paymentMethod: "transfer", status: "completed",
    createdAt: "2026-04-15T10:00:00Z", updatedAt: "2026-04-15T10:00:00Z",
  },
];

const mockBudgets: MonthlyBudget[] = [
  {
    id: "bud-202605", month: "2026-05",
    incomeTarget: 80000, expenseBudget: 35000,
    categoryBudgets: { payroll: 25000, software: 2000, marketing: 4000, office: 500, professional: 2000 },
  },
  {
    id: "bud-202604", month: "2026-04",
    incomeTarget: 75000, expenseBudget: 33000,
    categoryBudgets: { payroll: 24000, software: 1500, marketing: 3500, office: 500, professional: 2000 },
  },
];

// ── Hook ──

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function useFinance() {
  const [income, setIncome] = useState<IncomeRecord[]>(mockIncome);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(mockExpenses);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>(mockBudgets);

  useEffect(() => {
    setIncome(load(INCOME_KEY, mockIncome));
    setExpenses(load(EXPENSE_KEY, mockExpenses));
    setBudgets(load(BUDGET_KEY, mockBudgets));
  }, []);

  const persistIncome = useCallback((data: IncomeRecord[]) => {
    setIncome(data);
    localStorage.setItem(INCOME_KEY, JSON.stringify(data));
  }, []);

  const persistExpenses = useCallback((data: ExpenseRecord[]) => {
    setExpenses(data);
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(data));
  }, []);

  const persistBudgets = useCallback((data: MonthlyBudget[]) => {
    setBudgets(data);
    localStorage.setItem(BUDGET_KEY, JSON.stringify(data));
  }, []);

  // ── Income CRUD ──

  const addIncome = useCallback((data: Omit<IncomeRecord, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const rec: IncomeRecord = { ...data, id: `inc-${Date.now()}`, createdAt: now, updatedAt: now };
    persistIncome([rec, ...income]);
    logActivity("create", "lead", rec.id, rec.description, `הכנסה ₪${rec.amount.toLocaleString()}`);
    return rec;
  }, [income, persistIncome]);

  const updateIncome = useCallback((id: string, data: Partial<IncomeRecord>) => {
    const now = new Date().toISOString();
    const prev = income.find((r) => r.id === id);
    persistIncome(income.map((r) => r.id === id ? { ...r, ...data, updatedAt: now } : r));
    if (prev) logActivity("update", "lead", id, prev.description);
  }, [income, persistIncome]);

  const deleteIncome = useCallback((id: string) => {
    const prev = income.find((r) => r.id === id);
    persistIncome(income.filter((r) => r.id !== id));
    if (prev) logActivity("delete", "lead", id, prev.description);
  }, [income, persistIncome]);

  // ── Expense CRUD ──

  const addExpense = useCallback((data: Omit<ExpenseRecord, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const rec: ExpenseRecord = { ...data, id: `exp-${Date.now()}`, createdAt: now, updatedAt: now };
    persistExpenses([rec, ...expenses]);
    logActivity("create", "lead", rec.id, rec.description, `הוצאה ₪${rec.amount.toLocaleString()}`);
    return rec;
  }, [expenses, persistExpenses]);

  const updateExpense = useCallback((id: string, data: Partial<ExpenseRecord>) => {
    const now = new Date().toISOString();
    const prev = expenses.find((r) => r.id === id);
    persistExpenses(expenses.map((r) => r.id === id ? { ...r, ...data, updatedAt: now } : r));
    if (prev) logActivity("update", "lead", id, prev.description);
  }, [expenses, persistExpenses]);

  const deleteExpense = useCallback((id: string) => {
    const prev = expenses.find((r) => r.id === id);
    persistExpenses(expenses.filter((r) => r.id !== id));
    if (prev) logActivity("delete", "lead", id, prev.description);
  }, [expenses, persistExpenses]);

  // ── Budget CRUD ──

  const setBudget = useCallback((month: string, data: Partial<Omit<MonthlyBudget, "id" | "month">>) => {
    const existing = budgets.find((b) => b.month === month);
    if (existing) {
      persistBudgets(budgets.map((b) => b.month === month ? { ...b, ...data } : b));
    } else {
      const newBudget: MonthlyBudget = {
        id: `bud-${month.replace("-", "")}`,
        month,
        incomeTarget: data.incomeTarget ?? 0,
        expenseBudget: data.expenseBudget ?? 0,
        categoryBudgets: data.categoryBudgets ?? {},
      };
      persistBudgets([newBudget, ...budgets]);
    }
  }, [budgets, persistBudgets]);

  // ── Computed values ──

  const getMonthData = useCallback((month: string) => {
    const monthIncome = income.filter((r) => r.date.startsWith(month) && r.status !== "cancelled");
    const monthExpenses = expenses.filter((r) => r.date.startsWith(month) && r.status !== "cancelled");
    const budget = budgets.find((b) => b.month === month);

    const totalIncome = monthIncome.reduce((s, r) => s + r.amount, 0);
    const receivedIncome = monthIncome.filter((r) => r.status === "completed").reduce((s, r) => s + r.amount, 0);
    const pendingIncome = monthIncome.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount, 0);
    const totalExpenses = monthExpenses.reduce((s, r) => s + r.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Expense by category
    const expenseByCategory: Record<string, number> = {};
    for (const e of monthExpenses) {
      expenseByCategory[e.category] = (expenseByCategory[e.category] ?? 0) + e.amount;
    }

    // Income by category
    const incomeByCategory: Record<string, number> = {};
    for (const i of monthIncome) {
      incomeByCategory[i.category] = (incomeByCategory[i.category] ?? 0) + i.amount;
    }

    return {
      income: monthIncome,
      expenses: monthExpenses,
      budget,
      totalIncome,
      receivedIncome,
      pendingIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      expenseByCategory,
      incomeByCategory,
    };
  }, [income, expenses, budgets]);

  // Last 6 months trend
  const getTrend = useCallback(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return months.map((m) => {
      const data = getMonthData(m);
      return { month: m, income: data.totalIncome, expenses: data.totalExpenses, profit: data.netProfit };
    });
  }, [getMonthData]);

  return {
    income, expenses, budgets,
    addIncome, updateIncome, deleteIncome,
    addExpense, updateExpense, deleteExpense,
    setBudget, getMonthData, getTrend,
  };
}
