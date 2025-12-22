import React from "react";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { StatCard } from "@/components/ui/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Factory,
  Boxes,
  ClipboardCheck,
  FileText,
  LogOut,
  Settings,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Repeat,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Production", href: "/admin/production", icon: Factory },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Quality", href: "/admin/quality", icon: ClipboardCheck },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

const qcLogs = [
  { order: "PRD-001", defects: 2, score: 96, status: "passed", date: "Dec 22, 2024" },
  { order: "PRD-002", defects: 0, score: 100, status: "passed", date: "Dec 21, 2024" },
  { order: "PRD-003", defects: 8, score: 72, status: "failed", date: "Dec 21, 2024" },
  { order: "PRD-004", defects: 1, score: 98, status: "passed", date: "Dec 20, 2024" },
  { order: "PRD-005", defects: 5, score: 85, status: "rework", date: "Dec 20, 2024" },
  { order: "PRD-006", defects: 0, score: 100, status: "passed", date: "Dec 19, 2024" },
];

const defectTrend = [
  { week: "Week 48", rate: 2.1 },
  { week: "Week 49", rate: 1.8 },
  { week: "Week 50", rate: 2.5 },
  { week: "Week 51", rate: 1.9 },
];

const AdminQuality: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "rework":
        return <Repeat className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success capitalize">{status}</span>;
      case "failed":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive capitalize">{status}</span>;
      case "rework":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning capitalize">{status}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-secondary/40 to-primary/5 pointer-events-none" />

      <FloatingNav
        items={navItems}
        rightContent={
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/settings")}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
            </Button>
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

      <main className="relative pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Quality Control</h1>
          <p className="text-muted-foreground mt-1">Monitor quality metrics and inspection results</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="QC Score"
            value="94.2"
            subtitle="Average this month"
            icon={ClipboardCheck}
            trend={{ value: 2.5, isPositive: true }}
            className="opacity-0 animate-fade-in-up stagger-1"
          />
          <StatCard
            title="Defect Rate"
            value="2.1%"
            subtitle="Current week"
            icon={AlertTriangle}
            trend={{ value: 0.3, isPositive: false }}
            className="opacity-0 animate-fade-in-up stagger-2"
          />
          <StatCard
            title="Rework Count"
            value="4"
            subtitle="This month"
            icon={Repeat}
            className="opacity-0 animate-fade-in-up stagger-3"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* QC Logs Table */}
          <GlassCard className="lg:col-span-2 opacity-0 animate-fade-in-up stagger-2">
            <h3 className="text-lg font-semibold mb-4">Recent QC Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b border-border/30">
                    <th className="pb-3 font-medium">Order</th>
                    <th className="pb-3 font-medium">Defects</th>
                    <th className="pb-3 font-medium">Score</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {qcLogs.map((log, index) => (
                    <tr key={index} className="border-b border-border/20 last:border-0">
                      <td className="py-4 font-medium">{log.order}</td>
                      <td className="py-4">
                        <span className={cn(
                          log.defects > 5 && "text-destructive",
                          log.defects > 0 && log.defects <= 5 && "text-warning",
                          log.defects === 0 && "text-success"
                        )}>
                          {log.defects}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={cn(
                          "font-medium",
                          log.score >= 90 && "text-success",
                          log.score >= 80 && log.score < 90 && "text-warning",
                          log.score < 80 && "text-destructive"
                        )}>
                          {log.score}/100
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          {getStatusBadge(log.status)}
                        </div>
                      </td>
                      <td className="py-4 text-muted-foreground text-sm">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Defect Trend */}
          <GlassCard className="opacity-0 animate-fade-in-up stagger-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingDown className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Defect Trend</h3>
            </div>
            
            <div className="space-y-4">
              {defectTrend.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.week}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 bg-primary/20 rounded-full"
                      style={{ width: `${item.rate * 30}px` }}
                    >
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(item.rate / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{item.rate}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-lg bg-success/10 text-sm">
              <p className="text-success font-medium">↓ 12% improvement</p>
              <p className="text-muted-foreground mt-1">compared to last month</p>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default AdminQuality;
