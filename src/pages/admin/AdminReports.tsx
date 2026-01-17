import React, { useState, useEffect } from "react";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard,
  Factory,
  Boxes,
  ClipboardCheck,
  FileText,
  LogOut,
  Settings,
  Download,
  FileSpreadsheet,
  TrendingUp,
  Package,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { apiFetch, AuthError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { OperationsChatbot } from "@/components/chatbot/OperationsChatbot";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Production", href: "/admin/production", icon: Factory },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Quality", href: "/admin/quality", icon: ClipboardCheck },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

interface SummaryStats {
  totalOrders: number;
  efficiency: number;
  materialCost: number;
  avgQcScore: number;
}

interface ReportCardData {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: Array<{ label: string; value: string }>;
}

const reportCardTemplates: Array<{
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: "production",
    title: "Production Summary",
    description: "Overview of production orders, completion rates, and worker efficiency",
    icon: Factory,
  },
  {
    id: "inventory",
    title: "Inventory Usage",
    description: "Material consumption, stock levels, and reorder analytics",
    icon: Boxes,
  },
  {
    id: "quality",
    title: "Quality Trends",
    description: "QC scores, defect analysis, and quality improvement metrics",
    icon: ClipboardCheck,
  },
];

const AdminReports: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState("2024-12");
  const [loading, setLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    totalOrders: 0,
    efficiency: 0,
    materialCost: 0,
    avgQcScore: 0,
  });
  const [reportCards, setReportCards] = useState<ReportCardData[]>([]);
  const [project_id, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") return;
    const stored = localStorage.getItem("project_id");
    if (stored) {
      setProjectId(stored);
    }
  }, [isAuthenticated, userRole]);

  // Fetch report data from backend
  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") return;

    const fetchReportData = async () => {
      setLoading(true);
      try {
        // Try to fetch all report data from a single endpoint first
        let allReportsData = null;
        try {
          allReportsData = await apiFetch(`/reports?month=${selectedMonth}`);
        } catch {
          // If single endpoint doesn't exist, fetch from individual endpoints
        }

        let summaryData, productionData, inventoryData, qualityData;

        if (allReportsData) {
          // Use data from single endpoint
          summaryData = allReportsData.summary || allReportsData;
          productionData = allReportsData.production || allReportsData;
          inventoryData = allReportsData.inventory || allReportsData;
          qualityData = allReportsData.quality || allReportsData;
        } else {
          // Fetch from individual endpoints
          summaryData = await apiFetch(`/reports/summary?month=${selectedMonth}`).catch(() => null);
          productionData = await apiFetch(`/reports/production?month=${selectedMonth}`).catch(() => null);
          inventoryData = await apiFetch(`/reports/inventory?month=${selectedMonth}`).catch(() => null);
          qualityData = await apiFetch(`/reports/quality?month=${selectedMonth}`).catch(() => null);
        }

        // Set summary stats
        if (summaryData) {
          setSummaryStats({
            totalOrders: summaryData.total_orders || 0,
            efficiency: summaryData.efficiency || 0,
            materialCost: summaryData.material_cost || 0,
            avgQcScore: summaryData.avg_qc_score || 0,
          });
        }

        // Build report cards with real data
        const cards: ReportCardData[] = reportCardTemplates.map((template) => {
          const Icon = template.icon;
          let stats: Array<{ label: string; value: string }> = [];

          if (template.id === "production" && productionData) {
            stats = [
              { label: "Orders Completed", value: String(productionData.completed_orders || productionData.orders_completed || 0) },
              { label: "On-Time Rate", value: `${productionData.on_time_rate || productionData.completion_rate || 0}%` },
              { label: "Avg Cycle Time", value: `${productionData.avg_cycle_time_days || productionData.avg_cycle_time || 0} days` },
            ];
          } else if (template.id === "inventory" && inventoryData) {
            stats = [
              { label: "Materials Used", value: String(inventoryData.materials_used_count || inventoryData.materials_used || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") },
              { label: "Low Stock Items", value: String(inventoryData.low_stock_count || inventoryData.low_stock_items || 0) },
              { label: "Reorders Made", value: String(inventoryData.reorders_made || 0) },
            ];
          } else if (template.id === "quality" && qualityData) {
            stats = [
              { label: "Avg QC Score", value: String(qualityData.avg_qc_score || 0) },
              { label: "Defect Rate", value: `${qualityData.defect_rate || 0}%` },
              { label: "Rework Rate", value: `${qualityData.rework_rate || 0}%` },
            ];
          } else {
            // Fallback to default values if data not available
            if (template.id === "production") {
              stats = [
                { label: "Orders Completed", value: "0" },
                { label: "On-Time Rate", value: "0%" },
                { label: "Avg Cycle Time", value: "0 days" },
              ];
            } else if (template.id === "inventory") {
              stats = [
                { label: "Materials Used", value: "0" },
                { label: "Low Stock Items", value: "0" },
                { label: "Reorders Made", value: "0" },
              ];
            } else if (template.id === "quality") {
              stats = [
                { label: "Avg QC Score", value: "0" },
                { label: "Defect Rate", value: "0%" },
                { label: "Rework Rate", value: "0%" },
              ];
            }
          }

          return {
            ...template,
            icon: Icon,
            stats,
          };
        });

        setReportCards(cards);
      } catch (err) {
        if (err instanceof AuthError) {
          toast({
            title: "Authentication error",
            description: err.message,
            variant: "destructive",
          });
        } else {
          console.error("Failed to fetch report data", err);
          toast({
            title: "Failed to load reports",
            description: "Could not fetch report data from the server",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedMonth, isAuthenticated, userRole]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/");
  };

  const handleExport = async (format: "pdf" | "excel", reportId: string) => {
    try {
      // Validate month format (YYYY-MM)
      if (!/^\d{4}-\d{2}$/.test(selectedMonth)) {
        toast({
          title: "Invalid month format",
          description: "Please select a valid month",
          variant: "destructive",
        });
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to export reports",
          variant: "destructive",
        });
        return;
      }

      // Build the export URL - matches backend route structure
      const API_BASE = "http://localhost:5001";
      const exportType = format === "pdf" ? "pdf" : "excel";
      const url = `${API_BASE}/reports/export/${exportType}?month=${selectedMonth}&type=${reportId}`;

      // Fetch with authentication
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Export failed" }));
        throw new Error(error.message || "Export failed");
      }

      // Get blob and trigger download
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `report-${reportId}-${selectedMonth}.${format === "pdf" ? "pdf" : "xlsx"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast({
        title: "Export successful",
        description: `Downloaded ${format.toUpperCase()} report`,
      });
    } catch (err: any) {
      console.error("Export error:", err);
      toast({
        title: "Export failed",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">Generate and export production reports</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48 glass-card border-glass-border">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-12">December 2024</SelectItem>
                <SelectItem value="2024-11">November 2024</SelectItem>
                <SelectItem value="2024-10">October 2024</SelectItem>
                <SelectItem value="2024-09">September 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-4 opacity-0 animate-fade-in-up stagger-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold">{summaryStats.totalOrders}</p>
                )}
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4 opacity-0 animate-fade-in-up stagger-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold">{summaryStats.efficiency}%</p>
                )}
                <p className="text-xs text-muted-foreground">Efficiency</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4 opacity-0 animate-fade-in-up stagger-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Boxes className="w-5 h-5 text-warning" />
              </div>
              <div>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold">
                    ${summaryStats.materialCost >= 1000 
                      ? `${(summaryStats.materialCost / 1000).toFixed(0)}K` 
                      : summaryStats.materialCost.toFixed(0)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Material Cost</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4 opacity-0 animate-fade-in-up stagger-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold">{summaryStats.avgQcScore.toFixed(1)}</p>
                )}
                <p className="text-xs text-muted-foreground">Avg QC Score</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Report Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {loading && reportCards.length === 0 ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <GlassCard key={index} className="opacity-0 animate-fade-in-up">
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              </GlassCard>
            ))
          ) : (
            reportCards.map((report, index) => {
              const Icon = report.icon;
              return (
                <GlassCard 
                  key={report.id}
                  className={`opacity-0 animate-fade-in-up stagger-${index + 2}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{report.title}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6">{report.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    {report.stats.map((stat, statIndex) => (
                      <div key={statIndex} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{stat.label}</span>
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <span className="font-medium">{stat.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => handleExport("pdf", report.id)}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => handleExport("excel", report.id)}
                      disabled={loading}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel
                    </Button>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>

        {/* Export All */}
        <GlassCard className="mt-6 opacity-0 animate-fade-in-up stagger-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Complete Monthly Report</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Download all reports bundled into a single comprehensive document
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="gap-2" onClick={() => handleExport("pdf", "complete")}>
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => handleExport("excel", "complete")}>
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </GlassCard>
        <OperationsChatbot projectId={project_id} />
      </main>
    </div>
  );
};

export default AdminReports;
