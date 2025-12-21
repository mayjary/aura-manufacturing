import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: NavItem[];
  className?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ items, className }) => {
  const location = useLocation();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "glass-bottom-nav safe-area-bottom",
        "flex items-center justify-around",
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
              "flex flex-col items-center justify-center py-2 px-4 min-w-[64px]",
              "transition-all duration-200",
              isActive
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className={cn("w-6 h-6 mb-1", isActive && "scale-110")} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export { BottomNav };
export type { NavItem };
