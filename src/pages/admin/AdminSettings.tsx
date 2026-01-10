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
  Link2,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { apiFetch, AuthError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import AuthErrorDialog from "@/components/AuthErrorDialog";
import AddProductModal, { ProductFormData } from "@/components/modals/AddProductModal";
import AddMaterialModal, { MaterialFormData } from "@/components/modals/AddMaterialModal";
import ProductMaterialMappingModal, { MaterialMapping } from "@/components/modals/ProductMaterialMappingModal";
import ProductChecklistModal, { ChecklistItem } from "@/components/modals/ProductChecklistModal";
import { Badge } from "@/components/ui/badge";

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
  defect_rate: number;
  expected_defect_percent?: number;
  criticality_level?: "low" | "medium" | "high";
  standard_cycle_time?: number;
  standard_inspection_time?: number;
  inspection_type?: "manual" | "automated" | "hybrid";
  quality_tolerance?: number;
}

interface Material {
  id: string;
  name: string;
  current_stock: number;
  reorder_threshold: number;
  supplier?: string;
  unit?: string;
  quality_grade?: "A" | "B" | "C";
  lead_time_days?: number;
  status?: string;
}

const AdminSettings: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [activeSection, setActiveSection] = useState("general");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showMaterialMappingModal, setShowMaterialMappingModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const handleAddProduct = async (productData: ProductFormData) => {
    if (!projectId) {
      throw new Error("Project ID not available");
    }

    try {
      const product = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({ 
          project_id: projectId,
          name: productData.name,
          defect_rate: productData.expected_defect_percent,
          expected_defect_percent: productData.expected_defect_percent,
          criticality_level: productData.criticality_level,
          standard_cycle_time: productData.standard_cycle_time,
          standard_inspection_time: productData.standard_inspection_time,
          inspection_type: productData.inspection_type,
          quality_tolerance: productData.quality_tolerance,
        }),
      });

      setProducts((p) => [...p, product]);
      toast({ title: "Product added successfully" });
    } catch (err: any) {
      // If POST fails, add to local state for demo
      const newProduct: Product = {
        id: `temp-${Date.now()}`,
        name: productData.name,
        defect_rate: productData.expected_defect_percent,
        expected_defect_percent: productData.expected_defect_percent,
        criticality_level: productData.criticality_level,
        standard_cycle_time: productData.standard_cycle_time,
        standard_inspection_time: productData.standard_inspection_time,
        inspection_type: productData.inspection_type,
        quality_tolerance: productData.quality_tolerance,
      };
      setProducts((p) => [...p, newProduct]);
      toast({ title: "Product added (local only - backend not connected)" });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiFetch(`/products/${id}`, { method: "DELETE" }).catch(() => {
        setProducts((p) => p.filter((x) => x.id !== id));
        toast({ title: "Product removed" });
        throw new Error("DELETE not implemented");
      });
      setProducts((p) => p.filter((x) => x.id !== id));
      toast({ title: "Product removed" });
    } catch {
      // Already handled above
    }
  };

  const openMaterialMapping = (product: Product) => {
    setSelectedProduct(product);
    setShowMaterialMappingModal(true);
  };

  const openChecklist = (product: Product) => {
    setSelectedProduct(product);
    setShowChecklistModal(true);
  };

  const handleSaveMaterialMappings = async (mappings: MaterialMapping[]) => {
    // In a real app, save to backend
    console.log("Saving material mappings:", mappings);
    toast({ title: "Material mappings saved (demo mode)" });
  };

  const handleSaveChecklist = async (checklist: ChecklistItem[]) => {
    // In a real app, save to backend
    console.log("Saving checklist:", checklist);
    toast({ title: "Quality checklist saved (demo mode)" });
  };

  /* -------------------- MATERIALS -------------------- */

  const handleAddMaterial = async (materialData: MaterialFormData) => {
    try {
      const material = await apiFetch("/inventory", {
        method: "POST",
        body: JSON.stringify({
          name: materialData.name,
          unit: materialData.unit,
          current_stock: materialData.current_stock,
          reorder_threshold: materialData.reorder_threshold,
          supplier: materialData.supplier,
          quality_grade: materialData.quality_grade,
          lead_time_days: materialData.lead_time_days,
        }),
      });

      setMaterials((m) => [...m, material]);
      toast({ title: "Material added successfully" });
    } catch {
      // If POST fails, add to local state for demo
      const newMaterial: Material = {
        id: `temp-${Date.now()}`,
        name: materialData.name,
        unit: materialData.unit,
        current_stock: materialData.current_stock,
        reorder_threshold: materialData.reorder_threshold,
        supplier: materialData.supplier,
        quality_grade: materialData.quality_grade,
        lead_time_days: materialData.lead_time_days,
      };
      setMaterials((m) => [...m, newMaterial]);
      toast({ title: "Material added (local only - backend not connected)" });
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      await apiFetch(`/inventory/${id}`, { method: "DELETE" }).catch(() => {
        setMaterials((m) => m.filter((x) => x.id !== id));
        toast({ title: "Material removed" });
        throw new Error("DELETE not implemented");
      });
      setMaterials((m) => m.filter((x) => x.id !== id));
      toast({ title: "Material removed" });
    } catch {
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
      await apiFetch("/access-codes/disable", { method: "POST" }).catch(() => {
        toast({ title: "Disable access not implemented in backend yet", variant: "destructive" });
        throw new Error("Not implemented");
      });
      toast({ title: "Access disabled" });
    } catch {
      // Already handled above
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied" });
  };

  const getCriticalityBadge = (level?: string) => {
    switch (level) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  const getGradeBadge = (grade?: string) => {
    switch (grade) {
      case "A":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Grade A</Badge>;
      case "B":
        return <Badge variant="secondary">Grade B</Badge>;
      case "C":
        return <Badge variant="outline">Grade C</Badge>;
      default:
        return null;
    }
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

      {/* Modals */}
      <AddProductModal
        open={showAddProductModal}
        onOpenChange={setShowAddProductModal}
        onSave={handleAddProduct}
      />

      <AddMaterialModal
        open={showAddMaterialModal}
        onOpenChange={setShowAddMaterialModal}
        onSave={handleAddMaterial}
      />

      {selectedProduct && (
        <>
          <ProductMaterialMappingModal
            open={showMaterialMappingModal}
            onOpenChange={(open) => {
              setShowMaterialMappingModal(open);
              if (!open) setSelectedProduct(null);
            }}
            productName={selectedProduct.name}
            productId={selectedProduct.id}
            availableMaterials={materials.map((m) => ({ id: m.id, name: m.name }))}
            onSave={handleSaveMaterialMappings}
          />

          <ProductChecklistModal
            open={showChecklistModal}
            onOpenChange={(open) => {
              setShowChecklistModal(open);
              if (!open) setSelectedProduct(null);
            }}
            productName={selectedProduct.name}
            productId={selectedProduct.id}
            onSave={handleSaveChecklist}
          />
        </>
      )}

      <SettingsLayout
        sidebarItems={sidebarItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        backPath="/admin"
        title="Admin Settings"
      >
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Products</h3>
                <p className="text-sm text-muted-foreground">
                  Define products with quality parameters for SPC analysis
                </p>
              </div>
              <Button size="sm" onClick={() => setShowAddProductModal(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </div>

            {products.length === 0 ? (
              <GlassCard>
                <p className="text-muted-foreground">No products found. Add one to get started.</p>
              </GlassCard>
            ) : (
              products.map((p) => (
                <GlassCard key={p.id} className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-lg">{p.name}</p>
                        {getCriticalityBadge(p.criticality_level)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Defect Rate: {p.expected_defect_percent || p.defect_rate || 0}%</span>
                        {p.quality_tolerance && <span>Tolerance: ±{p.quality_tolerance}%</span>}
                        {p.inspection_type && (
                          <span className="capitalize">{p.inspection_type} Inspection</span>
                        )}
                      </div>
                      {(p.standard_cycle_time || p.standard_inspection_time) && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {p.standard_cycle_time && <span>Cycle: {p.standard_cycle_time} min</span>}
                          {p.standard_inspection_time && (
                            <span>Inspection: {p.standard_inspection_time} min</span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteProduct(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => openMaterialMapping(p)}
                    >
                      <Link2 className="w-4 h-4" />
                      Material Mapping
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => openChecklist(p)}
                    >
                      <ClipboardList className="w-4 h-4" />
                      QC Checklist
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}

        {!loading && activeSection === "materials" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Materials</h3>
                <p className="text-sm text-muted-foreground">
                  Manage raw materials and inventory thresholds
                </p>
              </div>
              <Button size="sm" onClick={() => setShowAddMaterialModal(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Add Material
              </Button>
            </div>

            {materials.length === 0 ? (
              <GlassCard>
                <p className="text-muted-foreground">No materials found. Add one to get started.</p>
              </GlassCard>
            ) : (
              materials.map((m) => (
                <GlassCard key={m.id} className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{m.name}</p>
                      {getGradeBadge(m.quality_grade)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Stock: {m.current_stock} {m.unit || "units"}
                      </span>
                      <span>Reorder at: {m.reorder_threshold}</span>
                      {m.lead_time_days && <span>Lead: {m.lead_time_days} days</span>}
                    </div>
                    {m.supplier && (
                      <p className="text-sm text-muted-foreground">Supplier: {m.supplier}</p>
                    )}
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
            <h3 className="text-lg font-semibold mb-4">Quality Rules</h3>
            <div className="space-y-4">
              <div>
                <Label>Max Defect %</Label>
                <Input
                  type="number"
                  className="mt-2"
                  value={qualityRules.max_defect_percentage}
                  onChange={(e) =>
                    setQualityRules((q) => ({
                      ...q,
                      max_defect_percentage: Number(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum allowable defect percentage before triggering alerts
                </p>
              </div>
              <div>
                <Label>QC Pass Score</Label>
                <Input
                  type="number"
                  className="mt-2"
                  value={qualityRules.qc_pass_score}
                  onChange={(e) =>
                    setQualityRules((q) => ({
                      ...q,
                      qc_pass_score: Number(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum quality score (0-100) required for a unit to pass QC
                </p>
              </div>
              <div>
                <Label>Rework Allowance</Label>
                <Input
                  type="number"
                  className="mt-2"
                  value={qualityRules.rework_allowance}
                  onChange={(e) =>
                    setQualityRules((q) => ({
                      ...q,
                      rework_allowance: Number(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum number of rework attempts before rejection
                </p>
              </div>
              <Button className="mt-4" onClick={saveQualityRules}>
                Save Quality Rules
              </Button>
            </div>
          </GlassCard>
        )}

        {!loading && activeSection === "ai" && (
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">AI & Optimization</h3>
            <div className="space-y-4">
              <div>
                <Label>Historical Defect Rate (%)</Label>
                <Input
                  type="number"
                  className="mt-2"
                  value={aiSettings.historical_defect_rate}
                  onChange={(e) =>
                    setAiSettings((a) => ({
                      ...a,
                      historical_defect_rate: Number(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used to predict expected defects and plan surplus production
                </p>
              </div>
              <div>
                <Label>Safety Surplus %</Label>
                <Input
                  type="number"
                  className="mt-2"
                  value={aiSettings.safety_surplus}
                  onChange={(e) =>
                    setAiSettings((a) => ({
                      ...a,
                      safety_surplus: Number(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Extra production percentage to account for defects
                </p>
              </div>
              <div>
                <Label>Material Buffer %</Label>
                <Input
                  type="number"
                  className="mt-2"
                  value={aiSettings.material_buffer}
                  onChange={(e) =>
                    setAiSettings((a) => ({
                      ...a,
                      material_buffer: Number(e.target.value),
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Extra material to order beyond calculated requirements
                </p>
              </div>

              {/* AI Calculations Preview */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 mt-6">
                <p className="text-sm font-medium mb-3">Calculated Outputs (Preview)</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Required Surplus Production</p>
                    <p className="text-lg font-semibold">
                      +{(aiSettings.historical_defect_rate + aiSettings.safety_surplus).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Adjusted Material Usage</p>
                    <p className="text-lg font-semibold">
                      +{(aiSettings.historical_defect_rate + aiSettings.material_buffer).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  💡 AI Suggestion: Based on your defect rate, consider increasing inspection frequency for high-criticality products.
                </p>
              </div>

              <Button className="mt-4" onClick={saveAISettings}>
                Save AI Settings
              </Button>
            </div>
          </GlassCard>
        )}

        {!loading && activeSection === "access" && (
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Access Codes</h3>
            <div className="space-y-6">
              <div>
                <Label>Project Code</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={accessCodes.project_code} readOnly className="font-mono" />
                  <Button variant="outline" onClick={() => copy(accessCodes.project_code)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => regenerateCode("project")}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Share this code with workers to join the project
                </p>
              </div>

              <div>
                <Label>Client Passcode</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={accessCodes.client_passcode} readOnly className="font-mono" />
                  <Button variant="outline" onClick={() => copy(accessCodes.client_passcode)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => regenerateCode("client")}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Share this with clients to view delivery and quality reports
                </p>
              </div>

              <Button variant="destructive" className="mt-4" onClick={disableAccess}>
                Disable All Access
              </Button>
            </div>
          </GlassCard>
        )}
      </SettingsLayout>
    </>
  );
};

export default AdminSettings;
