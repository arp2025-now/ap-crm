import { useTranslations } from "next-intl";
import { Smile } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SentimentMeter({ score }: { score: number }) {
  const t = useTranslations("customers");
  const pct = (score / 10) * 100;

  return (
    <Card className="border-t-4 border-t-secondary">
      <CardHeader>
        <CardTitle>{t("sentimentPulse")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-destructive via-warning to-success overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-md ring-2 ring-black/10 z-10"
            style={{ insetInlineStart: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase">
          <span>{t("friction")}</span>
          <span className="text-secondary">{t("loyal")}</span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
          <Smile className="h-8 w-8 text-secondary" />
          <div>
            <p className="text-sm font-bold text-secondary">{t("highSatisfaction")}</p>
            <p className="text-sm text-muted-foreground">{score} / 10</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
