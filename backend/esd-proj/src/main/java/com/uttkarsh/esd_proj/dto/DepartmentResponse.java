package com.uttkarsh.esd_proj.dto;

import com.uttkarsh.esd_proj.entity.Department;

import java.time.LocalDateTime;

public class DepartmentResponse {
    
    private Long id;
    private String name;
    private Integer capacity;
    private String description;
    private Integer employeeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public DepartmentResponse() {
    }
    
    public DepartmentResponse(Long id, String name, Integer capacity, String description, 
                             Integer employeeCount, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.description = description;
        this.employeeCount = employeeCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Static factory method
    public static DepartmentResponse fromEntity(Department department) {
        return new DepartmentResponse(
            department.getId(),
            department.getName(),
            department.getCapacity(),
            department.getDescription(),
            department.getEmployeeCount(),
            department.getCreatedAt(),
            department.getUpdatedAt()
        );
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Integer getCapacity() {
        return capacity;
    }
    
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getEmployeeCount() {
        return employeeCount;
    }
    
    public void setEmployeeCount(Integer employeeCount) {
        this.employeeCount = employeeCount;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
