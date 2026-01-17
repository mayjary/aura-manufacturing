import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { cn } from "@/lib/utils";
import { apiFetch, AuthError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import AuthErrorDialog from "@/components/AuthErrorDialog";
import { OperationsChatbot } from "@/components/chatbot/OperationsChatbot";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Production", href: "/admin/production", icon: Factory },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Quality", href: "/admin/quality", icon: ClipboardCheck },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

// Mock finished products (OK for now)
const finishedProducts = [
  { name: "Engine Assembly A-Series", stock: 45, threshold: 20, status: "ok" },
  { name: "Transmission Unit T-200", stock: 12, threshold: 15, status: "low" },
  { name: "Brake System Components", stock: 78, threshold: 30, status: "ok" },
  { name: "Suspension Kit SK-Pro", stock: 8, threshold: 10, status: "critical" },
];

// Mock AI suggestions (Phase 3)


const AdminInventory: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [activeTab, setActiveTab] = useState("raw");
  const [rawMaterials, setRawMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [project_id, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") return;
    const stored = localStorage.getItem("project_id");
    if (stored) {
      setProjectId(stored);
    }
  }, [isAuthenticated, userRole]);
  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated === false) {
      setAuthError("You need to be logged in to access inventory management.");
      setShowAuthError(true);
      return;
    }
    if (isAuthenticated === true && userRole !== "admin") {
      setAuthError("You don't have permission to access inventory management.");
      setShowAuthError(true);
      return;
    }
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") return;

    apiFetch("/ai/suggestions")
      .then(setAiSuggestions)
      .catch((err) => {
        if (err instanceof AuthError) {
          setAuthError(err.message);
          setShowAuthError(true);
        } else {
          console.error("Failed to fetch AI suggestions", err);
        }
      });
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") return;

    const fetchInventory = async () => {
      try {
        const data = await apiFetch("/inventory");
        setRawMaterials(data);
      } catch (err) {
        if (err instanceof AuthError) {
          setAuthError(err.message);
          setShowAuthError(true);
        } else {
          console.error("Failed to fetch inventory", err);
        }
      } finally {
        setLoading(false);
      }
    };
 
    fetchInventory();
  }, [isAuthenticated, userRole]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success">
            In Stock
          </span>
        );
      case "low":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning">
            Low Stock
          </span>
        );
      case "critical":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive">
            Critical
          </span>
        );
      default:
        return null;
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <span className="text-muted-foreground">—</span>;
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
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track materials and finished products
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Inventory */}
          <div className="lg:col-span-2">
            <GlassCard>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="raw">
                    <Boxes className="w-4 h-4 mr-2" />
                    Raw Materials
                  </TabsTrigger>
                  <TabsTrigger value="finished">
                    <Package className="w-4 h-4 mr-2" />
                    Finished Products
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="raw">
                  {loading && (
                    <p className="text-muted-foreground">
                      Loading inventory...
                    </p>
                  )}

                  {!loading && (
                    <div className="space-y-3">
                      {rawMaterials.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "p-4 rounded-xl bg-secondary/20",
                            item.status === "critical" &&
                              "border-l-4 border-destructive"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-medium">{item.name}</h4>
                                {getStatusBadge(item.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Stock:{" "}
                                <span className="font-medium">
                                  {item.current_stock}
                                </span>{" "}
                                • Threshold: {item.reorder_threshold}
                              </p>
                            </div>
                            {getTrendIcon(item.trend)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="finished">
                  <div className="space-y-3">
                    {finishedProducts.map((item, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-4 rounded-xl bg-secondary/20",
                          item.status === "critical" &&
                            "border-l-4 border-destructive"
                        )}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          In Stock: {item.stock} • Min Required:{" "}
                          {item.threshold}
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </GlassCard>
          </div>

          {/* Insights */}
          <div className="space-y-4">
            <GlassCard>
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="font-semibold">Low Stock Alerts</h3>
              </div>
              <div className="text-3xl font-bold text-warning">
                {rawMaterials.filter((m) => m.status !== "ok").length}
              </div>
              <p className="text-sm text-muted-foreground">
                Items need attention
              </p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">AI Reorder Suggestions</h3>
              </div>
              <div className="space-y-3">
                {aiSuggestions.map((s, i) => (
                  <p key={i} className="text-sm bg-secondary/30 p-3 rounded-lg">
                    {s}
                  </p>
                ))}
              </div>
            </GlassCard>
            <OperationsChatbot projectId={project_id} />

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminInventory;
