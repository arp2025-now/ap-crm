import {
  LayoutDashboard, Users, UserCheck,
  Wallet, BarChart3, HelpCircle, MessageSquare, Package, FileText,
  Settings, Zap, CheckSquare, CalendarDays, ClipboardList, ScrollText,
  MessageCircle,
} from "lucide-react";

export const mainNavItems = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "leads", href: "/leads", icon: Users },
  { key: "customers", href: "/customers", icon: UserCheck },
  { key: "tasks", href: "/tasks", icon: CheckSquare },
  { key: "calendar", href: "/calendar", icon: CalendarDays },
  { key: "products", href: "/products", icon: Package },
  { key: "quotes", href: "/quotes", icon: FileText },
  { key: "finance", href: "/finance", icon: Wallet },
  { key: "forms", href: "/forms", icon: ClipboardList },
  { key: "automations", href: "/automations", icon: Zap },
  { key: "analytics", href: "/analytics", icon: BarChart3 },
  { key: "whatsapp", href: "/whatsapp", icon: MessageCircle },
] as const;

export const bottomNavItems = [
  { key: "logs", href: "/logs", icon: ScrollText },
  { key: "settings", href: "/settings", icon: Settings },
  { key: "support", href: "#", icon: HelpCircle },
  { key: "feedback", href: "#", icon: MessageSquare },
] as const;
