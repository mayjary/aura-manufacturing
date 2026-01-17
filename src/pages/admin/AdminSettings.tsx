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
    ChevronRight, // Added Badge import based on user usage
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  { id: "tasks", label: "Tasks", icon: ClipboardList },
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

  const [accessCode, setAccessCode] = useState("");

  // Tasks section state
  const [tasks, setTasks] = useState<any[]>([]);
  const [workers, setWorkers] = useState<{ username: string; id: string }[]>([]);
  const [productionOrders, setProductionOrders] = useState<any[]>([]);
  const [taskForm, setTaskForm] = useState({
    production_order_id: "",
    worker_user_id: "",
    task_name: "",
    machine: "",
    quantity_target: "",
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

                // Fetch AI settings (placeholder for now)
                try {
                    const aiData = await apiFetch("/ai/settings");
                    if (aiData && !aiData.message) {
                        setAiSettings(aiData);
                    }
                } catch {
                    // AI settings endpoint might not be fully implemented
                }

                // Fetch access code
                const accessData = await apiFetch(`/access-codes?project_id=${projectId}`).catch(() => null);
                if (accessData) {
                    setAccessCode(accessData.project_code || "");
                }

                // Fetch tasks data
                const tasksData = await apiFetch("/admin/tasks").catch(() => []);
                setTasks(tasksData || []);

                // Fetch workers
                const workersData = await apiFetch("/admin/workers").catch(() => []);
                setWorkers(workersData || []);

                // Fetch production orders
                const ordersData = await apiFetch("/production/list").catch(() => []);
                setProductionOrders(ordersData || []);
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

        {!loading && activeSection === "general" && (
          <div className="space-y-6">
            <GlassCard>
              <h3 className="text-lg font-semibold mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label>Project Name</Label>
                  <Input placeholder="Manufacturing Project" className="mt-2" readOnly />
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

        {!loading && activeSection === "products" && (
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
                  <Button variant="ghost" size="icon" onClick={() => deleteMaterial(m.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </GlassCard>
              ))
            )}
          </div>
        )}

        {!loading && activeSection === "tasks" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Task Assignment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Assign production tasks to workers
              </p>
            </div>

            {/* Task Creation Form */}
            <GlassCard>
              <h4 className="text-md font-semibold mb-4">Create New Task</h4>
              <div className="space-y-4">
                <div>
                  <Label>Production Order</Label>
                  <Select
                    value={taskForm.production_order_id}
                    onValueChange={(value) =>
                      setTaskForm((f) => ({ ...f, production_order_id: value }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select production order" />
                    </SelectTrigger>
                    <SelectContent>
                      {productionOrders
                        .filter((po) => po.status !== "completed")
                        .map((po) => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.product_name} - {po.quantity_target} units
                            {po.status && ` (${po.status})`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Worker</Label>
                  <Select
                    value={taskForm.worker_user_id}
                    onValueChange={(value) =>
                      setTaskForm((f) => ({ ...f, worker_user_id: value }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.username}>
                          {worker.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Task Name</Label>
                  <Input
                    className="mt-2"
                    placeholder="e.g., Assembly, Quality Check"
                    value={taskForm.task_name}
                    onChange={(e) =>
                      setTaskForm((f) => ({ ...f, task_name: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label>Machine (Optional)</Label>
                  <Input
                    className="mt-2"
                    placeholder="e.g., Machine A, Line 1"
                    value={taskForm.machine}
                    onChange={(e) =>
                      setTaskForm((f) => ({ ...f, machine: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label>Quantity Target</Label>
                  <Input
                    type="number"
                    className="mt-2"
                    placeholder="Enter target quantity"
                    value={taskForm.quantity_target}
                    onChange={(e) =>
                      setTaskForm((f) => ({ ...f, quantity_target: e.target.value }))
                    }
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={async () => {
                    if (
                      !taskForm.production_order_id ||
                      !taskForm.worker_user_id ||
                      !taskForm.task_name ||
                      !taskForm.quantity_target
                    ) {
                      toast({
                        title: "Please fill all required fields",
                        variant: "destructive",
                      });
                      return;
                    }

                    try {
                      await apiFetch("/admin/tasks", {
                        method: "POST",
                        body: JSON.stringify({
                          production_order_id: taskForm.production_order_id,
                          worker_user_id: taskForm.worker_user_id,
                          task_name: taskForm.task_name,
                          machine: taskForm.machine || null,
                          quantity_target: parseInt(taskForm.quantity_target),
                        }),
                      });

                      toast({ title: "Task created successfully" });
                      setTaskForm({
                        production_order_id: "",
                        worker_user_id: "",
                        task_name: "",
                        machine: "",
                        quantity_target: "",
                      });

                      // Refresh tasks list
                      const tasksData = await apiFetch("/admin/tasks").catch(() => []);
                      setTasks(tasksData || []);
                    } catch (err: any) {
                      toast({
                        title: "Failed to create task",
                        description: err.message,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Create Task
                </Button>
              </div>
            </GlassCard>

            {/* Tasks List */}
            <div>
              <h4 className="text-md font-semibold mb-4">All Tasks</h4>
              {tasks.length === 0 ? (
                <GlassCard>
                  <p className="text-muted-foreground">No tasks created yet.</p>
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <GlassCard key={task.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{task.task_name}</p>
                            <Badge
                              variant={
                                task.status === "completed"
                                  ? "default"
                                  : task.status === "in-progress"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {task.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Product: {task.product_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Worker: {task.worker_username || "Unassigned"}
                          </p>
                          {task.machine && (
                            <p className="text-sm text-muted-foreground">
                              Machine: {task.machine}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Progress: {task.quantity_completed || 0} / {task.quantity_target}
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
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
              <Button
                className="mt-4"
                onClick={async () => {
                  if (!projectId) return;
                  try {
                    await apiFetch("/quality-rules", {
                      method: "POST",
                      body: JSON.stringify({ ...qualityRules, project_id: projectId }),
                    });
                    toast({ title: "Quality rules saved" });
                  } catch (error) {
                    toast({ title: "Failed to save quality rules", variant: "destructive" });
                  }
                }}
              >
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

              <Button
                className="mt-4"
                onClick={async () => {
                  try {
                    await apiFetch("/ai/settings", {
                      method: "POST",
                      body: JSON.stringify(aiSettings),
                    });
                    toast({ title: "AI settings saved" });
                  } catch (error) {
                    toast({ title: "Failed to save AI settings", variant: "destructive" });
                  }
                }}
              >
                Save AI Settings
              </Button>
            </div>
          </GlassCard>
        )}

        {!loading && activeSection === "access" && (
          <GlassCard className="space-y-6">
            <div>
              <Label>Access Code</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Share this code with clients to allow them to join this project.
              </p>
              <div className="flex gap-2 mt-2">
                <Input value={accessCode} readOnly className="font-mono text-lg" />
                <Button variant="outline" onClick={() => copyText(accessCode)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    if (!projectId) return;
                    try {
                      const newCode = await apiFetch("/access-codes/regenerate", {
                        method: "POST",
                        body: JSON.stringify({ project_id: projectId }),
                      });
                      setAccessCode(newCode.project_code || "");
                      toast({ title: "Access code regenerated" });
                    } catch (err: any) {
                      toast({ 
                        title: "Failed to regenerate code", 
                        description: err.message,
                        variant: "destructive" 
                      });
                    }
                  }}
                >
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