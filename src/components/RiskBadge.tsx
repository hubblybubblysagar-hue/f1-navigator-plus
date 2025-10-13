import { Badge } from "@/components/ui/badge";
import { RiskLevel } from "@/types";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

const riskConfig = {
  green: {
    label: "On Track",
    icon: CheckCircle,
    color: "text-success",
    bgColor: "bg-success/10"
  },
  amber: {
    label: "At Risk",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10"
  },
  red: {
    label: "Critical",
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10"
  }
};

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium", config.bgColor, config.color, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  );
}
