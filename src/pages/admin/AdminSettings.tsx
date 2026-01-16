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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { apiFetch, AuthError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import AuthErrorDialog from "@/components/AuthErrorDialog";
import AddProductModal, { ProductFormData } from "@/components/modals/AddProductModal";
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
  quality_grade?: "A" | "B" | "C";
}

const AdminSettings: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  const [showAuthError, setShowAuthError] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeSection, setActiveSection] = useState("general");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);

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

  useEffect(() => {
    if (isAuthenticated === false) {
      setAuthError("You need to be logged in to access admin settings.");
      setShowAuthError(true);
    }
    if (isAuthenticated && userRole !== "admin") {
      setAuthError("You do not have permission to access admin settings.");
      setShowAuthError(true);
    }
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") return;

    const stored = localStorage.getItem("project_id");
    if (stored) {
      setProjectId(stored);
      return;
    }

    apiFetch("/projects/my")
      .then((p) => {
        if (p?.id) {
          localStorage.setItem("project_id", p.id);
          setProjectId(p.id);
        }
      })
      .catch(() => setProjectId(null));
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      try {
        setLoading(true);
        setProducts(await apiFetch(`/products?project_id=${projectId}`));
        setMaterials(await apiFetch("/inventory"));

        const qr = await apiFetch(`/quality-rules?project_id=${projectId}`);
        if (qr) setQualityRules(qr);

        const ac = await apiFetch(`/access-codes?project_id=${projectId}`);
        if (ac) setAccessCodes(ac);
      } catch (e) {
        if (e instanceof AuthError) {
          setAuthError(e.message);
          setShowAuthError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [projectId]);

  const handleSaveProduct = async (product: ProductFormData) => {
    if (!projectId) return;
  
    const created = await apiFetch("/products", {
      method: "POST",
      body: JSON.stringify({
        project_id: projectId,
        name: product.name,
        expected_defect_percent: product.expected_defect_percent,
      }),
    });
  
    setProducts((p) => [...p, created]);
    toast({ title: "Product added" });
  };
  

  const handleSaveMaterial = async (payload: any) => {
    const material = await apiFetch("/inventory", {
      method: "POST",
      body: JSON.stringify({ ...payload, project_id: projectId }),
    });
    setMaterials((m) => [...m, material]);
    toast({ title: "Material added" });
  };

  const deleteProduct = async (id: string) => {
    await apiFetch(`/products/${id}`, { method: "DELETE" });
    setProducts((p) => p.filter((x) => x.id !== id));
    toast({ title: "Product deleted" });
  };

  const deleteMaterial = async (id: string) => {
    await apiFetch(`/inventory/${id}`, { method: "DELETE" });
    setMaterials((m) => m.filter((x) => x.id !== id));
    toast({ title: "Material deleted" });
  };

  const copyText = (t: string) => {
    navigator.clipboard.writeText(t);
    toast({ title: "Copied" });
  };

  if (!isAuthenticated || userRole !== "admin") {
    return (
      <>
        <AuthErrorDialog open={showAuthError} onOpenChange={setShowAuthError} message={authError} />
        <GlassCard className="p-8 text-center mt-20">
          <p className="text-muted-foreground">Checking authentication...</p>
        </GlassCard>
      </>
    );
  }

  return (
    <>
      <AuthErrorDialog open={showAuthError} onOpenChange={setShowAuthError} message={authError} />

      <SettingsLayout
        sidebarItems={sidebarItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        backPath="/admin"
        title="Admin Settings"
      >
        <AddProductModal open={productModalOpen} onOpenChange={setProductModalOpen} onSave={handleSaveProduct} />
        <AddMaterialModal open={materialModalOpen} onOpenChange={setMaterialModalOpen} onSave={handleSaveMaterial} />

        {loading && <GlassCard>Loading...</GlassCard>}

        {!loading && activeSection === "products" && (
          <div className="space-y-4">
            <Button size="sm" onClick={() => setProductModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Button>

            {products.map((p) => (
              <GlassCard key={p.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Expected defect: {p.expected_defect_percent}%
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Link2 className="w-4 h-4" />
                    Material Mapping
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ClipboardList className="w-4 h-4" />
                    QC Checklist
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {!loading && activeSection === "materials" && (
          <div className="space-y-4">
            <Button size="sm" onClick={() => setMaterialModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add Material
            </Button>

            {materials.map((m) => (
              <GlassCard key={m.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Stock: {m.current_stock} | Threshold: {m.reorder_threshold}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMaterial(m.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </GlassCard>
            ))}
          </div>
        )}

        {!loading && activeSection === "access" && (
          <GlassCard className="space-y-6">
            <div>
              <Label>Project Code</Label>
              <div className="flex gap-2 mt-2">
                <Input value={accessCodes.project_code} readOnly />
                <Button variant="outline" onClick={() => copyText(accessCodes.project_code)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Client Passcode</Label>
              <div className="flex gap-2 mt-2">
                <Input value={accessCodes.client_passcode} readOnly />
                <Button variant="outline" onClick={() => copyText(accessCodes.client_passcode)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </GlassCard>
        )}
      </SettingsLayout>
    </>
  );
};

export default AdminSettings;
