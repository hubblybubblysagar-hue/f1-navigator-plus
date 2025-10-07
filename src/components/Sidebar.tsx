import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Bell, Settings, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/advisor", icon: MessageCircle, label: "Advisor" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card h-[calc(100vh-4rem)] sticky top-16">
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
