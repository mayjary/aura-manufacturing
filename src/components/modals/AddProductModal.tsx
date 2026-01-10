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

export interface ProductFormData {
  name: string;
  expected_defect_percent: number;
  criticality_level: "low" | "medium" | "high";
  standard_cycle_time: number;
  standard_inspection_time: number;
  inspection_type: "manual" | "automated" | "hybrid";
  quality_tolerance: number;
}

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: ProductFormData) => Promise<void>;
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

export const AddProductModal: React.FC<AddProductModalProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    expected_defect_percent: 0,
    criticality_level: "medium",
    standard_cycle_time: 0,
    standard_inspection_time: 0,
    inspection_type: "manual",
    quality_tolerance: 0,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Product name must be less than 100 characters";
    }

    if (formData.expected_defect_percent < 0 || formData.expected_defect_percent > 100) {
      newErrors.expected_defect_percent = "Must be between 0 and 100";
    }

    if (formData.standard_cycle_time < 0) {
      newErrors.standard_cycle_time = "Must be a positive number";
    }

    if (formData.standard_inspection_time < 0) {
      newErrors.standard_inspection_time = "Must be a positive number";
    }

    if (formData.quality_tolerance < 0 || formData.quality_tolerance > 100) {
      newErrors.quality_tolerance = "Must be between 0 and 100";
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
      });

      // Reset form
      setFormData({
        name: "",
        expected_defect_percent: 0,
        criticality_level: "medium",
        standard_cycle_time: 0,
        standard_inspection_time: 0,
        inspection_type: "manual",
        quality_tolerance: 0,
      });
      setErrors({});
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Failed to add product",
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
      expected_defect_percent: 0,
      criticality_level: "medium",
      standard_cycle_time: 0,
      standard_inspection_time: 0,
      inspection_type: "manual",
      quality_tolerance: 0,
    });
    setErrors({});
    onOpenChange(false);
  };

  const updateField = <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Define product specifications for quality control and SPC analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Product Name */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="product-name">Product Name *</Label>
              <FieldTooltip content="A unique identifier for your product. Used across all QC reports and dashboards." />
            </div>
            <Input
              id="product-name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g., Engine Assembly A-Series"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Expected Defect Percentage */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="expected-defect">Expected Defect Rate (%)</Label>
              <FieldTooltip content="Historical or target defect rate. Used in SPC calculations to determine control limits (UCL/LCL). A lower value sets stricter quality standards." />
            </div>
            <Input
              id="expected-defect"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.expected_defect_percent || ""}
              onChange={(e) =>
                updateField("expected_defect_percent", parseFloat(e.target.value) || 0)
              }
              placeholder="e.g., 2.5"
              className={errors.expected_defect_percent ? "border-destructive" : ""}
            />
            {errors.expected_defect_percent && (
              <p className="text-xs text-destructive">{errors.expected_defect_percent}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Industry benchmark: 1-3% for precision manufacturing, 3-5% for general assembly.
            </p>
          </div>

          {/* Criticality Level */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label>Criticality Level</Label>
              <FieldTooltip content="Determines inspection rigor. High criticality products require 100% inspection, while low criticality allows sampling-based QC." />
            </div>
            <Select
              value={formData.criticality_level}
              onValueChange={(value: "low" | "medium" | "high") =>
                updateField("criticality_level", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select criticality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex flex-col items-start">
                    <span>Low</span>
                    <span className="text-xs text-muted-foreground">Sample-based inspection (10-20%)</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex flex-col items-start">
                    <span>Medium</span>
                    <span className="text-xs text-muted-foreground">Random batch inspection (30-50%)</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex flex-col items-start">
                    <span>High</span>
                    <span className="text-xs text-muted-foreground">100% inspection required</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cycle and Inspection Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="cycle-time">Cycle Time (min)</Label>
                <FieldTooltip content="Standard time to produce one unit. Used to calculate throughput and identify bottlenecks." />
              </div>
              <Input
                id="cycle-time"
                type="number"
                min="0"
                step="0.5"
                value={formData.standard_cycle_time || ""}
                onChange={(e) =>
                  updateField("standard_cycle_time", parseFloat(e.target.value) || 0)
                }
                placeholder="e.g., 15"
                className={errors.standard_cycle_time ? "border-destructive" : ""}
              />
              {errors.standard_cycle_time && (
                <p className="text-xs text-destructive">{errors.standard_cycle_time}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="inspection-time">Inspection Time (min)</Label>
                <FieldTooltip content="Time required for quality inspection per unit. Affects overall production scheduling." />
              </div>
              <Input
                id="inspection-time"
                type="number"
                min="0"
                step="0.5"
                value={formData.standard_inspection_time || ""}
                onChange={(e) =>
                  updateField("standard_inspection_time", parseFloat(e.target.value) || 0)
                }
                placeholder="e.g., 5"
                className={errors.standard_inspection_time ? "border-destructive" : ""}
              />
              {errors.standard_inspection_time && (
                <p className="text-xs text-destructive">{errors.standard_inspection_time}</p>
              )}
            </div>
          </div>

          {/* Inspection Type */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label>Inspection Type</Label>
              <FieldTooltip content="Manual: Human inspectors with checklists. Automated: Machine vision or sensors. Hybrid: Combination of both for critical checks." />
            </div>
            <Select
              value={formData.inspection_type}
              onValueChange={(value: "manual" | "automated" | "hybrid") =>
                updateField("inspection_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select inspection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Inspection</SelectItem>
                <SelectItem value="automated">Automated (Machine Vision)</SelectItem>
                <SelectItem value="hybrid">Hybrid (Manual + Automated)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Tolerance */}
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="quality-tolerance">Quality Tolerance (%)</Label>
              <FieldTooltip content="Acceptable deviation from specification. Used to determine pass/fail thresholds in QC scoring. Lower tolerance = stricter quality." />
            </div>
            <Input
              id="quality-tolerance"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.quality_tolerance || ""}
              onChange={(e) =>
                updateField("quality_tolerance", parseFloat(e.target.value) || 0)
              }
              placeholder="e.g., 5"
              className={errors.quality_tolerance ? "border-destructive" : ""}
            />
            {errors.quality_tolerance && (
              <p className="text-xs text-destructive">{errors.quality_tolerance}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Affects quality score calculation: Score = 100 - (actual_defect / tolerance) × weight
            </p>
          </div>

          {/* SPC Impact Summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium">How these values affect quality scoring:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Expected Defect Rate</strong> sets the baseline for SPC control limits</li>
              <li>• <strong>Criticality Level</strong> determines inspection frequency and sampling size</li>
              <li>• <strong>Quality Tolerance</strong> defines the pass/fail threshold for individual units</li>
              <li>• Products with higher criticality weight defects more heavily in scoring</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
