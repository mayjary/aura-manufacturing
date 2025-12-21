import React, { useState } from "react";
import { FloatingNav } from "@/components/ui/floating-nav";
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
  Pause,
  Check,
  AlertCircle,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Tasks", href: "/worker", icon: ClipboardList },
  { label: "QC Logs", href: "/worker/qc", icon: CheckCircle2 },
  { label: "History", href: "/worker/history", icon: Clock },
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

const initialTasks: Task[] = [
  {
    id: "TASK-001",
    title: "Assemble Engine Block A-Series",
    order: "PRD-001",
    priority: "high",
    status: "in-progress",
    progress: 65,
    machine: "CNC-01",
  },
  {
    id: "TASK-002",
    title: "Quality Check - Transmission Unit",
    order: "PRD-002",
    priority: "medium",
    status: "pending",
    progress: 0,
    machine: "QC Station 3",
  },
  {
    id: "TASK-003",
    title: "Package Brake Components",
    order: "PRD-003",
    priority: "low",
    status: "pending",
    progress: 0,
  },
  {
    id: "TASK-004",
    title: "Install Suspension Springs",
    order: "PRD-004",
    priority: "medium",
    status: "completed",
    progress: 100,
    machine: "Assembly Line B",
  },
];

const WorkerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

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
    <div className="min-h-screen bg-background dark">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-warning/5 pointer-events-none" />

      {/* Floating Navigation */}
      <FloatingNav
        items={navItems}
        rightContent={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        }
      />

      {/* Main Content */}
      <main className="relative pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your assigned tasks and log progress
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Pending"
            value={pendingCount}
            icon={Clock}
            className="opacity-0 animate-fade-in-up stagger-1"
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon={Wrench}
            className="opacity-0 animate-fade-in-up stagger-2"
          />
          <StatCard
            title="Completed"
            value={completedCount}
            icon={CheckCircle2}
            className="opacity-0 animate-fade-in-up stagger-3"
          />
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <GlassCard
              key={task.id}
              className={cn(
                "opacity-0 animate-fade-in-up",
                `stagger-${Math.min(index + 2, 5)}`,
                task.status === "completed" && "opacity-60"
              )}
            >
              {/* Task Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground">
                      {task.id}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        getPriorityColor(task.priority)
                      )}
                    >
                      {task.priority}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Order: {task.order}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  {task.machine && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Machine: {task.machine}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    task.status === "completed"
                      ? "bg-success/20 text-success"
                      : task.status === "in-progress"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {task.status === "in-progress"
                    ? "In Progress"
                    : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-3" />
              </div>

              {/* Actions - Large touch targets for mobile */}
              <div className="flex flex-wrap gap-3">
                {task.status === "pending" && (
                  <Button
                    onClick={() => updateTaskStatus(task.id, "in-progress")}
                    className="flex-1 min-w-[120px] h-12 gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Task
                  </Button>
                )}

                {task.status === "in-progress" && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => updateProgress(task.id, 10)}
                      className="flex-1 min-w-[100px] h-12"
                    >
                      +10%
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateProgress(task.id, 25)}
                      className="flex-1 min-w-[100px] h-12"
                    >
                      +25%
                    </Button>
                    <Button
                      onClick={() => updateTaskStatus(task.id, "completed")}
                      className="flex-1 min-w-[140px] h-12 gap-2 bg-success hover:bg-success/90"
                    >
                      <Check className="w-5 h-5" />
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

        {/* Quick QC Log Button - Fixed at bottom for mobile */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden">
          <Button
            size="lg"
            className="h-14 px-8 rounded-full shadow-lg gap-2"
            onClick={() => navigate("/worker/qc")}
          >
            <AlertCircle className="w-5 h-5" />
            Log QC Issue
          </Button>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;
