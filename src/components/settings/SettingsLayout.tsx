import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SettingsLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  backPath: string;
  title: string;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  sidebarItems,
  activeSection,
  onSectionChange,
  backPath,
  title,
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleBack = () => {
    navigate(backPath);
  };

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-secondary/20 to-primary/5 pointer-events-none" />

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 glass-nav rounded-none px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          "md:hidden fixed top-16 right-0 bottom-0 z-40 w-64 glass-card rounded-l-2xl border-l border-glass-border transform transition-transform duration-300 ease-out",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="fixed left-6 top-6 bottom-6 w-64 glass-card rounded-2xl overflow-hidden z-40">
          <div className="p-6 h-full flex flex-col">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={handleBack}
              className="justify-start gap-2 text-muted-foreground hover:text-foreground mb-6 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            {/* Title */}
            <h2 className="text-xl font-semibold text-foreground mb-6">{title}</h2>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Theme Toggle */}
            <div className="pt-4 border-t border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </aside>

        {/* Desktop Content */}
        <main className="flex-1 ml-80 p-6">
          <div className="max-w-4xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Content */}
      <main className="md:hidden pt-20 pb-8 px-4">
        {children}
      </main>
    </div>
  );
};

export default SettingsLayout;
