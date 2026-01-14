import React, { useEffect, useState } from "react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  User,
  LogOut,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { apiFetch, AuthError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { label: "Tasks", href: "/worker", icon: ClipboardList },
  { label: "QC Logs", href: "/worker/qc-logs", icon: CheckCircle2 },
  { label: "History", href: "/worker/history", icon: Clock },
  { label: "Profile", href: "/worker/profile", icon: User },
];

const WorkerHistory: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole, user } = useAuth();
  const [taskHistory, setTaskHistory] = useState<
    { id: string; title: string; order: string; date: string; type: "task" | "qc" }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    if (!isAuthenticated || userRole !== "worker") return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const qcLogs = await apiFetch("/quality/logs").catch(() => []);
        const myId = user?.id;
        const relevant = (qcLogs || [])
          .filter((log: any) => !myId || log.worker_id === myId)
          .map((log: any) => ({
            id: log.id,
            title: `QC - ${log.product_name || "Order"}`,
            order: log.production_order_id,
            date: new Date(log.created_at).toLocaleDateString(),
            type: "qc" as const,
          }));
        setTaskHistory(relevant);
      } catch (err) {
        if (err instanceof AuthError) {
          toast({ title: err.message, variant: "destructive" });
        } else {
          toast({ title: "Failed to load history", variant: "destructive" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isAuthenticated, userRole, user]);

  const getTypeIcon = (type: string) => {
    return type === "task" ? (
      <CheckCircle className="w-4 h-4 text-success" />
    ) : (
      <FileText className="w-4 h-4 text-primary" />
    );
  };

  const getTypeBadge = (type: string) => {
    return type === "task" ? (
      <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success">Task</span>
    ) : (
      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">QC Log</span>
    );
  };

  // Group by date
  const groupedHistory = taskHistory.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, typeof taskHistory>);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      {/* Desktop Navigation */}
      <div className="hidden md:block">
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
      </div>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 glass-nav rounded-none px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">History</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav items={navItems} />
      </div>

      <main className="relative pt-20 md:pt-24 pb-24 md:pb-12 px-4 md:px-8 max-w-2xl mx-auto">
        <div className="hidden md:block mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground">Work History</h1>
          <p className="text-muted-foreground mt-1">Your QC submissions and tasks</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <GlassCard className="p-4 opacity-0 animate-fade-in-up stagger-1">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="text-xl font-bold">
                  {taskHistory.filter(t => t.type === "task").length}
                </p>
                <p className="text-xs text-muted-foreground">Tasks Completed</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4 opacity-0 animate-fade-in-up stagger-2">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xl font-bold">
                  {taskHistory.filter(t => t.type === "qc").length}
                </p>
                <p className="text-xs text-muted-foreground">QC Logs Submitted</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* History List */}
        <div className="space-y-6">
          {loading && (
            <GlassCard>
              <p className="text-muted-foreground">Loading history...</p>
            </GlassCard>
          )}

          {!loading && Object.entries(groupedHistory).length === 0 && (
            <GlassCard>
              <p className="text-muted-foreground">No history yet.</p>
            </GlassCard>
          )}

          {!loading &&
            Object.entries(groupedHistory).map(([date, items], groupIndex) => (
              <div
                key={date}
                className={cn("opacity-0 animate-fade-in-up", `stagger-${Math.min(groupIndex + 2, 5)}`)}
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <GlassCard key={item.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {getTypeIcon(item.type)}
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.id} • Order: {item.order}
                            </p>
                          </div>
                        </div>
                        {getTypeBadge(item.type)}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default WorkerHistory;
