import { Flame, Thermometer, Snowflake } from "lucide-react";

const ICON_MAP: Record<string, typeof Flame> = {
  hot: Flame,
  warm: Thermometer,
  cold: Snowflake,
};

const STYLE_MAP: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  hot: {
    bg: "bg-gradient-to-r from-rose-100 to-red-100 dark:from-rose-900/40 dark:to-red-900/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-700",
    glow: "shadow-rose-200/50 dark:shadow-rose-800/30",
  },
  warm: {
    bg: "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-700",
    glow: "shadow-amber-200/50 dark:shadow-amber-800/30",
  },
  cold: {
    bg: "bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/40 dark:to-blue-900/40",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-700",
    glow: "shadow-sky-200/50 dark:shadow-sky-800/30",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-gray-100 dark:bg-gray-800/50",
  text: "text-gray-600 dark:text-gray-300",
  border: "border-gray-200 dark:border-gray-700",
  glow: "",
};

interface HeatBadgeProps {
  level: string;
  label: string;
  color?: string;
}

export function HeatBadge({ level, label }: HeatBadgeProps) {
  const Icon = ICON_MAP[level] ?? Flame;
  const style = STYLE_MAP[level] ?? DEFAULT_STYLE;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider border shadow-sm ${style.bg} ${style.text} ${style.border} ${style.glow}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
