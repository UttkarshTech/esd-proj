-- Database Setup Script for Department Management System
-- Create database and user

-- Create database
CREATE DATABASE IF NOT EXISTS esd_proj;

-- Create user and grant privileges
CREATE USER IF NOT EXISTS 'utr12'@'localhost' IDENTIFIED BY '123450';
GRANT ALL PRIVILEGES ON esd_proj.* TO 'utr12'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE esd_proj;

-- Tables will be created automatically by Hibernate, but we can verify the structure
-- The following tables will be created:
-- 1. users (for OAuth2 authentication)
-- 2. departments
-- 3. employees
