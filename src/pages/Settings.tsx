import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PrivacyFooter } from "@/components/PrivacyFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { User, Bell, Lock, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const navigate = useNavigate();
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header
        onNotificationsClick={() => navigate("/notifications")}
        notificationCount={state.notifications.filter((n) => !n.read).length}
      />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          <div className="max-w-2xl space-y-6">
            {/* Profile Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Profile</h2>
              </div>
              {state.profile ? (
                <div className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={state.profile.fullName} readOnly />
                  </div>
                  <div>
                    <Label>University</Label>
                    <Input value={state.profile.university} readOnly />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Visa Type</Label>
                      <Input value={state.profile.visaType} readOnly />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input value={state.profile.country} readOnly />
                    </div>
                  </div>
                  <Button variant="outline">Edit Profile</Button>
                </div>
              ) : (
                <p className="text-muted-foreground">Complete onboarding to set up your profile</p>
              )}
            </Card>

            {/* Notification Preferences */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Notifications</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive deadline reminders via email
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Coming Soon
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get urgent alerts via text message
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Coming Soon
                  </Button>
                </div>
              </div>
            </Card>

            {/* Privacy & Security */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Privacy & Security</h2>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your data is stored locally and never shared with third parties.
                  All documents and personal information remain private.
                </p>
                <Button variant="outline">Export My Data</Button>
              </div>
            </Card>

            {/* Language */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Language</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Preferred Language</Label>
                  <Input value="English (US)" readOnly />
                </div>
                <p className="text-sm text-muted-foreground">
                  Additional languages coming soon
                </p>
              </div>
            </Card>
          </div>
        </main>
      </div>

      <PrivacyFooter />
    </div>
  );
}
