import React from "react";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Truck,
  Clock,
  LogOut,
  Settings,
  Calendar,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Orders", href: "/client", icon: Package },
  { label: "Deliveries", href: "/client/deliveries", icon: Truck },
  { label: "History", href: "/client/history", icon: Clock },
];

const deliveries = [
  {
    id: "DEL-2024-001",
    order: "ORD-2024-002",
    product: "Transmission Units x25",
    status: "in-transit",
    progress: 65,
    eta: "Dec 24, 2024",
    carrier: "FastFreight Logistics",
    tracking: "FF-789456123",
    stages: [
      { name: "Shipped", completed: true, date: "Dec 21" },
      { name: "In Transit", completed: false, current: true, date: "Dec 22" },
      { name: "Out for Delivery", completed: false, date: "Dec 24" },
      { name: "Delivered", completed: false, date: "—" },
    ],
  },
  {
    id: "DEL-2024-002",
    order: "ORD-2024-004",
    product: "Suspension Kits x15",
    status: "shipped",
    progress: 25,
    eta: "Dec 28, 2024",
    carrier: "Prime Shipping",
    tracking: "PS-456789012",
    stages: [
      { name: "Shipped", completed: true, date: "Dec 22" },
      { name: "In Transit", completed: false, current: true, date: "—" },
      { name: "Out for Delivery", completed: false, date: "—" },
      { name: "Delivered", completed: false, date: "—" },
    ],
  },
];

const upcomingDeliveries = [
  { order: "ORD-2024-001", product: "Engine Assembly x50", expectedShip: "Dec 26, 2024" },
  { order: "ORD-2024-003", product: "Brake Components x100", expectedShip: "Jan 2, 2025" },
];

const ClientDeliveries: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
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
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground">Deliveries</h1>
          <p className="text-muted-foreground mt-1">Track your shipments in real-time</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Deliveries */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Active Shipments</h2>
            {deliveries.map((delivery, index) => (
              <GlassCard
                key={delivery.id}
                className={cn("opacity-0 animate-fade-in-up", `stagger-${index + 1}`)}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">{delivery.id}</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary capitalize">
                        {delivery.status.replace("-", " ")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{delivery.product}</h3>
                    <p className="text-sm text-muted-foreground">Order: {delivery.order}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>ETA: {delivery.eta}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{delivery.carrier}</p>
                    <p className="text-xs font-mono text-primary">{delivery.tracking}</p>
                  </div>
                </div>

                <Progress value={delivery.progress} className="h-2 mb-4" />

                <div className="flex items-center justify-between">
                  {delivery.stages.map((stage, stageIndex) => (
                    <div key={stage.name} className="flex flex-col items-center text-center flex-1">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center mb-2",
                          stage.completed
                            ? "bg-success text-success-foreground"
                            : stage.current
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {stage.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : stage.current ? (
                          <Truck className="w-4 h-4" />
                        ) : stageIndex === delivery.stages.length - 1 ? (
                          <MapPin className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">{stageIndex + 1}</span>
                        )}
                      </div>
                      <span className={cn(
                        "text-xs",
                        stage.completed || stage.current
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      )}>
                        {stage.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{stage.date}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Upcoming */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Upcoming Shipments</h2>
            <GlassCard className="opacity-0 animate-fade-in-up stagger-3">
              <div className="space-y-4">
                {upcomingDeliveries.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-secondary/30 border-l-2 border-muted"
                  >
                    <p className="font-medium text-sm">{item.product}</p>
                    <p className="text-xs text-muted-foreground mt-1">Order: {item.order}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Expected: {item.expectedShip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="opacity-0 animate-fade-in-up stagger-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Truck className="w-5 h-5 text-success" />
                </div>
                <h3 className="font-semibold">Delivery Stats</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Shipments</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivered This Month</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">On-Time Rate</span>
                  <span className="font-medium text-success">96%</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDeliveries;
