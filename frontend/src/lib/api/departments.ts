import { get, post, put, del } from './client';
import { type Department, type DepartmentRequest, type Employee } from '../types';

export const departmentAPI = {
  async getAll(): Promise<Department[]> {
    return get<Department[]>('/api/departments');
  },

  async getById(id: number): Promise<Department> {
    return get<Department>(`/api/departments/${id}`);
  },

  async create(data: DepartmentRequest): Promise<Department> {
    return post<Department>('/api/departments', data);
  },

  async update(id: number, data: DepartmentRequest): Promise<Department> {
    return put<Department>(`/api/departments/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    return del(`/api/departments/${id}`);
  },

  async getEmployees(id: number): Promise<Employee[]> {
    return get<Employee[]>(`/api/departments/${id}/employees`);
  },
};
