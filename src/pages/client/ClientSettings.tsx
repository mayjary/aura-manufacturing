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
  const [loading, setLoading] = useState(true);

  const [joinProjectCode, setJoinProjectCode] = useState("");
  const [joiningProject, setJoiningProject] = useState(false);
  const [hasJoinedProject, setHasJoinedProject] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

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

  /* -------------------------------------------------------
     Restore persisted project on mount (ADMIN-LIKE LOGIC)
  ------------------------------------------------------- */
  useEffect(() => {
    const storedProjectId = localStorage.getItem("client_project_id");
    const storedCode = localStorage.getItem("client_access_code");

    if (storedProjectId) {
      setProjectId(storedProjectId);
      setHasJoinedProject(true);
    }

    if (storedCode) {
      setJoinProjectCode(storedCode);
    }

    setLoading(false);
  }, []);

  /* -------------------------------------------------------
     Join project using access code
  ------------------------------------------------------- */
  const handleJoinProject = async () => {
    if (!joinProjectCode) {
      toast({
        title: "Missing access code",
        variant: "destructive",
      });
      return;
    }

    try {
      setJoiningProject(true);

      const result = await apiFetch("/access-codes/join", {
        method: "POST",
        body: JSON.stringify({
          project_code: joinProjectCode.toUpperCase(),
        }),
      });

      // Backend returns project_id
      const joinedProjectId = result.project_id;
      const upperCode = joinProjectCode.toUpperCase();

      // Persist exactly like admin
      localStorage.setItem("client_project_id", joinedProjectId);
      localStorage.setItem("client_access_code", upperCode);

      setProjectId(joinedProjectId);
      setJoinProjectCode(upperCode);
      setHasJoinedProject(true);

      toast({
        title: "Project joined successfully",
        description: "You now have access to this project",
      });
    } catch (err: any) {
      toast({
        title: "Failed to join project",
        description: err.message || "Invalid access code",
        variant: "destructive",
      });
    } finally {
      setJoiningProject(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied" });
  };

  const clearProject = () => {
    localStorage.removeItem("client_project_id");
    localStorage.removeItem("client_access_code");
    setProjectId(null);
    setJoinProjectCode("");
    setHasJoinedProject(false);
  };

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */
  const renderContent = () => {
    switch (activeSection) {
      case "access":
        return (
          <div className="space-y-4 animate-fade-in-up">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-6">Project Access</h3>

              <div className="space-y-4">
                <div>
                  <Label>Access Code</Label>
                  <Input
                    className="mt-2 font-mono text-lg"
                    placeholder="Enter access code"
                    value={joinProjectCode}
                    onChange={(e) =>
                      !hasJoinedProject &&
                      setJoinProjectCode(e.target.value.toUpperCase())
                    }
                    readOnly={hasJoinedProject}
                    maxLength={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {hasJoinedProject
                      ? "You are connected to a project"
                      : "Enter the code provided by admin"}
                  </p>
                </div>

                {hasJoinedProject ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => copyToClipboard(joinProjectCode)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                    <Button variant="destructive" onClick={clearProject}>
                      Leave Project
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleJoinProject}
                    disabled={joiningProject}
                  >
                    {joiningProject ? "Joining..." : "Join Project"}
                  </Button>
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Order Access</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Once connected, all project orders and history will be visible
                in your dashboard.
              </p>
            </GlassCard>

            <GlassCard>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-success" />
                <h4 className="font-semibold">Quality Transparency</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                You will receive QC reports and delivery updates automatically.
              </p>
            </GlassCard>
          </div>
        );

      case "notifications":
        return (
          <GlassCard>
            <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      setNotifications((n) => ({ ...n, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </GlassCard>
        );

      case "account":
        return (
          <GlassCard>
            <h3 className="text-lg font-semibold mb-6">Account Information</h3>
            <div className="space-y-4">
              {Object.entries(accountInfo).map(([key, value]) => (
                <div key={key}>
                  <Label>{key.replace(/([A-Z])/g, " $1")}</Label>
                  <Input
                    className="mt-2"
                    value={value}
                    onChange={(e) =>
                      setAccountInfo((a) => ({ ...a, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </GlassCard>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <GlassCard className="p-6">Loading...</GlassCard>;
  }

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
