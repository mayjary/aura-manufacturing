import React, { useState } from "react";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Key,
  Bell,
  User,
  Copy,
  Eye,
  EyeOff,
  Package,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const sidebarItems = [
  { id: "access", label: "Project Access", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: User },
];

const ClientSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState("access");
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState("CLT-8472-PASS");
  const [newPasscode, setNewPasscode] = useState("");
  
  const [notifications, setNotifications] = useState({
    deliveryUpdates: true,
    orderStatus: true,
    qualityReports: false,
    emailDigest: true,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleChangePasscode = () => {
    if (newPasscode.length >= 6) {
      setPasscode(newPasscode);
      setNewPasscode("");
      toast({ title: "Passcode updated successfully" });
    } else {
      toast({ title: "Passcode must be at least 6 characters", variant: "destructive" });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "access":
        return (
          <div className="space-y-4 animate-fade-in-up">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-6">Project Access</h3>
              <div className="space-y-6">
                <div>
                  <Label>Project Code</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value="MFG-2024-X7K9"
                      readOnly
                      className="font-mono bg-secondary/30"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard("MFG-2024-X7K9")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This code identifies your project with the manufacturer.
                  </p>
                </div>
                
                <div>
                  <Label>Current Passcode</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type={showPasscode ? "text" : "password"}
                      value={passcode}
                      readOnly
                      className="font-mono bg-secondary/30"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPasscode(!showPasscode)}
                    >
                      {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(passcode)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/30">
                  <Label>Change Passcode</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="password"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="Enter new passcode"
                    />
                    <Button onClick={handleChangePasscode}>
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Product Summary</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Active Orders</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Products in Production</span>
                  <span className="font-medium">175 units</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Completed This Month</span>
                  <span className="font-medium">7 orders</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-success" />
                <h4 className="font-semibold">Quality Summary</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Average QC Score</span>
                  <span className="font-medium text-success">98.5 / 100</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Defect Rate</span>
                  <span className="font-medium">1.2%</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">On-Time Delivery Rate</span>
                  <span className="font-medium text-success">96%</span>
                </div>
              </div>
            </GlassCard>
          </div>
        );

      case "notifications":
        return (
          <GlassCard className="animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delivery Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified when your order ships</p>
                </div>
                <Switch
                  checked={notifications.deliveryUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, deliveryUpdates: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Status Changes</p>
                  <p className="text-sm text-muted-foreground">Updates when order moves to next stage</p>
                </div>
                <Switch
                  checked={notifications.orderStatus}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, orderStatus: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Quality Reports</p>
                  <p className="text-sm text-muted-foreground">Receive QC reports after completion</p>
                </div>
                <Switch
                  checked={notifications.qualityReports}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, qualityReports: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Email Digest</p>
                  <p className="text-sm text-muted-foreground">Summary of all order activities</p>
                </div>
                <Switch
                  checked={notifications.emailDigest}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, emailDigest: checked }))
                  }
                />
              </div>
              <Button className="mt-4">Save Preferences</Button>
            </div>
          </GlassCard>
        );

      case "account":
        return (
          <GlassCard className="animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-6">Account Information</h3>
            <div className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input defaultValue="Acme Industries" className="mt-2" />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input defaultValue="orders@acme.com" className="mt-2" />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input defaultValue="+1 (555) 123-4567" className="mt-2" />
              </div>
              <div>
                <Label>Billing Address</Label>
                <Input defaultValue="123 Business Ave, Suite 100" className="mt-2" />
              </div>
              <Button className="mt-4">Update Account</Button>
            </div>
          </GlassCard>
        );

      default:
        return null;
    }
  };

  return (
    <SettingsLayout
      sidebarItems={sidebarItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      backPath="/client"
      title="Client Settings"
    >
      {renderContent()}
    </SettingsLayout>
  );
};

export default ClientSettings;
