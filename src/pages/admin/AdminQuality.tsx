import React, { useState, useEffect } from "react";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { StatCard } from "@/components/ui/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LayoutDashboard,
  Factory,
  Boxes,
  ClipboardCheck,
  FileText,
  LogOut,
  Settings,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Repeat,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { apiFetch, AuthError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import AuthErrorDialog from "@/components/AuthErrorDialog";
import WorkerQualityTable from "@/components/WorkerQualityTable";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { OperationsChatbot } from "@/components/chatbot/OperationsChatbot";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Production", href: "/admin/production", icon: Factory },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Quality", href: "/admin/quality", icon: ClipboardCheck },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

const defectTrend = [
  { week: "Week 48", rate: 2.1 },
  { week: "Week 49", rate: 1.8 },
  { week: "Week 50", rate: 2.5 },
  { week: "Week 51", rate: 1.9 },
];

interface QCLog {
  id: string;
  production_order_id: string;
  defect_count: number;
  qc_status?: string;
  created_at: string;
  notes?: string;
}

const AdminQuality: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [qcLogs, setQcLogs] = useState<QCLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageScore: 0,
    defectRate: 0,
    reworkCount: 0,
  });
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [workerPerformanceData, setWorkerPerformanceData] = useState<any[]>([]);
  const [productionOutputData, setProductionOutputData] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
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
      setAuthError("You need to be logged in to access quality control.");
      setShowAuthError(true);
      return;
    }
    if (isAuthenticated === true && userRole !== "admin") {
      setAuthError("You don't have permission to access quality control.");
      setShowAuthError(true);
      return;
    }
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") return;

    const fetchQCLogs = async () => {
      try {
        const logs = await apiFetch("/qc/logs");
        setQcLogs(logs || []);

        // Calculate stats
        if (logs && logs.length > 0) {
          const totalDefects = logs.reduce((sum: number, log: QCLog) => sum + (log.defect_count || 0), 0);
          const avgDefects = totalDefects / logs.length;
          const reworkCount = logs.filter((log: QCLog) => log.qc_status === "warning" || log.qc_status === "fail").length;
          
          // Calculate score (assuming max 100, deducting points for defects)
          const avgScore = Math.max(0, 100 - (avgDefects * 2));
          
          setStats({
            averageScore: Math.round(avgScore * 10) / 10,
            defectRate: Math.round((avgDefects / 10) * 100 * 10) / 10, // Assuming 10 units per order
            reworkCount,
          });
        }
      } catch (err) {
        if (err instanceof AuthError) {
          setAuthError(err.message);
          setShowAuthError(true);
        } else {
          console.error("Failed to fetch QC logs", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQCLogs();
  }, [isAuthenticated, userRole]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const fetchAnalytics = async () => {
    if (!analyticsOpen) return;

    setAnalyticsLoading(true);
    try {
      const [workerData, productionData] = await Promise.all([
        apiFetch("/analytics/worker-performance"),
        apiFetch("/analytics/production-output"),
      ]);
      setWorkerPerformanceData(workerData || []);
      setProductionOutputData(productionData || []);
    } catch (err) {
      if (err instanceof AuthError) {
        setAuthError(err.message);
        setShowAuthError(true);
      } else {
        console.error("Failed to fetch analytics", err);
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (analyticsOpen && isAuthenticated && userRole === "admin") {
      fetchAnalytics();
    }
  }, [analyticsOpen, isAuthenticated, userRole]);

  const getStatusFromLog = (log: QCLog): string => {
    if (log.qc_status) {
      if (log.qc_status === "pass") return "passed";
      if (log.qc_status === "fail") return "failed";
      if (log.qc_status === "warning") return "rework";
      return log.qc_status;
    }
    // Fallback: determine from defect count
    if (log.defect_count === 0) return "passed";
    if (log.defect_count > 5) return "failed";
    if (log.defect_count >= 3) return "rework";
    return "passed";
  };

  const calculateScore = (log: QCLog): number => {
    // Simple scoring: 100 - (defects * 2)
    return Math.max(0, Math.min(100, 100 - (log.defect_count || 0) * 2));
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "rework":
        return <Repeat className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-success/20 text-success capitalize">{status}</span>;
      case "failed":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive capitalize">{status}</span>;
      case "rework":
        return <span className="px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning capitalize">{status}</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground capitalize">{status}</span>;
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
        <div className="mb-8 animate-fade-in-up flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Quality Control</h1>
            <p className="text-muted-foreground mt-1">Monitor quality metrics and inspection results</p>
          </div>
          <Button onClick={() => setAnalyticsOpen(true)} className="gap-2">
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="QC Score"
            value={stats.averageScore.toFixed(1)}
            subtitle="Average"
            icon={ClipboardCheck}
            className="opacity-0 animate-fade-in-up stagger-1"
          />
          <StatCard
            title="Defect Rate"
            value={`${stats.defectRate}%`}
            subtitle="Average"
            icon={AlertTriangle}
            className="opacity-0 animate-fade-in-up stagger-2"
          />
          <StatCard
            title="Rework Count"
            value={stats.reworkCount.toString()}
            subtitle="Total"
            icon={Repeat}
            className="opacity-0 animate-fade-in-up stagger-3"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* QC Logs Table */}
          <GlassCard className="lg:col-span-2 opacity-0 animate-fade-in-up stagger-2">
            <h3 className="text-lg font-semibold mb-4">Recent QC Logs</h3>
            {loading ? (
              <p className="text-muted-foreground">Loading QC logs...</p>
            ) : qcLogs.length === 0 ? (
              <p className="text-muted-foreground">No QC logs found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/30">
                      <th className="pb-3 font-medium">Order</th>
                      <th className="pb-3 font-medium">Defects</th>
                      <th className="pb-3 font-medium">Score</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qcLogs.map((log) => {
                      const status = getStatusFromLog(log);
                      const score = calculateScore(log);
                      return (
                        <tr key={log.id} className="border-b border-border/20 last:border-0">
                          <td className="py-4 font-medium">{log.production_order_id || "N/A"}</td>
                          <td className="py-4">
                            <span className={cn(
                              log.defect_count > 5 && "text-destructive",
                              log.defect_count > 0 && log.defect_count <= 5 && "text-warning",
                              log.defect_count === 0 && "text-success"
                            )}>
                              {log.defect_count || 0}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={cn(
                              "font-medium",
                              score >= 90 && "text-success",
                              score >= 80 && score < 90 && "text-warning",
                              score < 80 && "text-destructive"
                            )}>
                              {score}/100
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status)}
                              {getStatusBadge(status)}
                            </div>
                          </td>
                          <td className="py-4 text-muted-foreground text-sm">
                            {formatDate(log.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          {/* Defect Trend */}
          <GlassCard className="opacity-0 animate-fade-in-up stagger-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingDown className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">Defect Trend</h3>
            </div>
            
            <div className="space-y-4">
              {defectTrend.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.week}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 bg-primary/20 rounded-full"
                      style={{ width: `${item.rate * 30}px` }}
                    >
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(item.rate / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{item.rate}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-lg bg-success/10 text-sm">
              <p className="text-success font-medium">↓ 12% improvement</p>
              <p className="text-muted-foreground mt-1">compared to last month</p>
            </div>
          </GlassCard>
        </div>

        {/* Research-backed Worker Quality Comparison Section */}
        <div className="mt-8 opacity-0 animate-fade-in-up stagger-4">
          <WorkerQualityTable />
        </div>
      </main>

      {/* Analytics Modal */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analytics Dashboard</DialogTitle>
            <DialogDescription>
              Compare worker performance and production output over the last 30 days
            </DialogDescription>
          </DialogHeader>

          {analyticsLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          ) : (
            <div className="space-y-8 mt-4">
              {/* Worker Performance Chart */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Worker Performance</h3>
                {workerPerformanceData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No worker performance data available</p>
                ) : (
                  <ChartContainer
                    config={{
                      units: {
                        label: "Units Completed",
                        color: "hsl(var(--primary))",
                      },
                      score: {
                        label: "Avg QC Score",
                        color: "hsl(var(--success))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <BarChart data={workerPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="worker_username"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis yAxisId="left" label={{ value: "Units Completed", angle: -90, position: "insideLeft" }} />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: "Avg QC Score", angle: 90, position: "insideRight" }}
                        domain={[0, 100]}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar yAxisId="left" dataKey="total_units_completed" fill="hsl(var(--primary))" name="Units Completed" />
                      <Bar yAxisId="right" dataKey="avg_worker_score" fill="hsl(var(--success))" name="Avg QC Score" />
                    </BarChart>
                  </ChartContainer>
                )}
              </GlassCard>

              {/* Production Output Chart */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Production Output (Last 30 Days)</h3>
                {productionOutputData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No production output data available</p>
                ) : (
                  <ChartContainer
                    config={{
                      units: {
                        label: "Units Produced",
                        color: "hsl(var(--primary))",
                      },
                    }}
                    className="h-[400px]"
                  >
                    <LineChart data={productionOutputData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                        fontSize={12}
                      />
                      <YAxis label={{ value: "Units Produced", angle: -90, position: "insideLeft" }} />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="daily_units_produced"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Units Produced"
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </GlassCard>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <OperationsChatbot projectId={project_id} />

    </div>
  );
};

export default AdminQuality;
