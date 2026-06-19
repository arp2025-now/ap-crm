import { TrendingUp } from "lucide-react";

interface RevenueCardProps {
  label: string;
  value: string;
  trend: string;
}

export function RevenueCard({ label, value, trend }: RevenueCardProps) {
  return (
    <div className="bg-primary text-primary-foreground rounded-2xl p-8 shadow-lg relative overflow-hidden">
      <div className="absolute -end-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="relative">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-80 bg-white/10 px-3 py-1 rounded-full">
          {label}
        </span>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-5xl font-black">{value}</span>
          <div className="flex items-center text-success font-bold">
            <TrendingUp className="h-4 w-4 me-1" />
            {trend}
          </div>
        </div>
      </div>
    </div>
  );
}
