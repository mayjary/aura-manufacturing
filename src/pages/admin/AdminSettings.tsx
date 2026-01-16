import React, { useState, useEffect } from "react";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Package,
  Layers,
  ShieldCheck,
  Sparkles,
  Key,
  Plus,
  Trash2,
  Copy,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { apiFetch, AuthError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import AuthErrorDialog from "@/components/AuthErrorDialog";
import AddProductModal from "@/components/modals/AddProductModal";
import AddMaterialModal from "@/components/modals/AddMaterialModal";

const sidebarItems = [
  { id: "general", label: "General", icon: Settings },
  { id: "products", label: "Products", icon: Package },
  { id: "materials", label: "Materials", icon: Layers },
  { id: "quality", label: "Quality Rules", icon: ShieldCheck },
  { id: "ai", label: "AI & Optimization", icon: Sparkles },
  { id: "access", label: "Access Codes", icon: Key },
];

interface Product {
  id: string;
  name: string;
  expected_defect_percent: number;
}

interface Material {
  id: string;
  name: string;
  current_stock: number;
  reorder_threshold: number;
  supplier?: string;
  status?: string;
}

const AdminSettings: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [activeSection, setActiveSection] = useState("general");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated === false) {
      setAuthError("You need to be logged in to access admin settings.");
      setShowAuthError(true);
      return;
    }
    if (isAuthenticated === true && userRole !== "admin") {
      setAuthError("You don't have permission to access admin settings.");
      setShowAuthError(true);
      return;
    }
  }, [isAuthenticated, userRole]);

  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [qualityRules, setQualityRules] = useState({
    max_defect_percentage: 0,
    qc_pass_score: 0,
    rework_allowance: 0,
  });

  const [aiSettings, setAiSettings] = useState({
    historical_defect_rate: 0,
    safety_surplus: 0,
    material_buffer: 0,
  });

  const [accessCodes, setAccessCodes] = useState({
    project_code: "",
    client_passcode: "",
  });

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);

  /* -------------------- GET PROJECT ID -------------------- */
  
  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") return;
  
    const fetchProjectId = async () => {
      let storedProjectId = localStorage.getItem("project_id");
      if (storedProjectId) {
        setProjectId(storedProjectId);
        return;
      }
      // Try to get project for current admin
      try {
        const project = await apiFetch("/projects/my");
        if (project && project.id) {
          setProjectId(project.id);
          localStorage.setItem("project_id", project.id);
        } else {
          setProjectId(null);
        }
      } catch {
        setProjectId(null);
      }
    };
    fetchProjectId();
  }, [isAuthenticated, userRole]);  

  /* -------------------- FETCH ON LOAD -------------------- */

  useEffect(() => {
    if (!projectId || !isAuthenticated || userRole !== "admin") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const productsData = await apiFetch(`/products?project_id=${projectId}`).catch(() => []);
        setProducts(productsData || []);

        // Fetch inventory/materials
        const materialsData = await apiFetch("/inventory").catch(() => []);
        setMaterials(materialsData || []);

        // Fetch quality rules
        const qualityData = await apiFetch(`/quality-rules?project_id=${projectId}`).catch(() => null);
        if (qualityData) {
          setQualityRules({
            max_defect_percentage: qualityData.max_defect_percentage || 0,
            qc_pass_score: qualityData.qc_pass_score || 0,
            rework_allowance: qualityData.rework_allowance || 0,
          });
        }

        // Fetch AI settings (placeholder for now)
        try {
          const aiData = await apiFetch("/ai/settings");
          if (aiData && !aiData.message) {
            setAiSettings(aiData);
          }
        } catch {
          // AI settings endpoint might not be fully implemented
        }

        // Fetch access codes
        const accessData = await apiFetch(`/access-codes?project_id=${projectId}`).catch(() => null);
        if (accessData) {
          setAccessCodes({
            project_code: accessData.project_code || "",
            client_passcode: accessData.client_passcode || "",
          });
        }
      } catch (err) {
        if (err instanceof AuthError) {
          setAuthError(err.message);
          setShowAuthError(true);
        } else {
          console.error("Failed to fetch settings data", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, isAuthenticated, userRole]);

  /* -------------------- PRODUCTS -------------------- */

  const handleSaveProduct = async (payload: { name: string; defect_rate: number }) => {
    if (!projectId) {
      toast({ title: "Project ID not available", variant: "destructive" });
      return;
    }

    try {
      const product = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({ 
          project_id: projectId,
          name: payload.name, 
          expected_defect_percent: payload.defect_rate,
        }),
      });

      setProducts((p) => [...p, product]);
      toast({ title: "Product added" });
    } catch (err: any) {
      toast({ title: "Failed to add product", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // DELETE endpoint doesn't exist yet - handle gracefully
      await apiFetch(`/products/${id}`, { method: "DELETE" }).catch(() => {
        // If DELETE fails, just remove from local state for now
        setProducts((p) => p.filter((x) => x.id !== id));
        toast({ title: "Product removed (local only - backend DELETE not implemented)" });
        throw new Error("DELETE not implemented");
      });
      setProducts((p) => p.filter((x) => x.id !== id));
      toast({ title: "Product removed" });
    } catch (err: any) {
      // Already handled above
    }
  };

  /* -------------------- MATERIALS -------------------- */

  const handleSaveMaterial = async (payload: {
    name: string;
    current_stock: number;
    reorder_threshold: number;
    supplier?: string;
  }) => {
    if (!projectId) {
      toast({ title: "Project ID not available", variant: "destructive" });
      return;
    }

    try {
      const material = await apiFetch("/inventory", {
        method: "POST",
        body: JSON.stringify({
          project_id: projectId,
          name: payload.name,
          current_stock: payload.current_stock,
          reorder_threshold: payload.reorder_threshold,
          supplier: payload.supplier,
        }),
      });

      setMaterials((m) => [...m, material]);
      toast({ title: "Material added" });
    } catch (err: any) {
      toast({ title: "Failed to add material", description: err.message, variant: "destructive" });
      throw err;
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      // DELETE endpoint doesn't exist yet - handle gracefully
      await apiFetch(`/inventory/${id}`, { method: "DELETE" }).catch(() => {
        // If DELETE fails, just remove from local state for now
        setMaterials((m) => m.filter((x) => x.id !== id));
        toast({ title: "Material removed (local only - backend DELETE not implemented)" });
        throw new Error("DELETE not implemented");
      });
      setMaterials((m) => m.filter((x) => x.id !== id));
      toast({ title: "Material removed" });
    } catch (err: any) {
      // Already handled above
    }
  };

  /* -------------------- QUALITY -------------------- */

  const saveQualityRules = async () => {
    if (!projectId) {
      toast({ title: "Project ID not available", variant: "destructive" });
      return;
    }

    try {
      await apiFetch("/quality-rules", {
        method: "POST",
        body: JSON.stringify({
          project_id: projectId,
          ...qualityRules,
        }),
      });
      toast({ title: "Quality rules saved" });
    } catch (err: any) {
      toast({ title: "Failed to save quality rules", description: err.message, variant: "destructive" });
    }
  };

  /* -------------------- AI -------------------- */

  const saveAISettings = async () => {
    await apiFetch("/ai/settings", {
      method: "POST",
      body: JSON.stringify(aiSettings),
    });
    toast({ title: "AI settings saved" });
  };

  /* -------------------- ACCESS CODES -------------------- */

  const regenerateCode = async (type: "project" | "client") => {
    if (!projectId) {
      toast({ title: "Project ID not available", variant: "destructive" });
      return;
    }

    try {
      const data = await apiFetch("/access-codes/regenerate", {
        method: "POST",
        body: JSON.stringify({ project_id: projectId }),
      });
      setAccessCodes({
        project_code: data.project_code || "",
        client_passcode: data.client_passcode || "",
      });
      toast({ title: "Code regenerated" });
    } catch (err: any) {
      toast({ title: "Failed to regenerate code", description: err.message, variant: "destructive" });
    }
  };

  const disableAccess = async () => {
    try {
      // DELETE endpoint doesn't exist yet - handle gracefully
      await apiFetch("/access-codes/disable", { method: "POST" }).catch(() => {
        toast({ title: "Disable access not implemented in backend yet", variant: "destructive" });
        throw new Error("Not implemented");
      });
      toast({ title: "Access disabled" });
    } catch (err: any) {
      // Already handled above
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied" });
  };

  /* -------------------- RENDER -------------------- */

  // Don't render content if not authenticated
  if (!isAuthenticated || userRole !== "admin") {
    return (
      <>
        <AuthErrorDialog
          open={showAuthError}
          onOpenChange={setShowAuthError}
          message={authError}
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <GlassCard className="p-8 text-center">
            <p className="text-muted-foreground">Checking authentication...</p>
          </GlassCard>
        </div>
      </>
    );
  }

  if (!projectId) {
    return (
      <GlassCard className="p-8 text-center mt-12">
        <p className="text-muted-foreground">No project selected. Please select or create a project to view settings.</p>
      </GlassCard>
    );
  }

  return (
    <>
      <AuthErrorDialog
        open={showAuthError}
        onOpenChange={setShowAuthError}
        message={authError}
      />
      <SettingsLayout
      sidebarItems={sidebarItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      backPath="/admin"
      title="Admin Settings"
    >
      <AddProductModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        onSave={handleSaveProduct}
      />
      <AddMaterialModal
        open={materialModalOpen}
        onOpenChange={setMaterialModalOpen}
        onSave={handleSaveMaterial}
      />
      {loading && (
        <GlassCard>
          <p className="text-muted-foreground">Loading...</p>
        </GlassCard>
      )}

      {!loading && activeSection === "general" && (
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <Label>Project Name</Label>
                <Input placeholder="Manufacturing Project" className="mt-2" />
              </div>
              <div>
                <Label>Timezone</Label>
                <Input value="UTC" readOnly className="mt-2 bg-muted/50" />
              </div>
              <div>
                <Label>Default Language</Label>
                <Input value="English" readOnly className="mt-2 bg-muted/50" />
              </div>
            </div>
          </GlassCard>
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email alerts for low stock</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily production summary</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Quality alerts</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border" />
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {!loading && projectId && activeSection === "products" && (
        <div className="space-y-4">
          <Button size="sm" onClick={() => setProductModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
          {products.length === 0 ? (
            <GlassCard>
              <p className="text-muted-foreground">No products found. Add one to get started.</p>
            </GlassCard>
          ) : (
            products.map((p) => (
            <GlassCard key={p.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  Expected defect: {p.expected_defect_percent || 0}%
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => deleteProduct(p.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </GlassCard>
            ))
          )}
        </div>
      )}

      {!loading && activeSection === "materials" && (
        <div className="space-y-4">
          <Button size="sm" onClick={() => setMaterialModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Material
          </Button>
          {materials.length === 0 ? (
            <GlassCard>
              <p className="text-muted-foreground">No materials found. Add one to get started.</p>
            </GlassCard>
          ) : (
            materials.map((m) => (
            <GlassCard key={m.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-muted-foreground">
                  Stock: {m.current_stock} | Threshold: {m.reorder_threshold}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => deleteMaterial(m.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </GlassCard>
            ))
          )}
        </div>
      )}

      {!loading && activeSection === "quality" && (
        <GlassCard>
          <Label>Max Defect %</Label>
          <Input
            value={qualityRules.max_defect_percentage}
            onChange={(e) =>
              setQualityRules((q) => ({
                ...q,
                max_defect_percentage: Number(e.target.value),
              }))
            }
          />
          <Label className="mt-4">QC Pass Score</Label>
          <Input
            value={qualityRules.qc_pass_score}
            onChange={(e) =>
              setQualityRules((q) => ({
                ...q,
                qc_pass_score: Number(e.target.value),
              }))
            }
          />
          <Label className="mt-4">Rework Allowance</Label>
          <Input
            value={qualityRules.rework_allowance}
            onChange={(e) =>
              setQualityRules((q) => ({
                ...q,
                rework_allowance: Number(e.target.value),
              }))
            }
          />
          <Button className="mt-4" onClick={saveQualityRules}>
            Save Quality Rules
          </Button>
        </GlassCard>
      )}

      {!loading && activeSection === "ai" && (
        <GlassCard>
          <Label>Historical Defect Rate</Label>
          <Input
            value={aiSettings.historical_defect_rate}
            onChange={(e) =>
              setAiSettings((a) => ({
                ...a,
                historical_defect_rate: Number(e.target.value),
              }))
            }
          />
          <Label className="mt-4">Safety Surplus %</Label>
          <Input
            value={aiSettings.safety_surplus}
            onChange={(e) =>
              setAiSettings((a) => ({
                ...a,
                safety_surplus: Number(e.target.value),
              }))
            }
          />
          <Label className="mt-4">Material Buffer %</Label>
          <Input
            value={aiSettings.material_buffer}
            onChange={(e) =>
              setAiSettings((a) => ({
                ...a,
                material_buffer: Number(e.target.value),
              }))
            }
          />
          <Button className="mt-4" onClick={saveAISettings}>
            Save AI Settings
          </Button>
        </GlassCard>
      )}

      {!loading && activeSection === "access" && (
        <GlassCard>
          <Label>Project Code</Label>
          <div className="flex gap-2">
            <Input value={accessCodes.project_code} readOnly />
            <Button onClick={() => copy(accessCodes.project_code)}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={() => regenerateCode("project")}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <Label className="mt-4">Client Passcode</Label>
          <div className="flex gap-2">
            <Input value={accessCodes.client_passcode} readOnly />
            <Button onClick={() => copy(accessCodes.client_passcode)}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={() => regenerateCode("client")}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="destructive"
            className="mt-6"
            onClick={disableAccess}
          >
            Disable All Access
          </Button>
        </GlassCard>
      )}
    </SettingsLayout>
    </>
  );
};

export default AdminSettings;
