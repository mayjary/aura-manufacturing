import React, { useState, useEffect } from "react";
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
import { apiFetch } from "@/lib/api";

const sidebarItems = [
  { id: "access", label: "Project Access", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "account", label: "Account", icon: User },
];

const ClientSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState("access");
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [notifications, setNotifications] = useState({
    deliveryUpdates: true,
    orderStatus: true,
    qualityReports: false,
    emailDigest: true,
  });

  const [accountInfo, setAccountInfo] = useState({
    companyName: "",
    contactEmail: "",
    phoneNumber: "",
    billingAddress: "",
  });

  const [stats, setStats] = useState({
    activeOrders: 0,
    productsInProduction: 0,
    completedThisMonth: 0,
    averageQCScore: 0,
    defectRate: 0,
    onTimeDeliveryRate: 0,
  });

  // Fetch access codes and project info
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get project ID (should come from user context in real app)
        const storedProjectId = localStorage.getItem("project_id") || "1";
        setProjectId(storedProjectId);

        // Fetch access codes
        const accessData = await apiFetch(`/access-codes?project_id=${storedProjectId}`).catch(() => null);
        if (accessData) {
          setProjectCode(accessData.project_code || "");
          setPasscode(accessData.client_passcode || "");
        }

        // TODO: Fetch account info, notifications, and stats when backend routes are created
        // For now, use defaults
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleChangePasscode = async () => {
    if (newPasscode.length < 6) {
      toast({ title: "Passcode must be at least 6 characters", variant: "destructive" });
      return;
    }

    try {
      // TODO: Implement backend route for changing passcode
      // For now, just update locally
      setPasscode(newPasscode);
      setNewPasscode("");
      toast({ title: "Passcode updated (backend route not implemented yet)" });
    } catch (err: any) {
      toast({ title: "Failed to update passcode", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      // TODO: Implement backend route for saving notifications
      toast({ title: "Notification preferences saved (backend route not implemented yet)" });
    } catch (err: any) {
      toast({ title: "Failed to save preferences", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateAccount = async () => {
    try {
      // TODO: Implement backend route for updating account
      toast({ title: "Account updated (backend route not implemented yet)" });
    } catch (err: any) {
      toast({ title: "Failed to update account", description: err.message, variant: "destructive" });
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
                      value={projectCode || "Loading..."}
                      readOnly
                      className="font-mono bg-secondary/30"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(projectCode)}
                      disabled={!projectCode}
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
                  <span className="font-medium">{stats.activeOrders || 0}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Products in Production</span>
                  <span className="font-medium">{stats.productsInProduction || 0} units</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Completed This Month</span>
                  <span className="font-medium">{stats.completedThisMonth || 0} orders</span>
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
                  <span className="font-medium text-success">
                    {stats.averageQCScore > 0 ? `${stats.averageQCScore} / 100` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Defect Rate</span>
                  <span className="font-medium">
                    {stats.defectRate > 0 ? `${stats.defectRate}%` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">On-Time Delivery Rate</span>
                  <span className="font-medium text-success">
                    {stats.onTimeDeliveryRate > 0 ? `${stats.onTimeDeliveryRate}%` : "N/A"}
                  </span>
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
              <Button className="mt-4" onClick={handleSaveNotifications}>Save Preferences</Button>
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
                <Input 
                  value={accountInfo.companyName}
                  onChange={(e) => setAccountInfo({ ...accountInfo, companyName: e.target.value })}
                  placeholder="Acme Industries"
                  className="mt-2" 
                />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input 
                  value={accountInfo.contactEmail}
                  onChange={(e) => setAccountInfo({ ...accountInfo, contactEmail: e.target.value })}
                  placeholder="orders@acme.com"
                  className="mt-2" 
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input 
                  value={accountInfo.phoneNumber}
                  onChange={(e) => setAccountInfo({ ...accountInfo, phoneNumber: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="mt-2" 
                />
              </div>
              <div>
                <Label>Billing Address</Label>
                <Input 
                  value={accountInfo.billingAddress}
                  onChange={(e) => setAccountInfo({ ...accountInfo, billingAddress: e.target.value })}
                  placeholder="123 Business Ave, Suite 100"
                  className="mt-2" 
                />
              </div>
              <Button className="mt-4" onClick={handleUpdateAccount}>Update Account</Button>
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
