import React, { useState, useEffect } from "react";
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
import { apiFetch, AuthError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import AuthErrorDialog from "@/components/AuthErrorDialog";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Production", href: "/admin/production", icon: Factory },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Quality", href: "/admin/quality", icon: ClipboardCheck },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [stats, setStats] = useState({
    activeOrders: 0,
    productionRate: 0,
    qualityScore: 0,
    inventoryAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated === false) {
      setAuthError("You need to be logged in to access the admin dashboard.");
      setShowAuthError(true);
      return;
    }
    if (isAuthenticated === true && userRole !== "admin") {
      setAuthError("You don't have permission to access the admin dashboard.");
      setShowAuthError(true);
      return;
    }
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") return;

    const fetchData = async () => {
      try {
        // Fetch production orders
        const orders = await apiFetch("/production/list").catch(() => []);
        // Fetch products for name mapping
        const products = await apiFetch("/products").catch(() => []);
        const productMap = Object.fromEntries((products || []).map((p: any) => [p.id, p.name]));
        setProductionOrders(
          (orders || []).map((order: any) => ({
            ...order,
            product_name: order.product_name || productMap[order.product_id] || "Unknown Product",
          }))
        );

        // Active Orders = status != "completed"
        const activeOrders = (orders || []).filter(
          (order: any) => order.status !== "completed"
        ).length;

        // Production Rate = completed_orders / total_orders
        const totalOrders = orders?.length || 0;
        const completedOrders = (orders || []).filter(
          (order: any) => order.status === "completed"
        ).length;
        const productionRate =
          totalOrders > 0
            ? Math.round((completedOrders / totalOrders) * 100 * 100) / 100
            : 0;

        // Quality Score = AVG(qc_logs.product_quality_score)
        const qcLogs = await apiFetch("/quality/logs").catch(() => []);
        let qualityScore = 0;
        if (qcLogs && qcLogs.length > 0) {
          const validLogs = qcLogs.filter(
            (log: any) =>
              log.product_quality_score !== null &&
              log.product_quality_score !== undefined
          );
          if (validLogs.length > 0) {
            const avgScore =
              validLogs.reduce((sum: number, log: any) => {
                return sum + Number(log.product_quality_score || 0);
              }, 0) / validLogs.length;
            qualityScore = Math.round(avgScore * 100) / 100;
          }
        }

        // Fetch inventory
        const inventory = await apiFetch("/inventory").catch(() => []);
        const alerts = (inventory || [])
          .filter((item: any) => {
            const stock = item.current_stock || 0;
            const threshold = item.reorder_threshold || 0;
            return stock <= threshold;
          })
          .map((item: any) => ({
            item: item.name,
            stock: item.current_stock || 0,
            threshold: item.reorder_threshold || 0,
            urgency:
              item.current_stock <= item.reorder_threshold * 0.5 ? "high" : "medium",
          }));
        setInventoryAlerts(alerts);

        // Fetch AI suggestions
        const suggestions = await apiFetch("/ai/suggestions").catch(() => []);
        setAiSuggestions(Array.isArray(suggestions) ? suggestions : []);

        // Calculate stats with real values from DB
        setStats({
          activeOrders,
          productionRate,
          qualityScore,
          inventoryAlerts: alerts.length,
        });
      } catch (err) {
        if (err instanceof AuthError) {
          setAuthError(err.message);
          setShowAuthError(true);
        } else {
          console.error("Failed to fetch dashboard data", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userRole]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const getProgressFromStatus = (order: any): number => {
    // Use real progress from database: (quantity_completed / quantity_target) * 100
    if (order.quantity_target && order.quantity_target > 0) {
      return Math.min(
        100,
        Math.round(((order.quantity_completed || 0) / order.quantity_target) * 100)
      );
    }
    return 0;
  };

  const getStatusFromOrder = (order: any): string => {
    if (order.status === "delayed") return "Delayed";
    if (order.status === "completed") return "Completed";
    return "On Track";
  };

  // Don't render content if not authenticated
  if (!isAuthenticated || userRole !== "admin") {
    return (
      <>
        <AuthErrorDialog
          open={showAuthError}
          onOpenChange={setShowAuthError}
          message={authError}
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <GlassCard className="p-8 text-center">
            <p className="text-muted-foreground">Checking authentication...</p>
          </GlassCard>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthErrorDialog
        open={showAuthError}
        onOpenChange={setShowAuthError}
        message={authError}
      />
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-secondary/40 to-primary/5 pointer-events-none" />

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
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Welcome back, <span className="text-gradient">Manager</span>
        </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening in your factory today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Active Orders"
            value={stats.activeOrders.toString()}
            icon={Package}
            className="opacity-0 animate-fade-in-up stagger-1"
          />
          <StatCard
            title="Production Rate"
            value={`${stats.productionRate}%`}
            icon={TrendingUp}
            className="opacity-0 animate-fade-in-up stagger-2"
          />
          <StatCard
            title="Quality Score"
            value={stats.qualityScore.toString()}
            subtitle="Out of 100"
            icon={ClipboardCheck}
            className="opacity-0 animate-fade-in-up stagger-3"
          />
          <StatCard
            title="Inventory Alerts"
            value={stats.inventoryAlerts.toString()}
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
              {loading ? (
                <p className="text-muted-foreground">Loading production orders...</p>
              ) : productionOrders.length === 0 ? (
                <p className="text-muted-foreground">No production orders found.</p>
              ) : (
                productionOrders.slice(0, 4).map((order) => {
                  const progress = getProgressFromStatus(order);
                  const status = getStatusFromOrder(order);
                  return (
                    <div
                      key={order.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/20 hover:bg-secondary/35 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{order.id}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              status === "On Track" || status === "Completed"
                                ? "bg-success/20 text-success"
                                : "bg-warning/20 text-warning"
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {order.product_name || "Unknown Product"}
                        </p>
                      </div>
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  );
                })
              )}
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
              {inventoryAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inventory alerts</p>
              ) : (
                inventoryAlerts.map((alert, index) => (
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
                ))
              )}
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
              {aiSuggestions.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-3">No AI suggestions available</p>
              ) : (
                aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 hover:border-primary/20 transition-colors"
                >
                  <p className="text-sm">{suggestion}</p>
                  <Button variant="link" className="p-0 h-auto mt-3 text-primary">
                    Apply Suggestion →
                  </Button>
                </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
