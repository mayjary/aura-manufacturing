import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
  Sparkles,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

// 🔮 Placeholder AI notes (real data comes later)
const aiNotes = [
  {
    type: "warning",
    message:
      "Production delay detected in one or more orders. Consider reallocating workforce.",
  },
  {
    type: "info",
    message:
      "Inventory usage is within optimal range for current production volume.",
  },
];

const AdminProduction: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated === false) {
      setAuthError("You need to be logged in to access production management.");
      setShowAuthError(true);
      return;
    }
    if (isAuthenticated === true && userRole !== "admin") {
      setAuthError("You don't have permission to access production management.");
      setShowAuthError(true);
      return;
    }
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") return;

    const fetchProductions = async () => {
      try {
        const data = await apiFetch("/production/list");
        setProductionOrders(data);
      } catch (err) {
        if (err instanceof AuthError) {
          setAuthError(err.message);
          setShowAuthError(true);
        } else {
          console.error("Failed to fetch productions", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductions();
  }, [isAuthenticated, userRole]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/20 text-success";
      case "in-progress":
        return "bg-primary/20 text-primary";
      case "pending":
      default:
        return "bg-muted text-muted-foreground";
    }
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
          <h1 className="text-3xl font-semibold text-foreground">
            Production Orders
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all production orders
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Production list */}
          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <GlassCard>
                <p className="text-muted-foreground">
                  Loading production orders...
                </p>
              </GlassCard>
            )}

            {!loading &&
              productionOrders.map((order, index) => (
                <GlassCard
                  key={order.id}
                  className={cn(
                    "opacity-0 animate-fade-in-up",
                    `stagger-${Math.min(index + 1, 5)}`
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm text-muted-foreground">
                          {order.id}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full capitalize",
                            getStatusStyles(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">
                        {order.product_name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{order.deadline}</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">
                        Quantity Target
                      </p>
                      <p className="font-semibold">
                        {order.quantity_target} units
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">
                        Production Status
                      </p>
                      <p className="font-semibold capitalize">
                        {order.status}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
          </div>

          {/* AI insights */}
          <div className="space-y-4">
            <GlassCard className="opacity-0 animate-fade-in-up stagger-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">AI Insights</h3>
              </div>

              <div className="space-y-3">
                {aiNotes.map((note, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      note.type === "warning"
                        ? "bg-warning/10 border-l-2 border-warning"
                        : "bg-primary/10 border-l-2 border-primary"
                    )}
                  >
                    {note.type === "warning" && (
                      <AlertTriangle className="w-4 h-4 text-warning mb-1" />
                    )}
                    <p>{note.message}</p>
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

export default AdminProduction;
