import React from "react";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { StatCard } from "@/components/ui/stat-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  LogOut,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Orders", href: "/client", icon: Package },
  { label: "Deliveries", href: "/client/deliveries", icon: Truck },
  { label: "History", href: "/client/history", icon: Clock },
];

const orders = [
  {
    id: "ORD-2024-001",
    product: "Custom Engine Assembly x50",
    status: "In Production",
    progress: 75,
    eta: "Dec 28, 2024",
    stages: [
      { name: "Order Placed", completed: true },
      { name: "Materials Ready", completed: true },
      { name: "In Production", completed: false, current: true },
      { name: "Quality Check", completed: false },
      { name: "Shipped", completed: false },
    ],
  },
  {
    id: "ORD-2024-002",
    product: "Transmission Units x25",
    status: "Quality Check",
    progress: 90,
    eta: "Dec 24, 2024",
    stages: [
      { name: "Order Placed", completed: true },
      { name: "Materials Ready", completed: true },
      { name: "In Production", completed: true },
      { name: "Quality Check", completed: false, current: true },
      { name: "Shipped", completed: false },
    ],
  },
  {
    id: "ORD-2024-003",
    product: "Brake System Components x100",
    status: "Pending",
    progress: 15,
    eta: "Jan 5, 2025",
    stages: [
      { name: "Order Placed", completed: true },
      { name: "Materials Ready", completed: false, current: true },
      { name: "In Production", completed: false },
      { name: "Quality Check", completed: false },
      { name: "Shipped", completed: false },
    ],
  },
];

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-success/5 pointer-events-none" />

      {/* Floating Navigation */}
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

      {/* Main Content */}
      <main className="relative pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track your orders and deliveries in real-time
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Active Orders"
            value="3"
            icon={Package}
            className="opacity-0 animate-fade-in-up stagger-1"
          />
          <StatCard
            title="In Transit"
            value="1"
            icon={Truck}
            className="opacity-0 animate-fade-in-up stagger-2"
          />
          <StatCard
            title="Completed This Month"
            value="7"
            icon={CheckCircle}
            className="opacity-0 animate-fade-in-up stagger-3"
          />
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order, index) => (
            <GlassCard
              key={order.id}
              className={`opacity-0 animate-fade-in-up stagger-${index + 2}`}
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold">{order.id}</h3>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        order.status === "In Production"
                          ? "bg-primary/20 text-primary"
                          : order.status === "Quality Check"
                          ? "bg-warning/20 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{order.product}</p>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>ETA: {order.eta}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-semibold">{order.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <Progress value={order.progress} className="h-2 mb-6" />

              {/* Stages Timeline */}
              <div className="flex items-center justify-between">
                {order.stages.map((stage, stageIndex) => (
                  <div
                    key={stage.name}
                    className="flex flex-col items-center text-center flex-1"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                        stage.completed
                          ? "bg-success text-success-foreground"
                          : stage.current
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stage.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : stage.current ? (
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      ) : (
                        <span className="text-xs">{stageIndex + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        stage.completed || stage.current
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
