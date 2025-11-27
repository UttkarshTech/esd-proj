import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { employeeAPI } from '@/lib/api/employees';
import { departmentAPI } from '@/lib/api/departments';
import { type Employee, type Department } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  position: z.string().min(1, 'Position is required').max(100),
  departmentId: z.number({ required_error: 'Department is required' }),
  salary: z.number().positive('Salary must be positive').optional().or(z.literal(0)),
  hireDate: z.string().min(1, 'Hire date is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface EmployeeDialogProps {
  open: boolean;
  employee: Employee | null;
  onClose: (success?: boolean) => void;
}

export function EmployeeDialog({ open, employee, onClose }: EmployeeDialogProps) {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const isEdit = !!employee;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      departmentId: undefined,
      salary: undefined,
      hireDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepts(true);
        const data = await departmentAPI.getAll();
        setDepartments(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load departments',
          variant: 'destructive',
        });
      } finally {
        setLoadingDepts(false);
      }
    };

    if (open) {
      loadDepartments();
    }
  }, [open, toast]);

  useEffect(() => {
    if (employee) {
      form.reset({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        position: employee.position,
        departmentId: employee.departmentId,
        salary: employee.salary || undefined,
        hireDate: employee.hireDate,
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        departmentId: undefined,
        salary: undefined,
        hireDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [employee, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        salary: values.salary || undefined,
      };

      if (isEdit) {
        await employeeAPI.update(employee.id, payload);
        toast({
          title: 'Success',
          description: 'Employee updated successfully',
        });
      } else {
        await employeeAPI.create(payload);
        toast({
          title: 'Success',
          description: 'Employee created successfully',
        });
      }
      onClose(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || `Failed to ${isEdit ? 'update' : 'create'} employee`,
        variant: 'destructive',
      });
    }
  };

  const selectedDept = form.watch('departmentId');
  const selectedDepartment = departments.find((d) => d.id === selectedDept);
  const showCapacityWarning =
    selectedDepartment &&
    !isEdit &&
    selectedDepartment.employeeCount >= selectedDepartment.capacity;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Add'} Employee</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update employee information and department assignment'
              : 'Add a new employee to a department'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@university.edu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Professor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString() || ''}
                    disabled={loadingDepts}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name} ({dept.employeeCount}/{dept.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showCapacityWarning && (
                    <p className="text-sm text-destructive">
                      Warning: This department is at full capacity
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="65000"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? parseFloat(val) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hire Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button type="submit" disabled={showCapacityWarning && !isEdit}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
