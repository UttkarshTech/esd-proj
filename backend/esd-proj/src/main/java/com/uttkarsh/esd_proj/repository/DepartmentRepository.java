package com.uttkarsh.esd_proj.repository;

import com.uttkarsh.esd_proj.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    /**
     * Find department by name (case-sensitive)
     */
    Optional<Department> findByName(String name);
    
    /**
     * Check if department exists by name
     */
    boolean existsByName(String name);
    
    /**
     * Check if department exists by name, excluding a specific ID
     * Useful for update operations to check uniqueness
     */
    boolean existsByNameAndIdNot(String name, Long id);
}
