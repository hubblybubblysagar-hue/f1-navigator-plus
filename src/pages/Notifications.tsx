import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PrivacyFooter } from "@/components/PrivacyFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { Bell, Calendar, FileText, AlertTriangle, Clock, Check, X, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { NotificationKind } from "@/types";

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

export default function Notifications() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<NotificationKind | "all">("all");

  const filteredNotifications = state.notifications.filter((n) => {
    if (filter === "all") return true;
    return n.kind === filter;
  });

  const handleSnooze = (id: string) => {
    const snoozedUntil = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    dispatch({ type: "SNOOZE_NOTIFICATION", payload: { id, until: snoozedUntil } });
    toast.success("Notification snoozed for 2 days");
  };

  const handleMarkDone = (id: string) => {
    const notification = state.notifications.find((n) => n.id === id);
    if (notification) {
      dispatch({
        type: "UPDATE_NOTIFICATION",
        payload: { ...notification, read: true },
      });
      toast.success("Marked as done");
    }
  };

  const handleDismiss = (id: string) => {
    dispatch({ type: "DELETE_NOTIFICATION", payload: id });
    toast.success("Notification dismissed");
  };

  const handleGoToTask = (href?: string) => {
    if (href) {
      navigate(href);
    }
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header
        onNotificationsClick={() => {}}
        notificationCount={state.notifications.filter((n) => !n.read).length}
      />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">Notification Center</h1>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4" />
                Add Reminder
              </Button>
            </div>
            <p className="text-muted-foreground">Stay on top of your important tasks and deadlines</p>
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as NotificationKind | "all")}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deadline">Deadlines</TabsTrigger>
              <TabsTrigger value="document">Documents</TabsTrigger>
              <TabsTrigger value="alert">Alerts</TabsTrigger>
              <TabsTrigger value="reminder">Reminders</TabsTrigger>
            </TabsList>

            <TabsContent value={filter}>
              {filteredNotifications.length === 0 ? (
                <Card className="p-12 text-center">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-xl font-semibold mb-2">No notifications</h2>
                  <p className="text-muted-foreground">
                    You're all caught up! Check back later for updates.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => {
                    const config = notificationConfig[notification.kind];
                    const Icon = config.icon;

                    return (
                      <Card
                        key={notification.id}
                        className={cn(
                          "p-6 hover:shadow-card transition-all animate-fade-in",
                          !notification.read && "border-l-4 border-l-primary"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn("p-3 rounded-lg", config.bgColor)}>
                            <Icon className={cn("h-5 w-5", config.color)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{notification.title}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.body}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.createdAt)}
                                </span>
                              </div>
                              {!notification.read && (
                                <Badge variant="default" className="ml-2">
                                  New
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                              {notification.action && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleGoToTask(notification.action?.href)}
                                >
                                  {notification.action.label}
                                </Button>
                              )}
                              {!notification.read && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSnooze(notification.id)}
                                  >
                                    <Clock className="h-4 w-4" />
                                    Snooze (2d)
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkDone(notification.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                    Mark Done
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDismiss(notification.id)}
                              >
                                <X className="h-4 w-4" />
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <PrivacyFooter />
    </div>
  );
}
