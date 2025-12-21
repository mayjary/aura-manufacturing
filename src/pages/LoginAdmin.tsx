import React from "react";
import { WavyBackground } from "@/components/ui/wavy-background";
import { LoginCard } from "@/components/LoginCard";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LoginAdmin: React.FC = () => {
  return (
    <WavyBackground
      className="w-full px-4"
      backgroundFill="#0f172a"
      waveOpacity={0.4}
      blur={12}
      speed="slow"
    >
      <div className="w-full flex flex-col items-center">
        <Link
          to="/"
          className="fixed top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors z-50"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <LoginCard
          role="admin"
          icon={Shield}
          title="Admin Login"
          subtitle="Access the management dashboard"
          redirectPath="/admin"
        />
      </div>
    </WavyBackground>
  );
};

export default LoginAdmin;
