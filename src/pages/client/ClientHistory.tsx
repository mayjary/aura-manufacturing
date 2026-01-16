import React, { useState, useEffect } from "react";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  Clock,
  LogOut,
  Settings,
  CheckCircle,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { apiFetch, AuthError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import AuthErrorDialog from "@/components/AuthErrorDialog";

const navItems = [
  { label: "Orders", href: "/client", icon: Package },
  { label: "Deliveries", href: "/client/deliveries", icon: Truck },
  { label: "History", href: "/client/history", icon: Clock },
];

interface CompletedOrder {
  id: string;
  product: string;
  deliveredQty: number;
  completedDate: string;
  qcScore: number;
}

const ClientHistory: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated === false) {
      setAuthError("You need to be logged in to access client history.");
      setShowAuthError(true);
      return;
    }
    if (isAuthenticated === true && userRole !== "client") {
      setAuthError("You don't have permission to access client history.");
      setShowAuthError(true);
      return;
    }
  }, [isAuthenticated, userRole]);

  // Fetch completed orders from API
  useEffect(() => {
    if (!isAuthenticated || userRole !== "client") return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/client/history");
        const formattedOrders: CompletedOrder[] = (data || []).map((order: any) => ({
          ...order,
          completedDate: order.completedDate
            ? new Date(order.completedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
        }));
        setCompletedOrders(formattedOrders);
      } catch (err) {
        if (err instanceof AuthError) {
          setAuthError(err.message);
          setShowAuthError(true);
        } else {
          console.error("Failed to fetch history", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isAuthenticated, userRole]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  const getQcScoreColor = (score: number) => {
    if (score >= 98) return "text-success";
    if (score >= 90) return "text-primary";
    return "text-warning";
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
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-success/5 pointer-events-none" />

      <FloatingNav
        items={navItems}
        rightContent={
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/client/settings")}
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

      <main className="relative pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Order History</h1>
            <p className="text-muted-foreground mt-1">View your completed orders</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export History
          </Button>
        </div>

        {/* Summary Stats */}
        {loading ? (
          <GlassCard className="p-8 text-center">
            <p className="text-muted-foreground">Loading history...</p>
          </GlassCard>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <GlassCard className="p-4 opacity-0 animate-fade-in-up stagger-1">
                <p className="text-2xl font-bold">{completedOrders.length}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </GlassCard>
              <GlassCard className="p-4 opacity-0 animate-fade-in-up stagger-2">
                <p className="text-2xl font-bold">
                  {completedOrders.reduce((acc, order) => acc + order.deliveredQty, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Units Delivered</p>
              </GlassCard>
              <GlassCard className="p-4 opacity-0 animate-fade-in-up stagger-3">
                <p className="text-2xl font-bold text-success">
                  {completedOrders.length > 0
                    ? (
                        completedOrders.reduce((acc, order) => acc + order.qcScore, 0) /
                        completedOrders.length
                      ).toFixed(1)
                    : "0"}
                </p>
                <p className="text-sm text-muted-foreground">Avg QC Score</p>
              </GlassCard>
            </div>

            {/* Orders Table */}
            <GlassCard className="opacity-0 animate-fade-in-up stagger-2">
              <h2 className="text-lg font-semibold mb-4">Completed Orders</h2>
              {completedOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No completed orders found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border/30">
                        <th className="pb-3 font-medium">Order ID</th>
                        <th className="pb-3 font-medium">Product</th>
                        <th className="pb-3 font-medium">Qty Delivered</th>
                        <th className="pb-3 font-medium">Completed</th>
                        <th className="pb-3 font-medium">QC Score</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedOrders.map((order) => (
                        <tr key={order.id} className="border-b border-border/20 last:border-0">
                          <td className="py-4 font-medium">{order.id.slice(0, 8)}</td>
                          <td className="py-4">{order.product}</td>
                          <td className="py-4">{order.deliveredQty} units</td>
                          <td className="py-4 text-muted-foreground">{order.completedDate}</td>
                          <td className="py-4">
                            <span className={cn("font-medium", getQcScoreColor(order.qcScore))}>
                              {order.qcScore}/100
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-success" />
                              <span className="text-sm text-success">Completed</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </>
        )}
      </main>
    </div>
  );
};

export default ClientHistory;
