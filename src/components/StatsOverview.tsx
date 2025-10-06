import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function StatsOverview() {
  const stats: Stat[] = [
    {
      label: "Completed",
      value: 3,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "In Progress",
      value: 5,
      icon: <Clock className="h-5 w-5" />,
      color: "text-primary",
      bgColor: "bg-accent",
    },
    {
      label: "Upcoming",
      value: 7,
      icon: <FileText className="h-5 w-5" />,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "Overdue",
      value: 1,
      icon: <AlertCircle className="h-5 w-5" />,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          className="p-4 hover:shadow-card transition-all duration-300 animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <span className={stat.color}>{stat.icon}</span>
            </div>
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}
