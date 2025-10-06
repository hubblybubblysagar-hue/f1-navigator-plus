import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type MilestoneStatus = "upcoming" | "active" | "completed" | "overdue";

interface MilestoneCardProps {
  title: string;
  description: string;
  status: MilestoneStatus;
  progress?: number;
  deadline?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const statusConfig = {
  upcoming: {
    badge: { variant: "info" as const, label: "Upcoming" },
    icon: Clock,
    iconColor: "text-muted-foreground",
  },
  active: {
    badge: { variant: "default" as const, label: "In Progress" },
    icon: Clock,
    iconColor: "text-primary",
  },
  completed: {
    badge: { variant: "success" as const, label: "Completed" },
    icon: CheckCircle2,
    iconColor: "text-success",
  },
  overdue: {
    badge: { variant: "warning" as const, label: "Overdue" },
    icon: AlertCircle,
    iconColor: "text-warning",
  },
};

export function MilestoneCard({
  title,
  description,
  status,
  progress = 0,
  deadline,
  icon,
  onClick,
}: MilestoneCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card
      className={cn(
        "p-6 hover:shadow-elevated transition-all duration-300 cursor-pointer animate-slide-up border-l-4",
        status === "completed" && "border-l-success",
        status === "active" && "border-l-primary",
        status === "overdue" && "border-l-warning",
        status === "upcoming" && "border-l-muted"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg bg-accent", config.iconColor)}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Badge variant={config.badge.variant}>{config.badge.label}</Badge>
      </div>

      {status !== "upcoming" && status !== "completed" && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <StatusIcon className={cn("h-4 w-4", config.iconColor)} />
          {deadline && <span>Due: {deadline}</span>}
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
