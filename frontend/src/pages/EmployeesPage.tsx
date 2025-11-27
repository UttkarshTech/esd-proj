import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { employeeAPI } from '@/lib/api/employees';
import { type Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeDialog } from '@/components/employees/EmployeeDialog';
import { Skeleton } from '@/components/ui/skeleton';

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getAll();
      setEmployees(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCreate = () => {
    setEditingEmployee(null);
    setDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      return;
    }

    try {
      await employeeAPI.delete(employee.id);
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
      loadEmployees();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || 'Failed to delete employee',
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = (success?: boolean) => {
    setDialogOpen(false);
    setEditingEmployee(null);
    if (success) {
      loadEmployees();
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage university employees and their assignments
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
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
      ) : employees.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Employees</CardTitle>
            <CardDescription>
              Get started by adding your first employee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreate} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </CardContent>
        </Card>
      ) : (
        <EmployeeTable
          employees={employees}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <EmployeeDialog
        open={dialogOpen}
        employee={editingEmployee}
        onClose={handleDialogClose}
      />
    </div>
  );
}
