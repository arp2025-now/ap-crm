import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import type { Lead } from "@/lib/types";

const heatColors = {
  hot: "bg-destructive text-destructive-foreground",
  warm: "bg-warning text-warning-foreground",
  cold: "bg-muted text-muted-foreground",
};

interface RecentLeadsProps {
  leads: Lead[];
  title: string;
}

export function RecentLeads({ leads, title }: RecentLeadsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {leads.slice(0, 5).map((lead) => (
          <div key={lead.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {getInitials(lead.customerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{lead.customerName}</p>
                <p className="text-xs text-muted-foreground">{lead.company}</p>
              </div>
            </div>
            <Badge variant="secondary" className={heatColors[lead.heatLevel]}>
              {lead.heatLevel}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
