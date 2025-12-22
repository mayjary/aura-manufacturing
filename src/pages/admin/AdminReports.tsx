import React, { useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Production", href: "/admin/production", icon: Factory },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Quality", href: "/admin/quality", icon: ClipboardCheck },
  { label: "Reports", href: "/admin/reports", icon: FileText },
];

const reportCards = [
  {
    id: "production",
    title: "Production Summary",
    description: "Overview of production orders, completion rates, and worker efficiency",
    icon: Factory,
    stats: [
      { label: "Orders Completed", value: "24" },
      { label: "On-Time Rate", value: "92%" },
      { label: "Avg Cycle Time", value: "3.2 days" },
    ],
  },
  {
    id: "inventory",
    title: "Inventory Usage",
    description: "Material consumption, stock levels, and reorder analytics",
    icon: Boxes,
    stats: [
      { label: "Materials Used", value: "15,420" },
      { label: "Low Stock Items", value: "3" },
      { label: "Reorders Made", value: "8" },
    ],
  },
  {
    id: "quality",
    title: "Quality Trends",
    description: "QC scores, defect analysis, and quality improvement metrics",
    icon: ClipboardCheck,
    stats: [
      { label: "Avg QC Score", value: "94.2" },
      { label: "Defect Rate", value: "1.8%" },
      { label: "Rework Rate", value: "2.1%" },
    ],
  },
];

const AdminReports: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState("december-2024");

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleExport = (format: "pdf" | "excel", reportId: string) => {
    toast({
      title: `Exporting ${reportId} report`,
      description: `Generating ${format.toUpperCase()} file...`,
    });
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
                <SelectItem value="december-2024">December 2024</SelectItem>
                <SelectItem value="november-2024">November 2024</SelectItem>
                <SelectItem value="october-2024">October 2024</SelectItem>
                <SelectItem value="september-2024">September 2024</SelectItem>
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
                <p className="text-2xl font-bold">156</p>
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
                <p className="text-2xl font-bold">94%</p>
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
                <p className="text-2xl font-bold">$42K</p>
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
                <p className="text-2xl font-bold">98.5</p>
                <p className="text-xs text-muted-foreground">Avg QC Score</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Report Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {reportCards.map((report, index) => {
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
                      <span className="font-medium">{stat.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleExport("pdf", report.id)}
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleExport("excel", report.id)}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel
                  </Button>
                </div>
              </GlassCard>
            );
          })}
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
      </main>
    </div>
  );
};

export default AdminReports;
