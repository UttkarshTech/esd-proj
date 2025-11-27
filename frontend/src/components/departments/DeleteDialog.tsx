import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type Department } from '@/lib/types';

interface DeleteDialogProps {
  open: boolean;
  department: Department | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ open, department, onClose, onConfirm }: DeleteDialogProps) {
  if (!department) return null;

  const hasEmployees = department.employeeCount > 0;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Department
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{department.name}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {hasEmployees ? (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-medium">Warning: This department has {department.employeeCount} employee(s).</p>
              <p className="mt-2">
                You cannot delete a department with employees. Please reassign or remove all employees first.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The department will be permanently deleted.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={hasEmployees}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
