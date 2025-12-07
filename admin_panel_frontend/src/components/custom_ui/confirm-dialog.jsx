"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <DialogContent className="bg-cardBg">
        <DialogHeader>
          <DialogTitle className="text-text">{title}</DialogTitle>
          <DialogDescription className="text-text">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="text-text"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="text-text"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
