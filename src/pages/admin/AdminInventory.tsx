import React, { useState } from "react";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Factory,
  Boxes,
  ClipboardCheck,
  FileText,
  LogOut,
  Settings,
  Sparkles,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
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

const rawMaterials = [
  { name: "Steel Sheets", stock: 150, threshold: 200, status: "low", trend: "down" },
  { name: "Copper Wire", stock: 280, threshold: 100, status: "ok", trend: "stable" },
  { name: "Aluminum Plates", stock: 95, threshold: 150, status: "critical", trend: "down" },
  { name: "Rubber Seals", stock: 520, threshold: 200, status: "ok", trend: "up" },
  { name: "Electronic Components", stock: 340, threshold: 300, status: "ok", trend: "stable" },
  { name: "Plastic Casings", stock: 180, threshold: 250, status: "low", trend: "down" },
];

const finishedProducts = [
  { name: "Engine Assembly A-Series", stock: 45, threshold: 20, status: "ok" },
  { name: "Transmission Unit T-200", stock: 12, threshold: 15, status: "low" },
  { name: "Brake System Components", stock: 78, threshold: 30, status: "ok" },
  { name: "Suspension Kit SK-Pro", stock: 8, threshold: 10, status: "critical" },
];

const aiSuggestions = [
  "Order 500 units of Steel Sheets immediately - current stock will deplete in 3 days at current usage rate.",
  "Aluminum Plates usage has increased 25% this week. Consider adjusting reorder point to 200 units.",
  "Supplier 'MetalWorks' offers 10% discount on bulk orders before year-end. Recommended for Copper Wire restocking.",
];

const AdminInventory: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("raw");

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success">In Stock</span>;
      case "low":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning">Low Stock</span>;
      case "critical":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive">Critical</span>;
      default:
        return null;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <div className="w-4 h-4 flex items-center justify-center text-muted-foreground">—</div>;
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
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track materials and finished products</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="animate-fade-in-up">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="raw" className="gap-2">
                    <Boxes className="w-4 h-4" />
                    Raw Materials
                  </TabsTrigger>
                  <TabsTrigger value="finished" className="gap-2">
                    <Package className="w-4 h-4" />
                    Finished Products
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="raw" className="mt-0">
                  <div className="space-y-3">
                    {rawMaterials.map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-4 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors",
                          item.status === "critical" && "border-l-4 border-destructive"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium">{item.name}</h4>
                              {getStatusBadge(item.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Stock: <span className={cn(
                                "font-medium",
                                item.status === "critical" && "text-destructive",
                                item.status === "low" && "text-warning"
                              )}>{item.stock}</span></span>
                              <span>Threshold: {item.threshold}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(item.trend)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="finished" className="mt-0">
                  <div className="space-y-3">
                    {finishedProducts.map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-4 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors",
                          item.status === "critical" && "border-l-4 border-destructive"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium">{item.name}</h4>
                              {getStatusBadge(item.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>In Stock: <span className="font-medium">{item.stock}</span></span>
                              <span>Min Required: {item.threshold}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </GlassCard>
          </div>

          <div className="space-y-4">
            <GlassCard className="animate-fade-in-up stagger-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <h3 className="font-semibold">Low Stock Alerts</h3>
              </div>
              <div className="text-3xl font-bold text-warning mb-2">
                {rawMaterials.filter(m => m.status !== "ok").length + finishedProducts.filter(p => p.status !== "ok").length}
              </div>
              <p className="text-sm text-muted-foreground">Items need attention</p>
            </GlassCard>

            <GlassCard variant="prominent" className="animate-fade-in-up stagger-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">AI Reorder Suggestions</h3>
              </div>
              <div className="space-y-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 rounded-lg bg-secondary/30 text-sm">
                    <p>{suggestion}</p>
                    <Button variant="link" className="p-0 h-auto mt-2 text-primary text-xs">
                      Take Action →
                    </Button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminInventory;
