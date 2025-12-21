import React from "react";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { StatCard } from "@/components/ui/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  FileText,
  LogOut,
  Factory,
  AlertTriangle,
  TrendingUp,
  Boxes,
  Sparkles,
  Download,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Production", href: "/admin/production", icon: Factory },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Quality", href: "/admin/quality", icon: ClipboardCheck },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

const productionOrders = [
  { id: "PRD-001", product: "Engine Assembly", progress: 85, status: "On Track" },
  { id: "PRD-002", product: "Transmission Unit", progress: 62, status: "On Track" },
  { id: "PRD-003", product: "Brake System", progress: 45, status: "Delayed" },
  { id: "PRD-004", product: "Suspension Kit", progress: 90, status: "On Track" },
];

const inventoryAlerts = [
  { item: "Steel Sheets", stock: 15, threshold: 50, urgency: "high" },
  { item: "Copper Wire", stock: 28, threshold: 40, urgency: "medium" },
  { item: "Rubber Seals", stock: 120, threshold: 100, urgency: "low" },
];

const aiSuggestions = [
  "Increase steel sheet order by 40% to meet Q2 demand projections",
  "Schedule maintenance for CNC Machine #3 - efficiency dropped 12%",
  "Consider reassigning 2 workers from Line B to Line A for PRD-003",
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      {/* Floating Navigation */}
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

      {/* Main Content */}
      <main className="relative pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening in your factory today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Orders"
            value="24"
            icon={Package}
            trend={{ value: 12, isPositive: true }}
            className="opacity-0 animate-fade-in-up stagger-1"
          />
          <StatCard
            title="Production Rate"
            value="94%"
            icon={TrendingUp}
            trend={{ value: 3, isPositive: true }}
            className="opacity-0 animate-fade-in-up stagger-2"
          />
          <StatCard
            title="Quality Score"
            value="98.5"
            subtitle="Out of 100"
            icon={ClipboardCheck}
            className="opacity-0 animate-fade-in-up stagger-3"
          />
          <StatCard
            title="Inventory Alerts"
            value="3"
            icon={AlertTriangle}
            className="opacity-0 animate-fade-in-up stagger-4"
          />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Production Schedule */}
          <GlassCard className="lg:col-span-2 opacity-0 animate-fade-in-up stagger-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Production Schedule</h2>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            <div className="space-y-4">
              {productionOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{order.id}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === "On Track"
                            ? "bg-success/20 text-success"
                            : "bg-warning/20 text-warning"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {order.product}
                    </p>
                  </div>
                  <div className="w-32">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{order.progress}%</span>
                    </div>
                    <Progress value={order.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Inventory Alerts */}
          <GlassCard className="opacity-0 animate-fade-in-up stagger-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <h2 className="text-lg font-semibold">Inventory Alerts</h2>
            </div>

            <div className="space-y-3">
              {inventoryAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-secondary/30 border-l-4"
                  style={{
                    borderLeftColor:
                      alert.urgency === "high"
                        ? "hsl(var(--destructive))"
                        : alert.urgency === "medium"
                        ? "hsl(var(--warning))"
                        : "hsl(var(--success))",
                  }}
                >
                  <p className="font-medium text-sm">{alert.item}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Stock: {alert.stock} / Min: {alert.threshold}
                  </p>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              View All Inventory
            </Button>
          </GlassCard>

          {/* AI Suggestions */}
          <GlassCard className="lg:col-span-3 opacity-0 animate-fade-in-up stagger-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI Suggestions</h2>
                <p className="text-sm text-muted-foreground">
                  Smart recommendations based on your data
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 hover:border-primary/20 transition-colors"
                >
                  <p className="text-sm">{suggestion}</p>
                  <Button variant="link" className="p-0 h-auto mt-3 text-primary">
                    Apply Suggestion →
                  </Button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
