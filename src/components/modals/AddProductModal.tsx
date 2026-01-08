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

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: { name: string; defect_rate: number }) => Promise<void>;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [expectedDefectPercent, setExpectedDefectPercent] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; defect?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; defect?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Product name is required";
    } else if (name.length > 100) {
      newErrors.name = "Product name must be less than 100 characters";
    }

    const defectNum = parseFloat(expectedDefectPercent);
    if (expectedDefectPercent && (isNaN(defectNum) || defectNum < 0 || defectNum > 100)) {
      newErrors.defect = "Defect percentage must be between 0 and 100";
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
        defect_rate: parseFloat(expectedDefectPercent) || 0,
      });
      
      // Reset form
      setName("");
      setExpectedDefectPercent("");
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
    setName("");
    setExpectedDefectPercent("");
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter product details. The expected defect percentage helps calculate quality scores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Engine Assembly A-Series"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected-defect">Expected Defect Percentage (%)</Label>
            <Input
              id="expected-defect"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={expectedDefectPercent}
              onChange={(e) => setExpectedDefectPercent(e.target.value)}
              placeholder="e.g., 2.5"
              className={errors.defect ? "border-destructive" : ""}
            />
            {errors.defect && (
              <p className="text-xs text-destructive">{errors.defect}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Leave blank or set to 0 if unknown. This is used for SPC quality calculations.
            </p>
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