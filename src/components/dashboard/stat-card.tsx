import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  variant: "primary" | "secondary" | "warning" | "default";
}

const variantStyles = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  warning: "bg-warning text-warning-foreground",
  default: "bg-card text-card-foreground border",
};

export function StatCard({ label, value, trend, icon: Icon, variant }: StatCardProps) {
  return (
    <div className={cn("rounded-2xl p-6 shadow-sm relative overflow-hidden", variantStyles[variant])}>
      <Icon className="absolute -end-4 -bottom-4 h-24 w-24 opacity-10" />
      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-3xl font-black mt-2">{value}</p>
      {trend && <p className="text-sm font-semibold mt-3 opacity-90">{trend}</p>}
    </div>
  );
}
