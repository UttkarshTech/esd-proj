import { useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { departmentAPI } from '@/lib/api/departments';
import { type Department } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  description: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DepartmentDialogProps {
  open: boolean;
  department: Department | null;
  onClose: (success?: boolean) => void;
}

export function DepartmentDialog({ open, department, onClose }: DepartmentDialogProps) {
  const { toast } = useToast();
  const isEdit = !!department;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      capacity: 1,
      description: '',
    },
  });

  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name,
        capacity: department.capacity,
        description: department.description || '',
      });
    } else {
      form.reset({
        name: '',
        capacity: 1,
        description: '',
      });
    }
  }, [department, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit) {
        await departmentAPI.update(department.id, values);
        toast({
          title: 'Success',
          description: 'Department updated successfully',
        });
      } else {
        await departmentAPI.create(values);
        toast({
          title: 'Success',
          description: 'Department created successfully',
        });
      }
      onClose(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.data?.message || `Failed to ${isEdit ? 'update' : 'create'} department`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Create'} Department</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update department information'
              : 'Add a new department to the system'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Department description (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose()}>
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
