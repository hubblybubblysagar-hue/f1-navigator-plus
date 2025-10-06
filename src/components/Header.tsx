import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, UserCircle, Menu } from "lucide-react";

interface HeaderProps {
  onNotificationsClick?: () => void;
  notificationCount?: number;
}

export function Header({ onNotificationsClick, notificationCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">IS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">International Student Hub</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Your journey to success in the US
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationsClick}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <UserCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
