import React, { useState } from "react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { FloatingNav } from "@/components/ui/floating-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  User,
  LogOut,
  Send,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const navItems = [
  { label: "Tasks", href: "/worker", icon: ClipboardList },
  { label: "QC Logs", href: "/worker/qc-logs", icon: CheckCircle2 },
  { label: "History", href: "/worker/history", icon: Clock },
  { label: "Profile", href: "/worker/profile", icon: User },
];

const orders = [
  { id: "PRD-001", name: "Engine Assembly A-Series" },
  { id: "PRD-002", name: "Transmission Unit T-200" },
  { id: "PRD-003", name: "Brake System Components" },
  { id: "PRD-004", name: "Suspension Kit SK-Pro" },
];

const qcChecklist = [
  { id: "visual", label: "Visual inspection passed" },
  { id: "dimensions", label: "Dimensions within tolerance" },
  { id: "function", label: "Functional test passed" },
  { id: "finish", label: "Surface finish acceptable" },
  { id: "packaging", label: "Packaging requirements met" },
];

const WorkerQCLogs: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState("");
  const [defectCount, setDefectCount] = useState("");
  const [notes, setNotes] = useState("");
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const handleCheckItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setCheckedItems(prev => [...prev, itemId]);
    } else {
      setCheckedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleSubmit = () => {
    if (!selectedOrder) {
      toast({ title: "Please select an order", variant: "destructive" });
      return;
    }
    
    if (checkedItems.length < 3) {
      toast({ title: "Please complete at least 3 checklist items", variant: "destructive" });
      return;
    }

    toast({
      title: "QC Log Submitted",
      description: `Log for ${selectedOrder} has been recorded.`,
    });

    // Reset form
    setSelectedOrder("");
    setDefectCount("");
    setNotes("");
    setCheckedItems([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />

      {/* Desktop Navigation */}
      <div className="hidden md:block">
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
      </div>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 glass-nav rounded-none px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">QC Log</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav items={navItems} />
      </div>

      <main className="relative pt-20 md:pt-24 pb-24 md:pb-12 px-4 md:px-8 max-w-xl mx-auto">
        <div className="hidden md:block mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground">Quality Control Log</h1>
          <p className="text-muted-foreground mt-1">Submit inspection results</p>
        </div>

        <GlassCard className="animate-fade-in-up">
          <div className="space-y-6">
            {/* Order Selection */}
            <div>
              <Label className="text-base font-medium">Select Order</Label>
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue placeholder="Choose an order..." />
                </SelectTrigger>
                <SelectContent>
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Checklist */}
            <div>
              <Label className="text-base font-medium mb-3 block">QC Checklist</Label>
              <div className="space-y-3">
                {qcChecklist.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20"
                  >
                    <Checkbox
                      id={item.id}
                      checked={checkedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleCheckItem(item.id, !!checked)}
                      className="h-5 w-5"
                    />
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Defect Count */}
            <div>
              <Label className="text-base font-medium">Defect Count</Label>
              <div className="flex items-center gap-3 mt-2">
                <Input
                  type="number"
                  min="0"
                  value={defectCount}
                  onChange={(e) => setDefectCount(e.target.value)}
                  placeholder="0"
                  className="h-12 text-lg"
                />
                <span className="text-muted-foreground">defects found</span>
              </div>
              {parseInt(defectCount) > 5 && (
                <div className="flex items-center gap-2 mt-2 text-warning text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>High defect count - review required</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label className="text-base font-medium">Additional Notes</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional observations..."
                className="mt-2 w-full h-24 p-3 rounded-xl bg-secondary/20 border border-border/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full h-14 text-lg gap-2"
            >
              <Send className="w-5 h-5" />
              Submit QC Log
            </Button>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default WorkerQCLogs;
