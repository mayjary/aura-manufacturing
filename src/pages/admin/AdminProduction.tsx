import React from "react";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  Factory,
  Boxes,
  ClipboardCheck,
  FileText,
  LogOut,
  Settings,
  Sparkles,
  Users,
  Calendar,
  AlertTriangle,
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

const productionOrders = [
  {
    id: "PRD-001",
    product: "Engine Assembly A-Series",
    quantity: 50,
    workers: ["John D.", "Maria S.", "Alex K."],
    deadline: "Dec 28, 2024",
    status: "on-track",
    progress: 85,
  },
  {
    id: "PRD-002",
    product: "Transmission Unit T-200",
    quantity: 25,
    workers: ["Sarah L.", "Mike R."],
    deadline: "Dec 26, 2024",
    status: "on-track",
    progress: 62,
  },
  {
    id: "PRD-003",
    product: "Brake System Components",
    quantity: 100,
    workers: ["Tom W.", "Lisa M.", "Chris P.", "Anna B."],
    deadline: "Dec 24, 2024",
    status: "delayed",
    progress: 45,
  },
  {
    id: "PRD-004",
    product: "Suspension Kit SK-Pro",
    quantity: 30,
    workers: ["David H."],
    deadline: "Jan 2, 2025",
    status: "on-track",
    progress: 90,
  },
  {
    id: "PRD-005",
    product: "Exhaust System ES-400",
    quantity: 40,
    workers: ["Emma S.", "Ryan T."],
    deadline: "Jan 5, 2025",
    status: "pending",
    progress: 15,
  },
];

const aiNotes = [
  { type: "warning", message: "PRD-003 is 2 days behind schedule. Consider reassigning 2 workers from Line C." },
  { type: "info", message: "PRD-004 will complete ahead of schedule. Resources can be reallocated after Dec 30." },
  { type: "warning", message: "Material shortage expected for PRD-005 if steel order doesn't arrive by Dec 26." },
];

const AdminProduction: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-success/20 text-success";
      case "delayed":
        return "bg-destructive/20 text-destructive";
      case "pending":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
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
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Production Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track all production orders</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {productionOrders.map((order, index) => (
              <GlassCard 
                key={order.id}
                className={cn("opacity-0 animate-fade-in-up", `stagger-${Math.min(index + 1, 5)}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">{order.id}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full capitalize",
                        getStatusStyles(order.status)
                      )}>
                        {order.status.replace("-", " ")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{order.product}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{order.deadline}</span>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                    <p className="font-semibold">{order.quantity} units</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-1">Assigned Workers</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{order.workers.length}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-1">Team</p>
                    <p className="text-sm truncate">{order.workers.slice(0, 2).join(", ")}{order.workers.length > 2 && ` +${order.workers.length - 2}`}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{order.progress}%</span>
                  </div>
                  <Progress value={order.progress} className="h-2" />
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="space-y-4">
            <GlassCard variant="prominent" className="opacity-0 animate-fade-in-up stagger-2">
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
