import React from "react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  User,
  LogOut,
  Settings,
  Briefcase,
  MapPin,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Tasks", href: "/worker", icon: ClipboardList },
  { label: "QC Logs", href: "/worker/qc-logs", icon: CheckCircle2 },
  { label: "History", href: "/worker/history", icon: Clock },
  { label: "Profile", href: "/worker/profile", icon: User },
];

const WorkerProfile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <FloatingNav
          items={navItems}
          rightContent={
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          }
        />
      </div>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 glass-nav rounded-none px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Profile</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav items={navItems} />
      </div>

      <main className="relative pt-20 md:pt-24 pb-24 md:pb-12 px-4 md:px-8 max-w-xl mx-auto">
        {/* Profile Card */}
        <GlassCard className="mb-6 animate-fade-in-up">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <User className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">John Operator</h2>
            <p className="text-muted-foreground">Machine Operator</p>
            <p className="text-sm text-muted-foreground mt-1">Employee ID: EMP-2024-0042</p>
          </div>
        </GlassCard>

        {/* Info Cards */}
        <div className="space-y-4">
          <GlassCard className="opacity-0 animate-fade-in-up stagger-1">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">Machine Operator - Level 2</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="opacity-0 animate-fade-in-up stagger-2">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <MapPin className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assigned Line</p>
                <p className="font-medium">Assembly Line B</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="opacity-0 animate-fade-in-up stagger-3">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shift Timing</p>
                <p className="font-medium">8:00 AM - 4:00 PM (Day Shift)</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="opacity-0 animate-fade-in-up stagger-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">March 15, 2024</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Stats */}
        <GlassCard className="mt-6 opacity-0 animate-fade-in-up stagger-5">
          <h3 className="font-semibold mb-4">This Month</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">42</p>
              <p className="text-xs text-muted-foreground">Tasks Done</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">15</p>
              <p className="text-xs text-muted-foreground">QC Logs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">98%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </div>
        </GlassCard>

        {/* Settings Button */}
        <Button
          variant="outline"
          className="w-full mt-6 h-12 gap-2 opacity-0 animate-fade-in-up stagger-5"
          onClick={() => navigate("/worker/settings")}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </main>
    </div>
  );
};

export default WorkerProfile;
