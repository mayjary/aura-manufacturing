import React from "react";
import { Link } from "react-router-dom";
import { WavyBackground } from "@/components/ui/wavy-background";
import { GlassCard } from "@/components/ui/glass-card";
import { Shield, Users, Wrench, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const roleCards = [
  {
    role: "admin",
    icon: Shield,
    title: "Admin / Manager",
    description: "Full access to production, inventory, and analytics",
    path: "/login/admin",
    color: "from-cyan-500 to-blue-600",
  },
  {
    role: "client",
    icon: Users,
    title: "Client",
    description: "Track orders and view delivery status",
    path: "/login/client",
    color: "from-emerald-500 to-teal-600",
  },
  {
    role: "worker",
    icon: Wrench,
    title: "Worker / Operator",
    description: "Manage tasks and log production progress",
    path: "/login/worker",
    color: "from-orange-500 to-red-500",
  },
];

const Login: React.FC = () => {
  return (
    <WavyBackground
      className="w-full px-4"
      backgroundFill="#0f172a"
      waveOpacity={0.4}
      blur={12}
      speed="slow"
    >
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Smart Manufacturing
          </h1>
          <p className="text-lg text-white/70">
            Select your role to continue
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {roleCards.map((card, index) => (
            <Link
              key={card.role}
              to={card.path}
              className={cn(
                "group block opacity-0 animate-fade-in-up",
                `stagger-${index + 1}`
              )}
            >
              <GlassCard className="h-full hover:scale-105 transition-all duration-500 cursor-pointer border-white/10">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                      "bg-gradient-to-br",
                      card.color
                    )}
                  >
                    <card.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {card.title}
                  </h2>
                  <p className="text-sm text-white/60 mb-4">
                    {card.description}
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </WavyBackground>
  );
};

export default Login;
