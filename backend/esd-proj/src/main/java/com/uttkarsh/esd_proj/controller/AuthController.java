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
}
