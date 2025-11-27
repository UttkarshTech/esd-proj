import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { departmentAPI } from '@/lib/api/departments';
import { type Department, type Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [deptData, empData] = await Promise.all([
          departmentAPI.getById(parseInt(id)),
          departmentAPI.getEmployees(parseInt(id)),
        ]);
        setDepartment(deptData);
        setEmployees(empData);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.data?.message || 'Failed to load department details',
          variant: 'destructive',
        });
        navigate('/departments');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, toast]);

  const formatSalary = (salary: number | null) => {
    if (!salary) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="mb-8 h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!department) return null;

  const utilizationPct = (department.employeeCount / department.capacity) * 100;

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => navigate('/departments')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Departments
      </Button>

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{department.name}</h1>
            {department.description && (
              <p className="mt-2 text-muted-foreground">{department.description}</p>
            )}
          </div>
          <Badge
            variant={utilizationPct >= 90 ? 'destructive' : utilizationPct >= 70 ? 'secondary' : 'outline'}
            className="text-lg"
          >
            {department.employeeCount}/{department.capacity} employees
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Department Employees
          </CardTitle>
          <CardDescription>
            {employees.length === 0
              ? 'No employees in this department yet'
              : `${employees.length} ${employees.length === 1 ? 'employee' : 'employees'} in this department`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                No employees assigned to this department
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <Card key={employee.id} className="border-l-4 border-l-primary/50">
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{employee.email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{employee.position}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {employee.salary && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">
                              {formatSalary(employee.salary)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Hired {formatDate(employee.hireDate)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
