import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Calendar, StickyNote, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types";

const typeConfig = {
  email: { icon: Mail, color: "bg-primary/10 text-primary" },
  call: { icon: Phone, color: "bg-secondary/10 text-secondary" },
  meeting: { icon: Calendar, color: "bg-warning/10 text-warning" },
  note: { icon: StickyNote, color: "bg-muted text-muted-foreground" },
  deal: { icon: Handshake, color: "bg-success/10 text-success" },
};

interface ActivityFeedProps {
  activities: ActivityItem[];
  title: string;
}

export function ActivityFeed({ activities, title }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6 before:absolute before:start-5 before:top-2 before:bottom-0 before:w-px before:bg-border">
          {activities.slice(0, 5).map((activity) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            return (
              <div key={activity.id} className="relative flex gap-4 items-start ps-12">
                <div className={cn("absolute start-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background z-10", config.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 rounded-xl bg-muted/50 p-3 border">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-semibold">{activity.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
