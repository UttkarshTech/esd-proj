package com.uttkarsh.esd_proj.repository;

import com.uttkarsh.esd_proj.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    /**
     * Find all employees in a specific department
     */
    List<Employee> findByDepartmentId(Long departmentId);
    
    /**
     * Find employee by email
     */
    Optional<Employee> findByEmail(String email);
    
    /**
     * Count employees in a specific department
     */
    long countByDepartmentId(Long departmentId);
    
    /**
     * Check if employee exists by email
     */
    boolean existsByEmail(String email);
    
    /**
     * Check if employee exists by email, excluding a specific ID
     * Useful for update operations to check uniqueness
     */
    boolean existsByEmailAndIdNot(String email, Long id);
}
