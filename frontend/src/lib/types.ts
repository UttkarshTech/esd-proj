// TypeScript type definitions for the application

export interface Department {
  id: number;
  name: string;
  capacity: number;
  description: string | null;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentRequest {
  name: string;
  capacity: number;
  description?: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  departmentId: number;
  departmentName: string;
  salary: number | null;
  hireDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  departmentId: number;
  salary?: number;
  hireDate: string; // YYYY-MM-DD
}

export interface User {
  id: number;
  email: string;
  name: string;
  pictureUrl: string;
}

export interface AuthStatus {
  authenticated: boolean;
  email?: string;
  name?: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message?: string;
  errors?: Record<string, string>;
}
