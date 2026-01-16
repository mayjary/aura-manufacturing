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
import { apiFetch, AuthError } from "@/lib/api";

const navItems = [
  { label: "Orders", href: "/client", icon: Package },
  { label: "Deliveries", href: "/client/deliveries", icon: Truck },
  { label: "History", href: "/client/history", icon: Clock },
];

interface Order {
  id: string;
  product: string;
  status: string;
  quantity_target: number;
  quantity_completed: number;
  progress: number;
  deadline?: string;
  completed_at?: string;
}

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch orders from API
  useEffect(() => {
    if (!isAuthenticated || userRole !== "client") return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/client/orders");
        setOrders(data || []);
      } catch (err) {
        if (err instanceof AuthError) {
          setAuthError(err.message);
          setShowAuthError(true);
        } else {
          console.error("Failed to fetch orders", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, userRole]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "in-progress":
        return "In Production";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      default:
        return status;
    }
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
            value={orders.filter((o) => o.status !== "completed").length.toString()}
            icon={Package}
            className="opacity-0 animate-fade-in-up stagger-1"
          />
          <StatCard
            title="In Production"
            value={orders.filter((o) => o.status === "in-progress").length.toString()}
            icon={Truck}
            className="opacity-0 animate-fade-in-up stagger-2"
          />
          <StatCard
            title="Completed"
            value={orders.filter((o) => o.status === "completed").length.toString()}
            icon={CheckCircle}
            className="opacity-0 animate-fade-in-up stagger-3"
          />
        </div>

        {/* Orders List */}
        {loading ? (
          <GlassCard className="p-8 text-center">
            <p className="text-muted-foreground">Loading orders...</p>
          </GlassCard>
        ) : orders.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-muted-foreground">No orders found</p>
          </GlassCard>
        ) : (
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
                      <h3 className="text-lg font-semibold">{order.id.slice(0, 8)}</h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          order.status === "in-progress"
                            ? "bg-primary/20 text-primary"
                            : order.status === "completed"
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {getStatusDisplay(order.status)}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{order.product}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.quantity_completed} / {order.quantity_target} units
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    {order.deadline && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>ETA: {formatDate(order.deadline)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-semibold">{order.progress}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <Progress value={order.progress} className="h-2 mb-6" />
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
