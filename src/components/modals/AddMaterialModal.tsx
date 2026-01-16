import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { HelpCircle } from "lucide-react";

export interface MaterialFormData {
  name: string;
  unit: "kg" | "pcs" | "meters" | "liters";
  current_stock: number;
  reorder_threshold: number;
  supplier: string;
  quality_grade: "A" | "B" | "C";
  lead_time_days: number;
}

interface AddMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (material: MaterialFormData) => Promise<void>;
}

const FieldTooltip: React.FC<{ content: string }> = ({ content }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [formData, setFormData] = useState<MaterialFormData>({
    name: "",
    unit: "pcs",
    current_stock: 0,
    reorder_threshold: 0,
    supplier: "",
    quality_grade: "A",
    lead_time_days: 0,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Material name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Material name must be less than 100 characters";
    }

    if (formData.current_stock < 0) {
      newErrors.current_stock = "Stock cannot be negative";
    }

    if (formData.reorder_threshold < 0) {
      newErrors.reorder_threshold = "Threshold cannot be negative";
    }

    if (formData.lead_time_days < 0) {
      newErrors.lead_time_days = "Lead time cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave({
        ...formData,
        name: formData.name.trim(),
        supplier: formData.supplier.trim(),
      });

      // Reset form
      setFormData({
        name: "",
        unit: "pcs",
        current_stock: 0,
        reorder_threshold: 0,
        supplier: "",
        quality_grade: "A",
        lead_time_days: 0,
      });
      setErrors({});
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Failed to add material",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      unit: "pcs",
      current_stock: 0,
      reorder_threshold: 0,
      supplier: "",
      quality_grade: "A",
      lead_time_days: 0,
    });
    setErrors({});
    onOpenChange(false);
  };

  const updateField = <K extends keyof MaterialFormData>(
    key: K,
    value: MaterialFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
          <DialogDescription>
            Define material specifications for inventory tracking and production planning.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Material Name */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="material-name">Material Name *</Label>
              <FieldTooltip content="A descriptive name for the raw material or component. Include specifications like size or grade for clarity." />
            </div>
            <Input
              id="material-name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g., Steel Rods 10mm Grade A"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Unit and Current Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label>Unit of Measure</Label>
                <FieldTooltip content="Standard unit for tracking inventory quantities. Choose based on how the material is typically measured and consumed." />
              </div>
              <Select
                value={formData.unit}
                onValueChange={(value: MaterialFormData["unit"]) =>
                  updateField("unit", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="meters">Meters (m)</SelectItem>
                  <SelectItem value="liters">Liters (L)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="current-stock">Current Stock</Label>
                <FieldTooltip content="Current available quantity in your inventory. Will be updated automatically as production orders consume materials." />
              </div>
              <Input
                id="current-stock"
                type="number"
                min="0"
                step="1"
                value={formData.current_stock || ""}
                onChange={(e) =>
                  updateField("current_stock", parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                className={errors.current_stock ? "border-destructive" : ""}
              />
              {errors.current_stock && (
                <p className="text-xs text-destructive">{errors.current_stock}</p>
              )}
            </div>
          </div>

          {/* Reorder Threshold */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="reorder-threshold">Reorder Threshold</Label>
              <FieldTooltip content="When stock falls below this level, the system will trigger a low-stock alert. Set based on lead time and average daily consumption." />
            </div>
            <Input
              id="reorder-threshold"
              type="number"
              min="0"
              step="1"
              value={formData.reorder_threshold || ""}
              onChange={(e) =>
                updateField("reorder_threshold", parseFloat(e.target.value) || 0)
              }
              placeholder="e.g., 100"
              className={errors.reorder_threshold ? "border-destructive" : ""}
            />
            {errors.reorder_threshold && (
              <p className="text-xs text-destructive">{errors.reorder_threshold}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Recommended: (Daily usage × Lead time) + Safety stock buffer
            </p>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="supplier">Supplier Name</Label>
              <FieldTooltip content="Primary supplier for this material. Helps track vendor performance and manage procurement." />
            </div>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => updateField("supplier", e.target.value)}
              placeholder="e.g., ABC Steel Suppliers"
            />
          </div>

          {/* Quality Grade */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label>Quality Grade</Label>
              <FieldTooltip content="Material quality classification. Grade A materials have tighter tolerances and lower defect rates. Lower grades may increase product defect probability." />
            </div>
            <Select
              value={formData.quality_grade}
              onValueChange={(value: "A" | "B" | "C") =>
                updateField("quality_grade", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">
                  <div className="flex flex-col items-start">
                    <span>Grade A (Premium)</span>
                    <span className="text-xs text-muted-foreground">Highest quality, tightest tolerances</span>
                  </div>
                </SelectItem>
                <SelectItem value="B">
                  <div className="flex flex-col items-start">
                    <span>Grade B (Standard)</span>
                    <span className="text-xs text-muted-foreground">Good quality, standard tolerances</span>
                  </div>
                </SelectItem>
                <SelectItem value="C">
                  <div className="flex flex-col items-start">
                    <span>Grade C (Economy)</span>
                    <span className="text-xs text-muted-foreground">Basic quality, wider tolerances</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lead Time */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="lead-time">Lead Time (days)</Label>
              <FieldTooltip content="Average time from placing an order to receiving the material. Used to calculate optimal reorder points and prevent stockouts." />
            </div>
            <Input
              id="lead-time"
              type="number"
              min="0"
              step="1"
              value={formData.lead_time_days || ""}
              onChange={(e) =>
                updateField("lead_time_days", parseInt(e.target.value) || 0)
              }
              placeholder="e.g., 7"
              className={errors.lead_time_days ? "border-destructive" : ""}
            />
            {errors.lead_time_days && (
              <p className="text-xs text-destructive">{errors.lead_time_days}</p>
            )}
          </div>

          {/* Inventory Impact Summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium">How these values affect inventory:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Quality Grade</strong> impacts incoming inspection requirements</li>
              <li>• <strong>Lead Time</strong> affects reorder point calculations</li>
              <li>• <strong>Reorder Threshold</strong> triggers automatic low-stock alerts</li>
              <li>• Lower grade materials may increase product defect rates by 5-15%</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Add Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaterialModal;
