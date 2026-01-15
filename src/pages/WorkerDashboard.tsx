import React, { useState, useEffect } from "react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { StatCard } from "@/components/ui/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  LogOut,
  Play,
  Check,
  AlertCircle,
  Wrench,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import AuthErrorDialog from "@/components/AuthErrorDialog";
import { apiFetch, AuthError } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { label: "Tasks", href: "/worker", icon: ClipboardList },
  { label: "QC Logs", href: "/worker/qc-logs", icon: CheckCircle2 },
  { label: "History", href: "/worker/history", icon: Clock },
  { label: "Profile", href: "/worker/profile", icon: User },
];

interface Task {
  id: string;
  title: string;
  order: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  progress: number;
  machine?: string;
}

const WorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated === false) {
      setAuthError("You need to be logged in to access the worker dashboard.");
      setShowAuthError(true);
      return;
    }
    if (isAuthenticated === true && userRole !== "worker") {
      setAuthError("You don't have permission to access the worker dashboard.");
      setShowAuthError(true);
      return;
    }
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== "worker") return;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const orders = await apiFetch("/production/my").catch(() => []);
        const mapped: Task[] = (orders || []).map((order: any) => {
          const progress =
            order.quantity_target && order.quantity_target > 0
              ? Math.min(
                  100,
                  Math.round(
                    ((order.quantity_completed || 0) / order.quantity_target) * 100
                  )
                )
              : 0;
          const status: Task["status"] =
            order.status === "completed"
              ? "completed"
              : order.status === "in-progress"
              ? "in-progress"
              : "pending";

          return {
            id: order.id,
            title: order.product_name || "Production Order",
            order: order.id,
            priority: "medium",
            status,
            progress,
            machine: order.machine || undefined,
          };
        });
        setTasks(mapped);
      } catch (err) {
        if (err instanceof AuthError) {
          setAuthError(err.message);
          setShowAuthError(true);
        } else {
          toast({ title: "Failed to load tasks", variant: "destructive" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [isAuthenticated, userRole]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  // Don't render content if not authenticated
  if (!isAuthenticated || userRole !== "worker") {
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

  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              progress:
                newStatus === "completed"
                  ? 100
                  : newStatus === "in-progress"
                  ? Math.max(task.progress, 10)
                  : task.progress,
            }
          : task
      )
    );
  };

  const updateProgress = (taskId: string, increment: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              progress: Math.min(100, Math.max(0, task.progress + increment)),
            }
          : task
      )
    );
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive";
      case "medium":
        return "bg-warning/20 text-warning";
      case "low":
        return "bg-success/20 text-success";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthErrorDialog
        open={showAuthError}
        onOpenChange={setShowAuthError}
        message={authError}
      />
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      {/* Desktop Floating Navigation */}
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
          <h1 className="text-lg font-semibold text-foreground">My Tasks</h1>
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

      {/* Main Content */}
      <main className="relative pt-20 md:pt-24 pb-24 md:pb-12 px-4 md:px-8 max-w-4xl mx-auto">
        {/* Header - Desktop only */}
        <div className="hidden md:block mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your assigned tasks and log progress
          </p>
        </div>

        {/* Mobile subtitle */}
        <p className="md:hidden text-muted-foreground mb-4 text-sm">
          Manage your assigned tasks
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatCard
            title="Pending"
            value={pendingCount}
            icon={Clock}
            className="opacity-0 animate-fade-in-up stagger-1"
          />
          <StatCard
            title="Active"
            value={inProgressCount}
            icon={Wrench}
            className="opacity-0 animate-fade-in-up stagger-2"
          />
          <StatCard
            title="Done"
            value={completedCount}
            icon={CheckCircle2}
            className="opacity-0 animate-fade-in-up stagger-3"
          />
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {loading && (
            <GlassCard>
              <p className="text-muted-foreground">Loading tasks...</p>
            </GlassCard>
          )}

          {!loading && tasks.length === 0 && (
            <GlassCard>
              <p className="text-muted-foreground">No assigned production orders yet.</p>
            </GlassCard>
          )}

          {!loading &&
            tasks.map((task, index) => (
              <GlassCard
                key={task.id}
                className={cn(
                  "opacity-0 animate-fade-in-up p-4 md:p-6",
                  `stagger-${Math.min(index + 2, 5)}`,
                  task.status === "completed" && "opacity-60"
                )}
              >
                {/* Task Header */}
                <div className="flex items-start justify-between gap-3 mb-3 md:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">{task.id}</span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          getPriorityColor(task.priority)
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-foreground truncate">
                      {task.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                      <span>Order: {task.order}</span>
                      {task.machine && <span>• {task.machine}</span>}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={cn(
                      "px-2 md:px-3 py-1 rounded-full text-xs font-medium shrink-0",
                      task.status === "completed"
                        ? "bg-success/20 text-success"
                        : task.status === "in-progress"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {task.status === "in-progress"
                      ? "Active"
                      : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2 md:h-3" />
                </div>

                {/* Actions - Large touch targets for mobile */}
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {task.status === "pending" && (
                    <Button
                      onClick={() => updateTaskStatus(task.id, "in-progress")}
                      className="flex-1 h-12 gap-2 text-sm"
                    >
                      <Play className="w-4 h-4" />
                      Start Task
                    </Button>
                  )}

                  {task.status === "in-progress" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => updateProgress(task.id, 10)}
                        className="flex-1 h-12 text-sm"
                      >
                        +10%
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateProgress(task.id, 25)}
                        className="flex-1 h-12 text-sm"
                      >
                        +25%
                      </Button>
                      <Button
                        onClick={() => updateTaskStatus(task.id, "completed")}
                        className="w-full md:flex-1 h-12 gap-2 text-sm bg-success hover:bg-success/90"
                      >
                        <Check className="w-4 h-4" />
                        Complete
                      </Button>
                    </>
                  )}

                  {task.status === "completed" && (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Task Completed</span>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
        </div>

        {/* Quick QC Log FAB - Mobile only */}
        <div className="fixed bottom-20 right-4 md:hidden">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg p-0"
            onClick={() => navigate("/worker/qc")}
          >
            <AlertCircle className="w-6 h-6" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;
