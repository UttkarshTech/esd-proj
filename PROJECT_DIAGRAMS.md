# Project Diagrams - ESD Employee Management System

---

## Class Diagrams

### Entity Relationship Diagram

```mermaid
classDiagram
    class User {
        +Long id
        +String email
        +String name
        +String pictureUrl
        +String provider
        +String providerId
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }
    
    class Department {
        +Long id
        +String name
        +Integer capacity
        +String description
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
        +getEmployeeCount() int
        +isAtCapacity() boolean
    }
    
    class Employee {
        +Long id
        +String firstName
        +String lastName
        +String email
        +String position
        +BigDecimal salary
        +LocalDate hireDate
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
        +getFullName() String
    }
    
    Department "1" --o "many" Employee : contains
    
    note for Department "Capacity: Max employees\nOne-to-Many relationship"
    note for Employee "ManyToOne with Department\nUnique email constraint"
    note for User "OAuth2 authenticated users\nGoogle provider integration"
```

### Service Layer Architecture

```mermaid
classDiagram
    class EmployeeService {
        -EmployeeRepository employeeRepository
        -DepartmentRepository departmentRepository
        +createEmployee(EmployeeRequest) EmployeeResponse
        +getAllEmployees() List~EmployeeResponse~
        +getEmployeeById(Long) EmployeeResponse
        +updateEmployee(Long, EmployeeRequest) EmployeeResponse
        +deleteEmployee(Long) void
    }
    
    class DepartmentService {
        -DepartmentRepository departmentRepository
        +createDepartment(DepartmentRequest) DepartmentResponse
        +getAllDepartments() List~DepartmentResponse~
        +getDepartmentById(Long) DepartmentResponse
        +updateDepartment(Long, DepartmentRequest) DepartmentResponse
        +deleteDepartment(Long) void
    }
    
    class CustomOAuth2UserService {
        -UserRepository userRepository
        +loadUser(OAuth2UserRequest) OAuth2User
        -processOAuth2User(OAuth2UserRequest, OAuth2User) void
    }
    
    class EmployeeRepository {
        <<interface>>
        +findByEmail(String) Optional~Employee~
        +findByDepartmentId(Long) List~Employee~
    }
    
    class DepartmentRepository {
        <<interface>>
        +findByName(String) Optional~Department~
    }
    
    class UserRepository {
        <<interface>>
        +findByProviderAndProviderId(String, String) Optional~User~
    }
    
    EmployeeService --> EmployeeRepository : uses
    EmployeeService --> DepartmentRepository : validates department
    DepartmentService --> DepartmentRepository : uses
    CustomOAuth2UserService --> UserRepository : uses
```

### Controller Layer

```mermaid
classDiagram
    class AuthController {
        +getAuthStatus() ResponseEntity
        +getCurrentUser(Authentication) ResponseEntity
    }
    
    class EmployeeController {
        -EmployeeService employeeService
        +createEmployee(EmployeeRequest) ResponseEntity
        +getAllEmployees() ResponseEntity
        +getEmployeeById(Long) ResponseEntity
        +updateEmployee(Long, EmployeeRequest) ResponseEntity
        +deleteEmployee(Long) ResponseEntity
    }
    
    class DepartmentController {
        -DepartmentService departmentService
        +createDepartment(DepartmentRequest) ResponseEntity
        +getAllDepartments() ResponseEntity
        +getDepartmentById(Long) ResponseEntity
        +updateDepartment(Long, DepartmentRequest) ResponseEntity
        +deleteDepartment(Long) ResponseEntity
    }
    
    class LoginController {
        +login() String
    }
    
    class EmployeeService {
        <<service>>
    }
    
    class DepartmentService {
        <<service>>
    }
    
    EmployeeController --> EmployeeService : delegates to
    DepartmentController --> DepartmentService : delegates to
```

### Exception Handling Architecture

```mermaid
classDiagram
    class GlobalExceptionHandler {
        +handleResourceNotFound(ResourceNotFoundException) ResponseEntity
        +handleBusinessValidation(BusinessValidationException) ResponseEntity
        +handleMethodArgNotValid(MethodArgumentNotValidException) ResponseEntity
        +handleConstraintViolation(ConstraintViolationException) ResponseEntity
        +handleGenericException(Exception) ResponseEntity
    }
    
    class ResourceNotFoundException {
        +ResourceNotFoundException(String message)
    }
    
    class BusinessValidationException {
        +BusinessValidationException(String message)
    }
    
    GlobalExceptionHandler ..> ResourceNotFoundException : handles
    GlobalExceptionHandler ..> BusinessValidationException : handles
    
    note for GlobalExceptionHandler "Centralized exception handling\nReturns consistent error responses"
```

---

## Flow Diagrams

### 1. OAuth2 Google Login Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant Google
    participant CustomOAuth2UserService
    participant UserRepository
    participant SuccessHandler
    
    User->>Frontend: Click "Login with Google"
    Frontend->>Backend: GET /oauth2/authorization/google
    Backend->>Google: Redirect to Google Login
    Google->>User: Show Google Login Page
    User->>Google: Enter credentials & authorize
    Google->>Backend: Redirect with authorization code
    Backend->>Google: Exchange code for access token
    Google->>Backend: Return access token
    Backend->>CustomOAuth2UserService: loadUser(OAuth2UserRequest)
    CustomOAuth2UserService->>Google: Fetch user info
    Google->>CustomOAuth2UserService: Return user attributes
    CustomOAuth2UserService->>UserRepository: findByProviderAndProviderId()
    
    alt User exists
        UserRepository-->>CustomOAuth2UserService: Return existing user
        CustomOAuth2UserService->>UserRepository: Update user info
    else New user
        UserRepository-->>CustomOAuth2UserService: Return empty
        CustomOAuth2UserService->>UserRepository: Create new user
    end
    
    CustomOAuth2UserService-->>Backend: Return OAuth2User
    Backend->>SuccessHandler: onAuthenticationSuccess()
    SuccessHandler->>Frontend: Redirect to http://localhost:5173/
    Frontend->>Backend: GET /api/auth/status
    Backend-->>Frontend: Return authenticated status
    Frontend->>User: Show dashboard
```

### 2. Logout Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant AuthController
    participant SecurityContext
    participant Session
    
    User->>Frontend: Click "Logout" button
    Frontend->>Frontend: Show confirmation (optional)
    Frontend->>AuthController: POST /api/auth/logout
    
    AuthController->>AuthController: Check authentication
    
    alt User not authenticated
        AuthController-->>Frontend: 401 Unauthorized
        Frontend->>User: Show error message
    else User authenticated
        AuthController->>AuthController: Get user email from principal
        AuthController->>Session: invalidate()
        Session-->>AuthController: Session invalidated
        
        AuthController->>SecurityContext: clearContext()
        SecurityContext-->>AuthController: Context cleared
        
        AuthController->>AuthController: Clear JSESSIONID cookie
        Note over AuthController: Set cookie maxAge=0
        
        AuthController-->>Frontend: 200 OK<br/>{"message": "Logged out successfully"}
        
        Frontend->>Frontend: Clear local auth state
        Frontend->>User: Redirect to login page
    end
```

### 3. Create Employee Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant EmployeeController
    participant EmployeeService
    participant DepartmentRepository
    participant EmployeeRepository
    participant ExceptionHandler
    
    User->>Frontend: Fill employee form & submit
    Frontend->>EmployeeController: POST /api/employees<br/>(EmployeeRequest)
    
    EmployeeController->>EmployeeService: createEmployee(request)
    
    EmployeeService->>EmployeeRepository: findByEmail(email)
    
    alt Email already exists
        EmployeeRepository-->>EmployeeService: Return existing employee
        EmployeeService-->>ExceptionHandler: Throw BusinessValidationException
        ExceptionHandler-->>Frontend: 400 Bad Request
        Frontend->>User: Show error message
    else Email not found
        EmployeeRepository-->>EmployeeService: Return empty
        EmployeeService->>DepartmentRepository: findById(departmentId)
        
        alt Department not found
            DepartmentRepository-->>EmployeeService: Return empty
            EmployeeService-->>ExceptionHandler: Throw ResourceNotFoundException
            ExceptionHandler-->>Frontend: 404 Not Found
            Frontend->>User: Show error message
        else Department found
            DepartmentRepository-->>EmployeeService: Return department
            
            alt Department at capacity
                EmployeeService-->>ExceptionHandler: Throw BusinessValidationException
                ExceptionHandler-->>Frontend: 400 Bad Request
                Frontend->>User: Show capacity error
            else Department has space
                EmployeeService->>EmployeeRepository: save(employee)
                EmployeeRepository-->>EmployeeService: Return saved employee
                EmployeeService-->>EmployeeController: Return EmployeeResponse
                EmployeeController-->>Frontend: 201 Created
                Frontend->>User: Show success message
            end
        end
    end
```

### 4. Get All Employees Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant EmployeeController
    participant EmployeeService
    participant EmployeeRepository
    
    User->>Frontend: Navigate to Employees page
    Frontend->>EmployeeController: GET /api/employees
    EmployeeController->>EmployeeService: getAllEmployees()
    EmployeeService->>EmployeeRepository: findAll()
    EmployeeRepository-->>EmployeeService: Return List~Employee~
    
    EmployeeService->>EmployeeService: Convert to List~EmployeeResponse~
    EmployeeService-->>EmployeeController: Return List~EmployeeResponse~
    EmployeeController-->>Frontend: 200 OK + employee list
    Frontend->>User: Display employee table
```

### 5. Update Employee Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant EmployeeController
    participant EmployeeService
    participant EmployeeRepository
    participant DepartmentRepository
    participant ExceptionHandler
    
    User->>Frontend: Edit employee & submit
    Frontend->>EmployeeController: PUT /api/employees/{id}<br/>(EmployeeRequest)
    EmployeeController->>EmployeeService: updateEmployee(id, request)
    
    EmployeeService->>EmployeeRepository: findById(id)
    
    alt Employee not found
        EmployeeRepository-->>EmployeeService: Return empty
        EmployeeService-->>ExceptionHandler: Throw ResourceNotFoundException
        ExceptionHandler-->>Frontend: 404 Not Found
        Frontend->>User: Show error message
    else Employee found
        EmployeeRepository-->>EmployeeService: Return employee
        
        alt Email changed
            EmployeeService->>EmployeeRepository: findByEmail(newEmail)
            alt Email exists for another employee
                EmployeeRepository-->>EmployeeService: Return different employee
                EmployeeService-->>ExceptionHandler: Throw BusinessValidationException
                ExceptionHandler-->>Frontend: 400 Bad Request
                Frontend->>User: Show email conflict error
            else Email available
                EmployeeRepository-->>EmployeeService: Return empty
                EmployeeService->>EmployeeService: Update email
            end
        end
        
        alt Department changed
            EmployeeService->>DepartmentRepository: findById(newDepartmentId)
            alt Department not found
                DepartmentRepository-->>EmployeeService: Return empty
                EmployeeService-->>ExceptionHandler: Throw ResourceNotFoundException
                ExceptionHandler-->>Frontend: 404 Not Found
                Frontend->>User: Show error message
            else Department found
                DepartmentRepository-->>EmployeeService: Return department
                alt New department at capacity
                    EmployeeService-->>ExceptionHandler: Throw BusinessValidationException
                    ExceptionHandler-->>Frontend: 400 Bad Request
                    Frontend->>User: Show capacity error
                else Department has space
                    EmployeeService->>EmployeeService: Update department
                end
            end
        end
        
        EmployeeService->>EmployeeService: Update employee fields
        EmployeeService->>EmployeeRepository: save(employee)
        EmployeeRepository-->>EmployeeService: Return updated employee
        EmployeeService-->>EmployeeController: Return EmployeeResponse
        EmployeeController-->>Frontend: 200 OK
        Frontend->>User: Show success message
    end
```

### 6. Delete Employee Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant EmployeeController
    participant EmployeeService
    participant EmployeeRepository
    participant ExceptionHandler
    
    User->>Frontend: Click delete button
    Frontend->>Frontend: Show confirmation dialog
    User->>Frontend: Confirm deletion
    Frontend->>EmployeeController: DELETE /api/employees/{id}
    EmployeeController->>EmployeeService: deleteEmployee(id)
    
    EmployeeService->>EmployeeRepository: findById(id)
    
    alt Employee not found
        EmployeeRepository-->>EmployeeService: Return empty
        EmployeeService-->>ExceptionHandler: Throw ResourceNotFoundException
        ExceptionHandler-->>Frontend: 404 Not Found
        Frontend->>User: Show error message
    else Employee found
        EmployeeRepository-->>EmployeeService: Return employee
        EmployeeService->>EmployeeRepository: deleteById(id)
        EmployeeRepository-->>EmployeeService: Success
        EmployeeService-->>EmployeeController: void (success)
        EmployeeController-->>Frontend: 204 No Content
        Frontend->>User: Show success message & refresh list
    end
```

### 7. Create Department Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant DepartmentController
    participant DepartmentService
    participant DepartmentRepository
    participant ExceptionHandler
    
    User->>Frontend: Fill department form & submit
    Frontend->>DepartmentController: POST /api/departments<br/>(DepartmentRequest)
    DepartmentController->>DepartmentService: createDepartment(request)
    
    DepartmentService->>DepartmentRepository: findByName(name)
    
    alt Department name exists
        DepartmentRepository-->>DepartmentService: Return existing department
        DepartmentService-->>ExceptionHandler: Throw BusinessValidationException
        ExceptionHandler-->>Frontend: 400 Bad Request
        Frontend->>User: Show "Department already exists" error
    else Department name available
        DepartmentRepository-->>DepartmentService: Return empty
        DepartmentService->>DepartmentService: Create new Department entity
        DepartmentService->>DepartmentRepository: save(department)
        DepartmentRepository-->>DepartmentService: Return saved department
        DepartmentService-->>DepartmentController: Return DepartmentResponse
        DepartmentController-->>Frontend: 201 Created
        Frontend->>User: Show success message
    end
```

### 8. Update Department Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant DepartmentController
    participant DepartmentService
    participant DepartmentRepository
    participant ExceptionHandler
    
    User->>Frontend: Edit department & submit
    Frontend->>DepartmentController: PUT /api/departments/{id}<br/>(DepartmentRequest)
    DepartmentController->>DepartmentService: updateDepartment(id, request)
    
    DepartmentService->>DepartmentRepository: findById(id)
    
    alt Department not found
        DepartmentRepository-->>DepartmentService: Return empty
        DepartmentService-->>ExceptionHandler: Throw ResourceNotFoundException
        ExceptionHandler-->>Frontend: 404 Not Found
        Frontend->>User: Show error message
    else Department found
        DepartmentRepository-->>DepartmentService: Return department
        
        alt Name changed
            DepartmentService->>DepartmentRepository: findByName(newName)
            alt Name exists for another department
                DepartmentRepository-->>DepartmentService: Return different department
                DepartmentService-->>ExceptionHandler: Throw BusinessValidationException
                ExceptionHandler-->>Frontend: 400 Bad Request
                Frontend->>User: Show name conflict error
            else Name available
                DepartmentRepository-->>DepartmentService: Return empty
            end
        end
        
        alt Capacity reduced below current employees
            DepartmentService->>DepartmentService: Check employeeCount vs newCapacity
            DepartmentService-->>ExceptionHandler: Throw BusinessValidationException
            ExceptionHandler-->>Frontend: 400 Bad Request
            Frontend->>User: Show capacity error
        else Capacity valid
            DepartmentService->>DepartmentService: Update department fields
            DepartmentService->>DepartmentRepository: save(department)
            DepartmentRepository-->>DepartmentService: Return updated department
            DepartmentService-->>DepartmentController: Return DepartmentResponse
            DepartmentController-->>Frontend: 200 OK
            Frontend->>User: Show success message
        end
    end
```

### 9. Delete Department Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant DepartmentController
    participant DepartmentService
    participant DepartmentRepository
    participant ExceptionHandler
    
    User->>Frontend: Click delete button
    Frontend->>Frontend: Show confirmation dialog
    User->>Frontend: Confirm deletion
    Frontend->>DepartmentController: DELETE /api/departments/{id}
    DepartmentController->>DepartmentService: deleteDepartment(id)
    
    DepartmentService->>DepartmentRepository: findById(id)
    
    alt Department not found
        DepartmentRepository-->>DepartmentService: Return empty
        DepartmentService-->>ExceptionHandler: Throw ResourceNotFoundException
        ExceptionHandler-->>Frontend: 404 Not Found
        Frontend->>User: Show error message
    else Department found
        DepartmentRepository-->>DepartmentService: Return department
        
        alt Department has employees
            DepartmentService->>DepartmentService: Check employeeCount > 0
            DepartmentService-->>ExceptionHandler: Throw BusinessValidationException
            ExceptionHandler-->>Frontend: 400 Bad Request
            Frontend->>User: Show "Cannot delete department with employees" error
        else Department empty
            DepartmentService->>DepartmentRepository: deleteById(id)
            DepartmentRepository-->>DepartmentService: Success
            DepartmentService-->>DepartmentController: void (success)
            DepartmentController-->>Frontend: 204 No Content
            Frontend->>User: Show success message & refresh list
        end
    end
```

### 10. Exception Handling Flow

```mermaid
flowchart TD
    A[API Request] --> B{Input Validation}
    B -->|Invalid| C[MethodArgumentNotValidException]
    B -->|Valid| D{Business Logic}
    
    D -->|Resource Not Found| E[ResourceNotFoundException]
    D -->|Business Rule Violated| F[BusinessValidationException]
    D -->|Database Constraint| G[ConstraintViolationException]
    D -->|Unknown Error| H[Generic Exception]
    D -->|Success| I[Return Success Response]
    
    C --> J[GlobalExceptionHandler]
    E --> J
    F --> J
    G --> J
    H --> J
    
    J --> K{Exception Type}
    K -->|Validation| L[400 Bad Request<br/>Field-level errors]
    K -->|Not Found| M[404 Not Found<br/>Resource message]
    K -->|Business| N[400 Bad Request<br/>Business error message]
    K -->|Constraint| O[409 Conflict<br/>Constraint message]
    K -->|Generic| P[500 Internal Error<br/>Generic message]
    
    L --> Q[Return Error Response]
    M --> Q
    N --> Q
    O --> Q
    P --> Q
```

### 11. Complete Request Lifecycle

```mermaid
flowchart LR
    A[Client Request] --> B{Authenticated?}
    B -->|No| C[Spring Security]
    C --> D{OAuth2 Login}
    D -->|Success| E[Session Created]
    D -->|Failure| F[Login Failed]
    
    B -->|Yes| G[CORS Filter]
    E --> G
    
    G --> H{CORS Valid?}
    H -->|No| I[403 Forbidden]
    H -->|Yes| J[Controller Layer]
    
    J --> K{Input Valid?}
    K -->|No| L[400 Validation Error]
    K -->|Yes| M[Service Layer]
    
    M --> N{Business Logic}
    N -->|Error| O[Exception Handler]
    N -->|Success| P[Repository Layer]
    
    P --> Q[Database]
    Q --> R[Response Entity]
    
    O --> S[Error Response]
    R --> T[Success Response]
    S --> U[JSON Response]
    T --> U
    
    U --> V[Client]
```

---

## Architecture Overview

### Layered Architecture Diagram

```mermaid
graph TB
    subgraph "Presentation Layer"
        A1[React Frontend]
        A2[LoginController]
        A3[AuthController]
        A4[EmployeeController]
        A5[DepartmentController]
    end
    
    subgraph "Security Layer"
        B1[Spring Security]
        B2[OAuth2LoginSuccessHandler]
        B3[OAuth2LoginFailureHandler]
        B4[CustomOAuth2UserService]
        B5[CORS Configuration]
    end
    
    subgraph "Business Logic Layer"
        C1[EmployeeService]
        C2[DepartmentService]
    end
    
    subgraph "Data Access Layer"
        D1[EmployeeRepository]
        D2[DepartmentRepository]
        D3[UserRepository]
    end
    
    subgraph "Database"
        E1[(MySQL Database)]
    end
    
    subgraph "Exception Handling"
        F1[GlobalExceptionHandler]
        F2[BusinessValidationException]
        F3[ResourceNotFoundException]
    end
    
    A1 --> A2
    A1 --> A3
    A1 --> A4
    A1 --> A5
    
    A2 --> B1
    A3 --> B1
    A4 --> B1
    A5 --> B1
    
    B1 --> B4
    B4 --> D3
    B1 --> B2
    B1 --> B3
    
    A4 --> C1
    A5 --> C2
    
    C1 --> D1
    C1 --> D2
    C2 --> D2
    
    D1 --> E1
    D2 --> E1
    D3 --> E1
    
    C1 -.->|Throws| F2
    C1 -.->|Throws| F3
    C2 -.->|Throws| F2
    C2 -.->|Throws| F3
    
    F2 --> F1
    F3 --> F1
    
    style A1 fill:#e1f5ff
    style B1 fill:#fff4e1
    style C1 fill:#e8f5e9
    style C2 fill:#e8f5e9
    style E1 fill:#f3e5f5
    style F1 fill:#ffebee
```

---