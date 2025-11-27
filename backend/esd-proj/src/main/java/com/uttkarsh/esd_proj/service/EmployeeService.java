package com.uttkarsh.esd_proj.service;

import com.uttkarsh.esd_proj.dto.EmployeeRequest;
import com.uttkarsh.esd_proj.dto.EmployeeResponse;
import com.uttkarsh.esd_proj.entity.Department;
import com.uttkarsh.esd_proj.entity.Employee;
import com.uttkarsh.esd_proj.exception.BusinessValidationException;
import com.uttkarsh.esd_proj.exception.ResourceNotFoundException;
import com.uttkarsh.esd_proj.repository.DepartmentRepository;
import com.uttkarsh.esd_proj.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeService {
    
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    
    public EmployeeService(EmployeeRepository employeeRepository, 
                          DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
    }
    
    /**
     * Create a new employee
     */
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        // Check if email already exists
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BusinessValidationException("Employee with email '" + request.getEmail() + "' already exists");
        }
        
        // Get department and verify it exists
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
        
        // Check if department has capacity
        long currentEmployeeCount = employeeRepository.countByDepartmentId(request.getDepartmentId());
        if (currentEmployeeCount >= department.getCapacity()) {
            throw new BusinessValidationException(
                "Cannot add employee. Department '" + department.getName() + 
                "' is at full capacity (" + department.getCapacity() + " employees)"
            );
        }
        
        Employee employee = new Employee();
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPosition(request.getPosition());
        employee.setDepartment(department);
        employee.setSalary(request.getSalary());
        employee.setHireDate(request.getHireDate());
        
        Employee savedEmployee = employeeRepository.save(employee);
        return EmployeeResponse.fromEntity(savedEmployee);
    }
    
    /**
     * Get all employees
     */
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(EmployeeResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get employee by ID
     */
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return EmployeeResponse.fromEntity(employee);
    }
    
    /**
     * Update employee
     */
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        
        // Check if new email conflicts with existing employee
        if (!employee.getEmail().equals(request.getEmail()) && 
            employeeRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new BusinessValidationException("Employee with email '" + request.getEmail() + "' already exists");
        }
        
        // If department is being changed
        if (!employee.getDepartment().getId().equals(request.getDepartmentId())) {
            Department newDepartment = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
            
            // Check if new department has capacity
            long employeeCount = employeeRepository.countByDepartmentId(request.getDepartmentId());
            if (employeeCount >= newDepartment.getCapacity()) {
                throw new BusinessValidationException(
                    "Cannot transfer employee. Department '" + newDepartment.getName() + 
                    "' is at full capacity (" + newDepartment.getCapacity() + " employees)"
                );
            }
            
            employee.setDepartment(newDepartment);
        }
        
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPosition(request.getPosition());
        employee.setSalary(request.getSalary());
        employee.setHireDate(request.getHireDate());
        
        Employee updatedEmployee = employeeRepository.save(employee);
        return EmployeeResponse.fromEntity(updatedEmployee);
    }
    
    /**
     * Delete employee
     */
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        
        employeeRepository.delete(employee);
    }
}
