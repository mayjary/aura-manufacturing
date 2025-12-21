import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface FloatingNavProps {
  items: NavItem[];
  rightContent?: React.ReactNode;
  className?: string;
}

const FloatingNav: React.FC<FloatingNavProps> = ({
  items,
  rightContent,
  className,
}) => {
  const location = useLocation();

  return (
    <nav
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50",
        "glass-nav flex items-center gap-1",
        className
      )}
    >
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{item.label}</span>
          </Link>
        );
      })}
      {rightContent && (
        <div className="ml-2 pl-2 border-l border-border/30">{rightContent}</div>
      )}
    </nav>
  );
};

export { FloatingNav };
export type { NavItem };
