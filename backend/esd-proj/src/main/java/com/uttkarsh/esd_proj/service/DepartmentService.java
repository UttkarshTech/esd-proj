package com.uttkarsh.esd_proj.service;

import com.uttkarsh.esd_proj.dto.DepartmentRequest;
import com.uttkarsh.esd_proj.dto.DepartmentResponse;
import com.uttkarsh.esd_proj.dto.EmployeeResponse;
import com.uttkarsh.esd_proj.entity.Department;
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
public class DepartmentService {
    
    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    
    public DepartmentService(DepartmentRepository departmentRepository, 
                            EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }
    
    /**
     * Create a new department
     */
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        // Check if department name already exists
        if (departmentRepository.existsByName(request.getName())) {
            throw new BusinessValidationException("Department with name '" + request.getName() + "' already exists");
        }
        
        Department department = new Department();
        department.setName(request.getName());
        department.setCapacity(request.getCapacity());
        department.setDescription(request.getDescription());
        
        Department savedDepartment = departmentRepository.save(department);
        return DepartmentResponse.fromEntity(savedDepartment);
    }
    
    /**
     * Get all departments
     */
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll()
                .stream()
                .map(DepartmentResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * Get department by ID
     */
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return DepartmentResponse.fromEntity(department);
    }
    
    /**
     * Update department
     */
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        
        // Check if new name conflicts with existing department
        if (!department.getName().equals(request.getName()) && 
            departmentRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BusinessValidationException("Department with name '" + request.getName() + "' already exists");
        }
        
        // Check if new capacity is less than current employee count
        long employeeCount = employeeRepository.countByDepartmentId(id);
        if (request.getCapacity() < employeeCount) {
            throw new BusinessValidationException(
                "Cannot reduce capacity to " + request.getCapacity() + 
                ". Department has " + employeeCount + " employees"
            );
        }
        
        department.setName(request.getName());
        department.setCapacity(request.getCapacity());
        department.setDescription(request.getDescription());
        
        Department updatedDepartment = departmentRepository.save(department);
        return DepartmentResponse.fromEntity(updatedDepartment);
    }
    
    /**
     * Delete department
     */
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        
        // Check if department has employees
        long employeeCount = employeeRepository.countByDepartmentId(id);
        if (employeeCount > 0) {
            throw new BusinessValidationException(
                "Cannot delete department. It has " + employeeCount + " employee(s). " +
                "Please reassign or remove employees first."
            );
        }
        
        departmentRepository.delete(department);
    }
    
    /**
     * Get all employees in a department
     */
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployeesByDepartment(Long departmentId) {
        // Verify department exists
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department", "id", departmentId);
        }
        
        return employeeRepository.findByDepartmentId(departmentId)
                .stream()
                .map(EmployeeResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
