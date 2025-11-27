-- Sample Data for Department Management System
-- This script populates the database with sample departments and employees

USE esd_proj;

-- Insert sample departments
INSERT INTO departments (name, capacity, description, created_at, updated_at) VALUES
('Computer Science', 50, 'Department of Computer Science and Engineering', NOW(), NOW()),
('Accounts', 20, 'Finance and Accounts Department', NOW(), NOW()),
('Administration', 30, 'Administrative Department', NOW(), NOW()),
('Human Resources', 15, 'Human Resources and Personnel Management', NOW(), NOW()),
('Research', 25, 'Research and Development Department', NOW(), NOW());

-- Insert sample employees for Computer Science department
INSERT INTO employees (first_name, last_name, email, position, department_id, salary, hire_date, created_at, updated_at) VALUES
('John', 'Doe', 'john.doe@university.edu', 'Professor', 1, 85000.00, '2020-08-15', NOW(), NOW()),
('Jane', 'Smith', 'jane.smith@university.edu', 'Associate Professor', 1, 75000.00, '2021-01-20', NOW(), NOW()),
('Robert', 'Johnson', 'robert.johnson@university.edu', 'Assistant Professor', 1, 65000.00, '2022-03-10', NOW(), NOW()),
('Emily', 'Davis', 'emily.davis@university.edu', 'Lecturer', 1, 55000.00, '2023-07-01', NOW(), NOW());

-- Insert sample employees for Accounts department
INSERT INTO employees (first_name, last_name, email, position, department_id, salary, hire_date, created_at, updated_at) VALUES
('Michael', 'Brown', 'michael.brown@university.edu', 'Chief Accountant', 2, 70000.00, '2019-05-12', NOW(), NOW()),
('Sarah', 'Wilson', 'sarah.wilson@university.edu', 'Senior Accountant', 2, 60000.00, '2020-09-18', NOW(), NOW()),
('David', 'Martinez', 'david.martinez@university.edu', 'Accountant', 2, 50000.00, '2021-11-22', NOW(), NOW()),
('Lisa', 'Anderson', 'lisa.anderson@university.edu', 'Junior Accountant', 2, 45000.00, '2023-02-14', NOW(), NOW());

-- Insert sample employees for Administration department
INSERT INTO employees (first_name, last_name, email, position, department_id, salary, hire_date, created_at, updated_at) VALUES
('William', 'Taylor', 'william.taylor@university.edu', 'Dean', 3, 95000.00, '2018-01-10', NOW(), NOW()),
('Jennifer', 'Thomas', 'jennifer.thomas@university.edu', 'Assistant Dean', 3, 80000.00, '2019-06-15', NOW(), NOW()),
('James', 'Moore', 'james.moore@university.edu', 'Administrative Officer', 3, 55000.00, '2021-04-20', NOW(), NOW());

-- Insert sample employees for Human Resources department
INSERT INTO employees (first_name, last_name, email, position, department_id, salary, hire_date, created_at, updated_at) VALUES
('Mary', 'Jackson', 'mary.jackson@university.edu', 'HR Manager', 4, 75000.00, '2019-03-25', NOW(), NOW()),
('Charles', 'White', 'charles.white@university.edu', 'HR Specialist', 4, 60000.00, '2020-10-30', NOW(), NOW()),
('Patricia', 'Harris', 'patricia.harris@university.edu', 'Recruitment Officer', 4, 55000.00, '2022-01-15', NOW(), NOW());

-- Insert sample employees for Research department
INSERT INTO employees (first_name, last_name, email, position, department_id, salary, hire_date, created_at, updated_at) VALUES
('Thomas', 'Martin', 'thomas.martin@university.edu', 'Research Director', 5, 90000.00, '2018-09-01', NOW(), NOW()),
('Linda', 'Garcia', 'linda.garcia@university.edu', 'Senior Researcher', 5, 75000.00, '2019-11-10', NOW(), NOW()),
('Christopher', 'Rodriguez', 'christopher.rodriguez@university.edu', 'Research Associate', 5, 65000.00, '2021-05-20', NOW(), NOW()),
('Barbara', 'Martinez', 'barbara.martinez@university.edu', 'Junior Researcher', 5, 55000.00, '2023-03-12', NOW(), NOW());
