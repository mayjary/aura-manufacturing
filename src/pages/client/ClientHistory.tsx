import React from "react";
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

const navItems = [
  { label: "Orders", href: "/client", icon: Package },
  { label: "Deliveries", href: "/client/deliveries", icon: Truck },
  { label: "History", href: "/client/history", icon: Clock },
];

const completedOrders = [
  {
    id: "ORD-2024-010",
    product: "Engine Assembly x30",
    deliveredQty: 30,
    completedDate: "Dec 18, 2024",
    qcScore: 98,
  },
  {
    id: "ORD-2024-009",
    product: "Brake Components x75",
    deliveredQty: 75,
    completedDate: "Dec 15, 2024",
    qcScore: 96,
  },
  {
    id: "ORD-2024-008",
    product: "Transmission Units x20",
    deliveredQty: 20,
    completedDate: "Dec 10, 2024",
    qcScore: 100,
  },
  {
    id: "ORD-2024-007",
    product: "Suspension Kits x40",
    deliveredQty: 40,
    completedDate: "Dec 5, 2024",
    qcScore: 94,
  },
  {
    id: "ORD-2024-006",
    product: "Engine Assembly x25",
    deliveredQty: 25,
    completedDate: "Nov 28, 2024",
    qcScore: 97,
  },
  {
    id: "ORD-2024-005",
    product: "Exhaust Systems x50",
    deliveredQty: 50,
    completedDate: "Nov 20, 2024",
    qcScore: 99,
  },
];

const ClientHistory: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const getQcScoreColor = (score: number) => {
    if (score >= 98) return "text-success";
    if (score >= 90) return "text-primary";
    return "text-warning";
  };

  return (
    <div className="min-h-screen bg-background">
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
              {(completedOrders.reduce((acc, order) => acc + order.qcScore, 0) / completedOrders.length).toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">Avg QC Score</p>
          </GlassCard>
        </div>

        {/* Orders Table */}
        <GlassCard className="opacity-0 animate-fade-in-up stagger-2">
          <h2 className="text-lg font-semibold mb-4">Completed Orders</h2>
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
                {completedOrders.map((order, index) => (
                  <tr key={order.id} className="border-b border-border/20 last:border-0">
                    <td className="py-4 font-medium">{order.id}</td>
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
        </GlassCard>
      </main>
    </div>
  );
};

export default ClientHistory;
