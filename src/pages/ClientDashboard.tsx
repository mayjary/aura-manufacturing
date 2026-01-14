import React, { useState, useEffect } from "react";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { StatCard } from "@/components/ui/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  LogOut,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import AuthErrorDialog from "@/components/AuthErrorDialog";
import { apiFetch, AuthError } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { label: "Orders", href: "/client", icon: Package },
  { label: "Deliveries", href: "/client/deliveries", icon: Truck },
  { label: "History", href: "/client/history", icon: Clock },
];

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeOrders: 0,
    inTransit: 0,
    completedThisMonth: 0,
  });

  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated === false) {
      setAuthError("You need to be logged in to access the client dashboard.");
      setShowAuthError(true);
      return;
    }
    if (isAuthenticated === true && userRole !== "client") {
      setAuthError("You don't have permission to access the client dashboard.");
      setShowAuthError(true);
      return;
    }
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== "client") return;

    const fetchData = async () => {
      try {
        const orderData = await apiFetch("/production/my").catch(() => []);
        const mapped = (orderData || []).map((o: any) => {
          const progress =
            o.quantity_target && o.quantity_target > 0
              ? Math.min(
                  100,
                  Math.round(((o.quantity_completed || 0) / o.quantity_target) * 100)
                )
              : 0;
          return {
            id: o.id,
            product: o.product_name || "Production Order",
            status: o.status || "pending",
            progress,
            eta: o.deadline ? new Date(o.deadline).toLocaleDateString() : "TBD",
            completed_at: o.completed_at,
            stages: [
              { name: "Order Placed", completed: true },
              { name: "Materials Ready", completed: true },
              { name: "In Production", completed: o.status === "in-progress", current: o.status === "in-progress" },
              { name: "Quality Check", completed: o.status === "completed", current: o.status === "qc" },
              { name: "Shipped", completed: o.status === "shipped" },
            ],
          };
        });
        setOrders(mapped);

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        setStats({
          activeOrders: mapped.filter((o: any) => o.status !== "completed").length,
          inTransit: mapped.filter((o: any) => o.status === "shipped").length,
          completedThisMonth: mapped.filter((o: any) => {
            const completedAt = o.completed_at ? new Date(o.completed_at) : null;
            return (
              o.status === "completed" &&
              completedAt &&
              completedAt.getMonth() === thisMonth &&
              completedAt.getFullYear() === thisYear
            );
          }).length,
        });
      } catch (err) {
        if (err instanceof AuthError) {
          setAuthError(err.message);
          setShowAuthError(true);
        } else {
          toast({ title: "Failed to load client data", variant: "destructive" });
        }
      }
    };

    fetchData();
  }, [isAuthenticated, userRole]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  // Don't render content if not authenticated
  if (!isAuthenticated || userRole !== "client") {
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
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-success/5 pointer-events-none" />

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
      <main className="relative pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track your orders and deliveries in real-time
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Active Orders"
            value={stats.activeOrders.toString()}
            icon={Package}
            className="opacity-0 animate-fade-in-up stagger-1"
          />
          <StatCard
            title="In Transit"
            value={stats.inTransit.toString()}
            icon={Truck}
            className="opacity-0 animate-fade-in-up stagger-2"
          />
          <StatCard
            title="Completed This Month"
            value={stats.completedThisMonth.toString()}
            icon={CheckCircle}
            className="opacity-0 animate-fade-in-up stagger-3"
          />
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order, index) => (
            <GlassCard
              key={order.id}
              className={`opacity-0 animate-fade-in-up stagger-${index + 2}`}
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold">{order.id}</h3>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        order.status === "in-progress"
                          ? "bg-primary/20 text-primary"
                          : order.status === "qc"
                          ? "bg-warning/20 text-warning"
                          : order.status === "completed"
                          ? "bg-success/20 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{order.product}</p>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>ETA: {order.eta}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-semibold">{order.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <Progress value={order.progress} className="h-2 mb-6" />

              {/* Stages Timeline */}
              <div className="flex items-center justify-between">
                {order.stages.map((stage, stageIndex) => (
                  <div
                    key={stage.name}
                    className="flex flex-col items-center text-center flex-1"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                        stage.completed
                          ? "bg-success text-success-foreground"
                          : stage.current
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stage.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : stage.current ? (
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      ) : (
                        <span className="text-xs">{stageIndex + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        stage.completed || stage.current
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
