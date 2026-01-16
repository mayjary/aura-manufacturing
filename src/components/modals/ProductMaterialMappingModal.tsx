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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export interface MaterialMapping {
  material_id: string;
  material_name: string;
  quantity_per_unit: number;
  wastage_percent: number;
  is_critical: boolean;
}

interface Material {
  id: string;
  name: string;
}

interface ProductMaterialMappingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productId: string;
  availableMaterials: Material[];
  existingMappings?: MaterialMapping[];
  onSave: (mappings: MaterialMapping[]) => Promise<void>;
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

export const ProductMaterialMappingModal: React.FC<ProductMaterialMappingModalProps> = ({
  open,
  onOpenChange,
  productName,
  productId,
  availableMaterials,
  existingMappings = [],
  onSave,
}) => {
  const [mappings, setMappings] = useState<MaterialMapping[]>(existingMappings);
  const [saving, setSaving] = useState(false);

  const addMapping = () => {
    if (availableMaterials.length === 0) {
      toast({
        title: "No materials available",
        description: "Please add materials first before creating mappings.",
        variant: "destructive",
      });
      return;
    }

    const unusedMaterial = availableMaterials.find(
      (m) => !mappings.some((mapping) => mapping.material_id === m.id)
    );

    if (!unusedMaterial) {
      toast({
        title: "All materials mapped",
        description: "All available materials have been added to this product.",
      });
      return;
    }

    setMappings([
      ...mappings,
      {
        material_id: unusedMaterial.id,
        material_name: unusedMaterial.name,
        quantity_per_unit: 1,
        wastage_percent: 0,
        is_critical: false,
      },
    ]);
  };

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const updateMapping = (index: number, updates: Partial<MaterialMapping>) => {
    setMappings(
      mappings.map((mapping, i) =>
        i === index ? { ...mapping, ...updates } : mapping
      )
    );
  };

  const handleMaterialChange = (index: number, materialId: string) => {
    const material = availableMaterials.find((m) => m.id === materialId);
    if (material) {
      updateMapping(index, {
        material_id: materialId,
        material_name: material.name,
      });
    }
  };

  const handleSave = async () => {
    // Validate mappings
    for (const mapping of mappings) {
      if (mapping.quantity_per_unit <= 0) {
        toast({
          title: "Invalid quantity",
          description: "Quantity per unit must be greater than 0",
          variant: "destructive",
        });
        return;
      }
      if (mapping.wastage_percent < 0 || mapping.wastage_percent > 100) {
        toast({
          title: "Invalid wastage",
          description: "Wastage percentage must be between 0 and 100",
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);
    try {
      await onSave(mappings);
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Failed to save mappings",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const usedMaterialIds = mappings.map((m) => m.material_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Material Requirements for {productName}</DialogTitle>
          <DialogDescription>
            Define which materials are needed to produce one unit of this product.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No materials mapped yet.</p>
              <p className="text-sm">Click "Add Material" to define material requirements.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mappings.map((mapping, index) => (
                <GlassCard key={index} className="p-4">
                  <div className="grid gap-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Material Select */}
                      <div className="flex-1 space-y-2">
                        <Label>Material</Label>
                        <Select
                          value={mapping.material_id}
                          onValueChange={(value) => handleMaterialChange(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableMaterials.map((material) => (
                              <SelectItem
                                key={material.id}
                                value={material.id}
                                disabled={
                                  usedMaterialIds.includes(material.id) &&
                                  mapping.material_id !== material.id
                                }
                              >
                                {material.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive mt-6"
                        onClick={() => removeMapping(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Quantity */}
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor={`qty-${index}`}>Quantity per Unit</Label>
                          <FieldTooltip content="How many units of this material are consumed to produce one product unit." />
                        </div>
                        <Input
                          id={`qty-${index}`}
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={mapping.quantity_per_unit}
                          onChange={(e) =>
                            updateMapping(index, {
                              quantity_per_unit: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="1"
                        />
                      </div>

                      {/* Wastage */}
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor={`wastage-${index}`}>Wastage (%)</Label>
                          <FieldTooltip content="Expected material loss during production. Used to calculate actual material requirements and costs." />
                        </div>
                        <Input
                          id={`wastage-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={mapping.wastage_percent}
                          onChange={(e) =>
                            updateMapping(index, {
                              wastage_percent: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Critical Material */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`critical-${index}`}
                        checked={mapping.is_critical}
                        onCheckedChange={(checked) =>
                          updateMapping(index, { is_critical: checked as boolean })
                        }
                      />
                      <div className="flex items-center">
                        <Label htmlFor={`critical-${index}`} className="font-normal cursor-pointer">
                          Mark as critical material
                        </Label>
                        <FieldTooltip content="Critical materials require stricter incoming inspection and have higher priority for reordering. Shortages will block production." />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={addMapping}
            className="gap-2"
            disabled={availableMaterials.length === 0}
          >
            <Plus className="w-4 h-4" /> Add Material
          </Button>

          {/* Summary */}
          {mappings.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <p className="text-sm font-medium">Bill of Materials Summary:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Total materials: {mappings.length}</li>
                <li>• Critical materials: {mappings.filter((m) => m.is_critical).length}</li>
                <li>
                  • Avg. wastage:{" "}
                  {mappings.length > 0
                    ? (
                        mappings.reduce((sum, m) => sum + m.wastage_percent, 0) /
                        mappings.length
                      ).toFixed(1)
                    : 0}
                  %
                </li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Mappings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductMaterialMappingModal;
