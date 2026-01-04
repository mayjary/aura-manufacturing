import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface LoginCardProps {
  role: "admin" | "client" | "worker";
  icon: LucideIcon;
  title: string;
  subtitle: string;
  redirectPath: string;
}

const LoginCard: React.FC<LoginCardProps> = ({
  role,
  icon: Icon,
  title,
  subtitle,
  redirectPath,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      // 🔑 Store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card w-full max-w-md p-8 animate-scale-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email / Username
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="text"
              placeholder="Enter your username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "pl-11 h-12 bg-secondary/50 border-border/50",
                "focus:bg-background focus:border-primary/50",
                "transition-all duration-300"
              )}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "pl-11 h-12 bg-secondary/50 border-border/50",
                "focus:bg-background focus:border-primary/50",
                "transition-all duration-300"
              )}
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full h-12 rounded-xl font-medium",
            "bg-primary hover:bg-primary/90",
            "transition-all duration-300",
            "group"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Forgot your password?{" "}
        <button className="text-primary hover:underline font-medium">
          Reset it here
        </button>
      </p>
    </div>
  );
};

export { LoginCard };
