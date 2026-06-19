import { useTranslations, useLocale } from "next-intl";
import { Target, Handshake, Rocket, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const stages = [
  { key: "prospect", icon: Target, en: "Prospect", he: "פרוספקט" },
  { key: "onboarding", icon: Handshake, en: "Onboarding", he: "קליטה" },
  { key: "active", icon: Rocket, en: "Active Growth", he: "צמיחה" },
  { key: "advocate", icon: Award, en: "Advocate", he: "שגריר" },
];

interface LifecycleRoadmapProps {
  currentStage: string;
  onStageChange?: (stage: string) => void;
}

export function LifecycleRoadmap({ currentStage, onStageChange }: LifecycleRoadmapProps) {
  const t = useTranslations("customers");
  const locale = useLocale();
  const currentIndex = stages.findIndex((s) => s.key === currentStage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("lifecycleRoadmap")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between relative py-4">
          <div className="absolute inset-x-8 top-1/2 h-0.5 bg-border" />
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const isCurrent = i === currentIndex;
            const isPast = i < currentIndex;
            const isFuture = i > currentIndex;
            const clickable = !!onStageChange;

            return (
              <button
                key={stage.key}
                type="button"
                disabled={!clickable}
                onClick={() => onStageChange?.(stage.key)}
                className={cn(
                  "flex flex-col items-center gap-2 relative z-10 bg-transparent border-none p-0",
                  clickable && "cursor-pointer group"
                )}
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shadow-sm transition-all",
                    isCurrent && "bg-secondary text-secondary-foreground scale-110 ring-4 ring-secondary/20",
                    isPast && "bg-primary text-primary-foreground",
                    isFuture && "bg-muted text-muted-foreground opacity-40",
                    clickable && !isCurrent && "group-hover:scale-110 group-hover:ring-4 group-hover:ring-primary/20"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className={cn("text-xs font-semibold", isCurrent && "text-secondary", isFuture && "opacity-40")}>
                  {locale === "he" ? stage.he : stage.en}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
