import React, { useState } from "react";
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
  materials: { name: string; quantity: number }[];
  defectRate: number;
}

interface Material {
  id: string;
  name: string;
  stock: number;
  threshold: number;
  supplier: string;
}

const AdminSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState("general");
  
  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "Engine Assembly", materials: [{ name: "Steel", quantity: 50 }, { name: "Copper", quantity: 10 }], defectRate: 2 },
    { id: "2", name: "Transmission Unit", materials: [{ name: "Aluminum", quantity: 30 }], defectRate: 1.5 },
  ]);
  
  const [materials, setMaterials] = useState<Material[]>([
    { id: "1", name: "Steel Sheets", stock: 500, threshold: 100, supplier: "SteelCo" },
    { id: "2", name: "Copper Wire", stock: 200, threshold: 50, supplier: "MetalWorks" },
    { id: "3", name: "Aluminum Plates", stock: 300, threshold: 75, supplier: "AlumniPro" },
  ]);
  
  const [qualityRules, setQualityRules] = useState({
    maxDefectPercentage: 5,
    qcPassScore: 85,
    reworkAllowance: 3,
  });
  
  const [aiSettings, setAiSettings] = useState({
    historicalDefectRate: 3.5,
    safetySurplus: 10,
    materialBuffer: 15,
  });
  
  const [accessCodes, setAccessCodes] = useState({
    projectCode: "MFG-2024-X7K9",
    clientPasscode: "CLT-8472-PASS",
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const regenerateCode = (type: "project" | "client") => {
    const newCode = type === "project" 
      ? `MFG-${Date.now().toString(36).toUpperCase()}`
      : `CLT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    setAccessCodes(prev => ({
      ...prev,
      [type === "project" ? "projectCode" : "clientPasscode"]: newCode,
    }));
    toast({ title: `${type === "project" ? "Project" : "Client"} code regenerated` });
  };

  const calculatedSurplus = Math.round(100 * (1 + aiSettings.safetySurplus / 100) * (1 + aiSettings.historicalDefectRate / 100));
  const adjustedMaterialUsage = Math.round(100 * (1 + aiSettings.materialBuffer / 100));

  const renderContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <GlassCard className="animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-6">General Settings</h3>
            <div className="space-y-4">
              <div>
                <Label>Factory Name</Label>
                <Input defaultValue="Smart Manufacturing Co." className="mt-2" />
              </div>
              <div>
                <Label>Time Zone</Label>
                <Input defaultValue="UTC-5 (Eastern Time)" className="mt-2" />
              </div>
              <div>
                <Label>Default Production Shift</Label>
                <Input defaultValue="8:00 AM - 4:00 PM" className="mt-2" />
              </div>
              <Button className="mt-4">Save Changes</Button>
            </div>
          </GlassCard>
        );

      case "products":
        return (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Products</h3>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>
            {products.map((product) => (
              <GlassCard key={product.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Expected defect: {product.defectRate}%
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Required Materials</Label>
                  {product.materials.map((mat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <span>{mat.name}: {mat.quantity} units</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        );

      case "materials":
        return (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Raw Materials</h3>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Material
              </Button>
            </div>
            {materials.map((material) => (
              <GlassCard key={material.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{material.name}</h4>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Stock: </span>
                        <span className={cn(
                          "font-medium",
                          material.stock < material.threshold && "text-destructive"
                        )}>
                          {material.stock}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threshold: </span>
                        <span>{material.threshold}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Supplier: </span>
                        <span>{material.supplier}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        );

      case "quality":
        return (
          <GlassCard className="animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-6">Quality Rules</h3>
            <div className="space-y-6">
              <div>
                <Label>Maximum Defect Percentage</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    value={qualityRules.maxDefectPercentage}
                    onChange={(e) => setQualityRules(prev => ({ ...prev, maxDefectPercentage: Number(e.target.value) }))}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              </div>
              <div>
                <Label>QC Pass Score</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    value={qualityRules.qcPassScore}
                    onChange={(e) => setQualityRules(prev => ({ ...prev, qcPassScore: Number(e.target.value) }))}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div>
                <Label>Rework Allowance</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    value={qualityRules.reworkAllowance}
                    onChange={(e) => setQualityRules(prev => ({ ...prev, reworkAllowance: Number(e.target.value) }))}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">times per order</span>
                </div>
              </div>
              <Button>Save Quality Rules</Button>
            </div>
          </GlassCard>
        );

      case "ai":
        return (
          <div className="space-y-4 animate-fade-in-up">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-6">AI & Optimization Settings</h3>
              <div className="space-y-6">
                <div>
                  <Label>Historical Defect Rate</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={aiSettings.historicalDefectRate}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, historicalDefectRate: Number(e.target.value) }))}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <Label>Safety Surplus Percentage</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      value={aiSettings.safetySurplus}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, safetySurplus: Number(e.target.value) }))}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <Label>Material Buffer Percentage</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      value={aiSettings.materialBuffer}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, materialBuffer: Number(e.target.value) }))}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
                <Button>Save AI Settings</Button>
              </div>
            </GlassCard>

            <GlassCard variant="prominent">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Live Calculated Outputs</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground mb-1">Required Surplus Production</p>
                  <p className="text-xl font-semibold text-primary">{calculatedSurplus}%</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground mb-1">Adjusted Material Usage</p>
                  <p className="text-xl font-semibold text-primary">{adjustedMaterialUsage}%</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                💡 AI suggests increasing buffer to 20% based on seasonal demand patterns.
              </p>
            </GlassCard>
          </div>
        );

      case "access":
        return (
          <GlassCard className="animate-fade-in-up">
            <h3 className="text-lg font-semibold mb-6">Access Codes</h3>
            <div className="space-y-6">
              <div>
                <Label>Project Code</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={accessCodes.projectCode}
                    readOnly
                    className="font-mono bg-secondary/30"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(accessCodes.projectCode)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => regenerateCode("project")}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label>Client Passcode</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={accessCodes.clientPasscode}
                    readOnly
                    className="font-mono bg-secondary/30"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(accessCodes.clientPasscode)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => regenerateCode("client")}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="pt-4 border-t border-border/30">
                <Button variant="destructive" size="sm">
                  Disable All Access Codes
                </Button>
              </div>
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
      backPath="/admin"
      title="Admin Settings"
    >
      {renderContent()}
    </SettingsLayout>
  );
};

export default AdminSettings;
