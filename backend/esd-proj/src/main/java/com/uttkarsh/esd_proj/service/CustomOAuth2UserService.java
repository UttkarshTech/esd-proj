package com.uttkarsh.esd_proj.service;

import com.uttkarsh.esd_proj.entity.User;
import com.uttkarsh.esd_proj.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    
    private final UserRepository userRepository;
    
    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        System.out.println("OAuth2 User loaded: " + oAuth2User.getAttributes());
        
        // Process and save user
        processOAuth2User(userRequest, oAuth2User);
        
        return oAuth2User;
    }
    
    private void processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        // Extract user info from Google
        String providerId = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String pictureUrl = (String) attributes.get("picture");
        
        System.out.println("Processing OAuth2 user - Provider: " + registrationId + ", Email: " + email);
        
        // Check if user already exists
        User user = userRepository.findByProviderAndProviderId(registrationId, providerId)
                .orElse(null);
        
        if (user == null) {
            // Create new user
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPictureUrl(pictureUrl);
            user.setProvider(registrationId);
            user.setProviderId(providerId);
            
            System.out.println("Creating new user: " + email);
        } else {
            // Update existing user info
            user.setName(name);
            user.setPictureUrl(pictureUrl);
            
            System.out.println("Updating existing user: " + email);
        }
        
        userRepository.save(user);
    }
}
