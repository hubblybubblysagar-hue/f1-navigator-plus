import { useState } from "react";
import { Header } from "@/components/Header";
import { StatsOverview } from "@/components/StatsOverview";
import { MilestoneCard } from "@/components/MilestoneCard";
import { NotificationPanel } from "@/components/NotificationPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  CreditCard,
  UserCheck,
  Briefcase,
  Calendar,
  GraduationCap,
} from "lucide-react";

const milestones = [
  {
    id: "1",
    title: "F-1 Visa Application",
    description: "Complete visa application and schedule embassy interview",
    status: "completed" as const,
    progress: 100,
    deadline: "Jan 15, 2024",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: "2",
    title: "I-20 Document Management",
    description: "Obtain and verify your I-20 form from university",
    status: "completed" as const,
    progress: 100,
    deadline: "Feb 1, 2024",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    id: "3",
    title: "SEVIS Registration",
    description: "Register in SEVIS system and pay I-901 fee",
    status: "completed" as const,
    progress: 100,
    deadline: "Feb 10, 2024",
    icon: <UserCheck className="h-5 w-5" />,
  },
  {
    id: "4",
    title: "SSN Application",
    description: "Apply for Social Security Number at local SSA office",
    status: "active" as const,
    progress: 60,
    deadline: "Mar 30, 2024",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "5",
    title: "CPT Authorization",
    description: "Request Curricular Practical Training from DSO",
    status: "active" as const,
    progress: 30,
    deadline: "Apr 15, 2024",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    id: "6",
    title: "OPT Application (I-765)",
    description: "Apply for Optional Practical Training work authorization",
    status: "upcoming" as const,
    deadline: "Jun 1, 2024",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: "7",
    title: "Travel Signature",
    description: "Get travel signature on I-20 before international travel",
    status: "upcoming" as const,
    deadline: "Jul 1, 2024",
    icon: <Calendar className="h-5 w-5" />,
  },
];

const notifications = [
  {
    id: "1",
    type: "deadline" as const,
    title: "SSN Application Deadline Approaching",
    message: "You have 15 days remaining to complete your SSN application",
    timestamp: "2 hours ago",
    isNew: true,
  },
  {
    id: "2",
    type: "reminder" as const,
    title: "CPT Document Upload",
    message: "Don't forget to upload your job offer letter for CPT",
    timestamp: "1 day ago",
    isNew: true,
  },
  {
    id: "3",
    type: "alert" as const,
    title: "I-20 Expiration Notice",
    message: "Your I-20 will expire in 90 days. Contact your DSO for renewal",
    timestamp: "2 days ago",
  },
];

export default function Index() {
  const [activeTab, setActiveTab] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);

  const filterMilestones = (status?: string) => {
    if (!status || status === "all") return milestones;
    return milestones.filter((m) => m.status === status);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header
        onNotificationsClick={() => setShowNotifications(!showNotifications)}
        notificationCount={notifications.filter((n) => n.isNew).length}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome to Your Journey
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
                    <MilestoneCard key={milestone.id} {...milestone} />
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
                <Button variant="ghost" size="sm">
                  Mark all as read
                </Button>
              </div>
              <NotificationPanel
                notifications={notifications}
                onDismiss={(id) => console.log("Dismiss:", id)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
