import { useState } from "react";
import { ActivityEntry, ActivityType } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Upload,
  AlertCircle,
  Calendar,
  MessageSquare,
  CalendarCheck,
} from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";

interface ActivityListProps {
  activities: ActivityEntry[];
  milestoneId?: string;
}

const activityTypeConfig: Record<
  ActivityType,
  { icon: React.ElementType; color: string; label: string }
> = {
  step_completed: { icon: CheckCircle2, color: "text-green-500", label: "Step" },
  doc_uploaded: { icon: Upload, color: "text-blue-500", label: "Document" },
  status_change: { icon: AlertCircle, color: "text-orange-500", label: "Status" },
  deadline_created: { icon: Calendar, color: "text-purple-500", label: "Deadline" },
  appointment_booked: { icon: CalendarCheck, color: "text-cyan-500", label: "Appointment" },
  note_added: { icon: MessageSquare, color: "text-gray-500", label: "Note" },
};

export function ActivityList({ activities, milestoneId }: ActivityListProps) {
  const [filter, setFilter] = useState<ActivityType | "all">("all");

  const filtered = activities.filter((a) => {
    if (milestoneId && a.milestoneId !== milestoneId) return false;
    if (filter === "all") return true;
    return a.type === filter;
  });

  const groupByDay = (items: ActivityEntry[]) => {
    const groups: Record<string, ActivityEntry[]> = {};
    items.forEach((item) => {
      const date = parseISO(item.createdAt);
      let key: string;
      if (isToday(date)) {
        key = "Today";
      } else if (isYesterday(date)) {
        key = "Yesterday";
      } else {
        key = format(date, "MMMM d, yyyy");
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  };

  const grouped = groupByDay(filtered);

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as ActivityType | "all")}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="doc_uploaded">Docs</TabsTrigger>
          <TabsTrigger value="step_completed">Steps</TabsTrigger>
          <TabsTrigger value="deadline_created">Deadlines</TabsTrigger>
          <TabsTrigger value="appointment_booked">Appts</TabsTrigger>
          <TabsTrigger value="note_added">Notes</TabsTrigger>
          <TabsTrigger value="status_change">Status</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        {Object.entries(grouped).length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No activities yet</p>
          </Card>
        ) : (
          Object.entries(grouped).map(([day, items]) => (
            <div key={day}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{day}</h3>
              <div className="space-y-3">
                {items.map((activity) => {
                  const config = activityTypeConfig[activity.type];
                  const Icon = config.icon;
                  return (
                    <Card key={activity.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${config.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-sm">{activity.title}</h4>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {config.label}
                            </Badge>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{format(parseISO(activity.createdAt), "h:mm a")}</span>
                            <span>•</span>
                            <span className="capitalize">{activity.actor}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
