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
import { toast } from "@/hooks/use-toast";

interface AddMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (material: {
    name: string;
    current_stock: number;
    reorder_threshold: number;
    supplier?: string;
  }) => Promise<void>;
}

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [reorderThreshold, setReorderThreshold] = useState("");
  const [supplier, setSupplier] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    stock?: string;
    threshold?: string;
  }>({});

  const validate = () => {
    const newErrors: { name?: string; stock?: string; threshold?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Material name is required";
    } else if (name.length > 100) {
      newErrors.name = "Material name must be less than 100 characters";
    }

    const stockNum = parseFloat(currentStock);
    if (currentStock && (isNaN(stockNum) || stockNum < 0)) {
      newErrors.stock = "Stock must be a positive number";
    }

    const thresholdNum = parseFloat(reorderThreshold);
    if (reorderThreshold && (isNaN(thresholdNum) || thresholdNum < 0)) {
      newErrors.threshold = "Threshold must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        current_stock: parseFloat(currentStock) || 0,
        reorder_threshold: parseFloat(reorderThreshold) || 0,
        supplier: supplier.trim() || undefined,
      });

      // Reset form
      setName("");
      setCurrentStock("");
      setReorderThreshold("");
      setSupplier("");
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
    setName("");
    setCurrentStock("");
    setReorderThreshold("");
    setSupplier("");
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
          <DialogDescription>
            Enter material details for inventory tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="material-name">Material Name *</Label>
            <Input
              id="material-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Steel Rods 10mm"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-stock">Current Stock</Label>
              <Input
                id="current-stock"
                type="number"
                min="0"
                step="1"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                placeholder="0"
                className={errors.stock ? "border-destructive" : ""}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder-threshold">Reorder Threshold</Label>
              <Input
                id="reorder-threshold"
                type="number"
                min="0"
                step="1"
                value={reorderThreshold}
                onChange={(e) => setReorderThreshold(e.target.value)}
                placeholder="0"
                className={errors.threshold ? "border-destructive" : ""}
              />
              {errors.threshold && (
                <p className="text-xs text-destructive">{errors.threshold}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier (optional)</Label>
            <Input
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g., ABC Steel Suppliers"
            />
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