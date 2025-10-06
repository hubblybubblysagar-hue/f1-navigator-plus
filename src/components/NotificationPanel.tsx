import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, FileText, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppNotification } from "@/types";

interface NotificationPanelProps {
  notifications: AppNotification[];
  onDismiss?: (id: string) => void;
}

const notificationConfig = {
  reminder: {
    icon: Bell,
    color: "text-primary",
    bgColor: "bg-accent",
  },
  deadline: {
    icon: Calendar,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  document: {
    icon: FileText,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  alert: {
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return "Just now";
};

export function NotificationPanel({ notifications, onDismiss }: NotificationPanelProps) {
  if (notifications.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No notifications at this time</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const config = notificationConfig[notification.kind];
        const Icon = config.icon;

        return (
          <Card
            key={notification.id}
            className={cn(
              "p-4 hover:shadow-card transition-all duration-300 animate-fade-in",
              !notification.read && "border-l-4 border-l-primary"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg", config.bgColor)}>
                <Icon className={cn("h-5 w-5", config.color)} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    )}
                    {onDismiss && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => onDismiss(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.body}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(notification.createdAt)}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
