import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Settings,
  Shield,
  LogOut,
  Sun,
  Moon,
  Bell,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const sidebarItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Settings },
  { id: "security", label: "Security", icon: Shield },
];

const WorkerSettings: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  
  const [preferences, setPreferences] = useState({
    notifications: true,
    soundAlerts: false,
    autoStartTasks: true,
  });

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <GlassCard className="animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">John Operator</h4>
                  <p className="text-muted-foreground">Machine Operator</p>
                </div>
              </div>
              <div>
                <Label>Full Name</Label>
                <Input defaultValue="John Operator" className="mt-2" />
              </div>
              <div>
                <Label>Employee ID</Label>
                <Input defaultValue="EMP-2024-0042" readOnly className="mt-2 bg-secondary/30" />
              </div>
              <div>
                <Label>Role</Label>
                <Input defaultValue="Machine Operator" readOnly className="mt-2 bg-secondary/30" />
              </div>
              <div>
                <Label>Assigned Line</Label>
                <Input defaultValue="Assembly Line B" readOnly className="mt-2 bg-secondary/30" />
              </div>
              <div>
                <Label>Shift Timing</Label>
                <Input defaultValue="8:00 AM - 4:00 PM" readOnly className="mt-2 bg-secondary/30" />
              </div>
              <Button className="mt-4">Update Profile</Button>
            </div>
          </GlassCard>
        );

      case "preferences":
        return (
          <GlassCard className="animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-6">Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive task assignments and updates</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, notifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Sound Alerts</p>
                    <p className="text-sm text-muted-foreground">Play sound for new tasks</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.soundAlerts}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, soundAlerts: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/50">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium">Auto-Start Tasks</p>
                    <p className="text-sm text-muted-foreground">Automatically start next task in queue</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.autoStartTasks}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, autoStartTasks: checked }))
                  }
                />
              </div>

              <Button className="mt-4">Save Preferences</Button>
            </div>
          </GlassCard>
        );

      case "security":
        return (
          <div className="space-y-4 animate-fade-in-up">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-6">Security</h3>
              <div className="space-y-4">
                <div>
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="Enter current password" className="mt-2" />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Enter new password" className="mt-2" />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="Confirm new password" className="mt-2" />
                </div>
                <Button className="mt-4">Change Password</Button>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg font-semibold mb-4">Session</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sign out of your account on this device.
              </p>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </GlassCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      sidebarItems={sidebarItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      backPath="/worker"
      title="Settings"
    >
      {renderContent()}
    </SettingsLayout>
  );
};

export default WorkerSettings;
