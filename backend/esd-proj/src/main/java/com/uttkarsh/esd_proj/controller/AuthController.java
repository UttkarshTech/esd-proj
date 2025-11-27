package com.uttkarsh.esd_proj.controller;

import com.uttkarsh.esd_proj.dto.UserResponse;
import com.uttkarsh.esd_proj.entity.User;
import com.uttkarsh.esd_proj.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final UserRepository userRepository;
    
    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * Get current authenticated user details
     */
    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Not authenticated");
            return ResponseEntity.status(401).body(error);
        }
        
        String email = principal.getAttribute("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(UserResponse.fromUser(user));
    }
    
    /**
     * Check authentication status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getAuthStatus(@AuthenticationPrincipal OAuth2User principal) {
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", principal != null);
        
        if (principal != null) {
            response.put("email", principal.getAttribute("email"));
            response.put("name", principal.getAttribute("name"));
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Logout endpoint - invalidates session and clears authentication
     * Only accessible to authenticated users
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@AuthenticationPrincipal OAuth2User principal,
                                     jakarta.servlet.http.HttpServletRequest request,
                                     jakarta.servlet.http.HttpServletResponse response) {
        if (principal == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Not authenticated");
            error.put("message", "No active session to logout");
            return ResponseEntity.status(401).body(error);
        }
        
        try {
            // Get user email before invalidating session
            String email = principal.getAttribute("email");
            
            // Invalidate the session
            request.getSession().invalidate();
            
            // Clear authentication context
            org.springframework.security.core.context.SecurityContextHolder.clearContext();
            
            // Clear cookies
            jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("JSESSIONID", null);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);
            
            // Return success response
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "Logged out successfully");
            successResponse.put("user", email);
            
            return ResponseEntity.ok(successResponse);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Logout failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
