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
import { HelpCircle, Plus, Trash2, GripVertical } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export type DefectType = "surface" | "dimensional" | "functional";

export interface ChecklistItem {
  id: string;
  name: string;
  defect_type: DefectType;
  severity_weight: number;
  is_critical: boolean;
  order: number;
}

interface ProductChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productId: string;
  existingChecklist?: ChecklistItem[];
  onSave: (checklist: ChecklistItem[]) => Promise<void>;
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

const defectTypeDescriptions: Record<DefectType, string> = {
  surface: "Scratches, dents, discoloration, coating issues",
  dimensional: "Size, shape, tolerance, alignment deviations",
  functional: "Performance, operation, assembly, fit issues",
};

export const ProductChecklistModal: React.FC<ProductChecklistModalProps> = ({
  open,
  onOpenChange,
  productName,
  productId,
  existingChecklist = [],
  onSave,
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    existingChecklist.length > 0
      ? existingChecklist
      : []
  );
  const [saving, setSaving] = useState(false);

  const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: generateId(),
      name: "",
      defect_type: "surface",
      severity_weight: 1,
      is_critical: false,
      order: checklist.length + 1,
    };
    setChecklist([...checklist, newItem]);
  };

  const removeItem = (id: string) => {
    setChecklist(
      checklist
        .filter((item) => item.id !== id)
        .map((item, index) => ({ ...item, order: index + 1 }))
    );
  };

  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const handleSave = async () => {
    // Validate checklist
    for (const item of checklist) {
      if (!item.name.trim()) {
        toast({
          title: "Invalid checklist item",
          description: "All checklist items must have a name",
          variant: "destructive",
        });
        return;
      }
      if (item.severity_weight < 1 || item.severity_weight > 5) {
        toast({
          title: "Invalid severity weight",
          description: "Severity weight must be between 1 and 5",
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);
    try {
      await onSave(checklist);
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Failed to save checklist",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalWeight = checklist.reduce((sum, item) => sum + item.severity_weight, 0);
  const criticalCount = checklist.filter((item) => item.is_critical).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quality Checklist for {productName}</DialogTitle>
          <DialogDescription>
            Define inspection items that workers will verify during quality control.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Explanation Box */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-medium">How checklist affects quality scoring:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Each failed item contributes to the defect count</li>
              <li>• <strong>Severity Weight (1-5)</strong>: Higher weights have more impact on quality score</li>
              <li>• <strong>Critical Items</strong>: A single failure immediately marks the unit for rework/rejection</li>
              <li>• Quality Score = 100 × (1 - weighted_failures / total_weight)</li>
            </ul>
          </div>

          {checklist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No checklist items defined yet.</p>
              <p className="text-sm">Click "Add Item" to create inspection points.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checklist.map((item, index) => (
                <GlassCard key={item.id} className="p-4">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center text-muted-foreground mt-2">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-xs font-medium ml-1">#{item.order}</span>
                      </div>

                      {/* Item Name */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor={`name-${item.id}`}>Inspection Point *</Label>
                          <FieldTooltip content="A clear, actionable description of what to inspect. Workers will mark this as Pass or Fail." />
                        </div>
                        <Input
                          id={`name-${item.id}`}
                          value={item.name}
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          placeholder="e.g., Surface finish free of scratches"
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive mt-6"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 ml-7">
                      {/* Defect Type */}
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label>Defect Type</Label>
                          <FieldTooltip content="Categorizes the type of defect. Used for defect analysis and Pareto charts." />
                        </div>
                        <Select
                          value={item.defect_type}
                          onValueChange={(value: DefectType) =>
                            updateItem(item.id, { defect_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="surface">
                              <div className="flex flex-col items-start">
                                <span>Surface</span>
                                <span className="text-xs text-muted-foreground">
                                  {defectTypeDescriptions.surface}
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="dimensional">
                              <div className="flex flex-col items-start">
                                <span>Dimensional</span>
                                <span className="text-xs text-muted-foreground">
                                  {defectTypeDescriptions.dimensional}
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="functional">
                              <div className="flex flex-col items-start">
                                <span>Functional</span>
                                <span className="text-xs text-muted-foreground">
                                  {defectTypeDescriptions.functional}
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Severity Weight */}
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor={`weight-${item.id}`}>Severity (1-5)</Label>
                          <FieldTooltip content="1 = Minor cosmetic issue. 5 = Critical safety/function defect. Higher values have more impact on quality score." />
                        </div>
                        <Select
                          value={item.severity_weight.toString()}
                          onValueChange={(value) =>
                            updateItem(item.id, { severity_weight: parseInt(value) })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="1" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Minor</SelectItem>
                            <SelectItem value="2">2 - Low</SelectItem>
                            <SelectItem value="3">3 - Medium</SelectItem>
                            <SelectItem value="4">4 - High</SelectItem>
                            <SelectItem value="5">5 - Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Critical Checkbox */}
                      <div className="space-y-2 flex flex-col justify-end">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`critical-${item.id}`}
                            checked={item.is_critical}
                            onCheckedChange={(checked) =>
                              updateItem(item.id, { is_critical: checked as boolean })
                            }
                          />
                          <div className="flex items-center">
                            <Label
                              htmlFor={`critical-${item.id}`}
                              className="font-normal cursor-pointer"
                            >
                              Critical
                            </Label>
                            <FieldTooltip content="Critical items cause immediate rejection if failed. Use for safety-critical or major functional requirements." />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" onClick={addItem} className="gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </Button>

          {/* Summary Stats */}
          {checklist.length > 0 && (
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <p className="text-2xl font-semibold">{checklist.length}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <p className="text-2xl font-semibold">{totalWeight}</p>
                <p className="text-xs text-muted-foreground">Total Weight</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <p className="text-2xl font-semibold text-destructive">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">Critical Items</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Checklist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductChecklistModal;
