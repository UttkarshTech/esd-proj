import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { departmentAPI } from '@/lib/api/departments';
import { type Department } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { DepartmentTable } from '@/components/departments/DepartmentTable';
import { DepartmentDialog } from '@/components/departments/DepartmentDialog';
import { DeleteDialog } from '@/components/departments/DeleteDialog';
import { Skeleton } from '@/components/ui/skeleton';

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const { toast } = useToast();

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentAPI.getAll();
      setDepartments(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to load departments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreate = () => {
    setEditingDepartment(null);
    setDialogOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setDialogOpen(true);
  };

  const handleDelete = (department: Department) => {
    setDeletingDepartment(department);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = (success?: boolean) => {
    setDialogOpen(false);
    setEditingDepartment(null);
    if (success) {
      loadDepartments();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDepartment) return;

    try {
      await departmentAPI.delete(deletingDepartment.id);
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });
      loadDepartments();
      setDeleteDialogOpen(false);
      setDeletingDepartment(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to delete department',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage university departments and their capacity
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : departments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Departments</CardTitle>
            <CardDescription>
              Get started by creating your first department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreate} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DepartmentTable
          departments={departments}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <DepartmentDialog
        open={dialogOpen}
        department={editingDepartment}
        onClose={handleDialogClose}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        department={deletingDepartment}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingDepartment(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
