import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatsOverview } from "@/components/StatsOverview";
import { MilestoneCard } from "@/components/MilestoneCard";
import { NotificationPanel } from "@/components/NotificationPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrivacyFooter } from "@/components/PrivacyFooter";
import { useApp } from "@/context/AppContext";
import * as Icons from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState("all");

  const filterMilestones = (status?: string) => {
    if (!status || status === "all") return state.milestones;
    return state.milestones.filter((m) => m.status === status);
  };

  const getIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as any;
    return Icon ? <Icon className="h-5 w-5" /> : <Icons.FileText className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header
        onNotificationsClick={() => navigate("/notifications")}
        notificationCount={state.notifications.filter((n) => !n.read).length}
      />

      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {state.profile ? `Welcome, ${state.profile.fullName.split(' ')[0]}` : 'Welcome to Your Journey'}
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your progress through essential milestones for international students
            </p>
          </div>

          {/* Stats Overview */}
          <div className="mb-8">
            <StatsOverview />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Milestones Section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Your Milestones</h2>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-6 space-y-4">
                    {filterMilestones(activeTab).map((milestone) => (
                      <MilestoneCard
                        key={milestone.id}
                        title={milestone.title}
                        description={milestone.description}
                        status={milestone.status}
                        progress={milestone.progress}
                        deadline={milestone.due}
                        icon={getIcon(milestone.icon)}
                        onClick={() => navigate(`/milestone/${milestone.id}`)}
                      />
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Notifications Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Notifications</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/notifications")}>
                    View all
                  </Button>
                </div>
                <NotificationPanel
                  notifications={state.notifications.slice(0, 3)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <PrivacyFooter />
    </div>
  );
}
