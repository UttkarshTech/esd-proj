import { get, post, put, del } from './client';
import { type Employee, type EmployeeRequest } from '../types';

export const employeeAPI = {
  async getAll(): Promise<Employee[]> {
    return get<Employee[]>('/api/employees');
  },

  async getById(id: number): Promise<Employee> {
    return get<Employee>(`/api/employees/${id}`);
  },

  async create(data: EmployeeRequest): Promise<Employee> {
    return post<Employee>('/api/employees', data);
  },

  async update(id: number, data: EmployeeRequest): Promise<Employee> {
    return put<Employee>(`/api/employees/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return del(`/api/employees/${id}`);
  },
};
