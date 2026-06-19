import { useTranslations } from "next-intl";
import { Flame, TrendingUp, DollarSign, Briefcase, LayoutDashboard } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { mockDashboardStats, mockLeads, mockActivities } from "@/lib/mock-data";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6 pb-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 px-8 py-10">
        {/* Decorative blur blobs */}
        <div className="pointer-events-none absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 start-1/3 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
            <p className="mt-1 text-sm text-blue-100">{t("subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label={t("hotLeads")}
          value={stats.hotLeads.toString()}
          trend={`+${stats.hotLeadsTrend}% ${t("increaseThisWeek")}`}
          icon={Flame}
          variant="primary"
        />
        <StatCard
          label={t("conversionRate")}
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
          variant="secondary"
        />
        <StatCard
          label={t("revenue")}
          value={`₪${(stats.revenuePipeline / 1000).toFixed(0)}K`}
          trend={t("qualifiedOnly")}
          icon={DollarSign}
          variant="warning"
        />
        <StatCard
          label={t("activeDeals")}
          value={stats.activeDeals.toString()}
          icon={Briefcase}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentLeads leads={mockLeads} title={t("recentLeads")} />
        <ActivityFeed activities={mockActivities} title={t("activity")} />
      </div>
    </div>
  );
}
