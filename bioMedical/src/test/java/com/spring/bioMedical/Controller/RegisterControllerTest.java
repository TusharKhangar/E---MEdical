package com.spring.bioMedical.Controller;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.bioMedical.dto.ConfirmationRequest;
import com.spring.bioMedical.dto.RegistrationRequest;
import com.spring.bioMedical.entity.User;
import com.spring.bioMedical.security.JwtUtil;
import com.spring.bioMedical.service.EmailService;
import com.spring.bioMedical.service.UserService;

// Option 1: Configure with test security config
@WebMvcTest(value = RegisterController.class,  properties = {"spring.main.lazy-initialization=true"})
@Import(RegisterControllerTest.TestSecurityConfig.class)
@AutoConfigureMockMvc
public class RegisterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private EmailService emailService;

    // This is what was missing - we need to mock the JwtUtil
    @MockBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    private RegistrationRequest validRegistration;
    private User validUser;
    private ConfirmationRequest validConfirmation;

    // Test security configuration to bypass security for tests
    @Configuration
    static class TestSecurityConfig {
        @Bean
        public JwtUtil jwtUtil() {
            return mock(JwtUtil.class);
        }
    }

    @BeforeEach
    void setUp() {
        validRegistration = new RegistrationRequest();
        validRegistration.setEmail("test@example.com");
        validRegistration.setFirstName("Test");
        validRegistration.setLastName("User");
        // Other necessary fields...

        validUser = new User();
        validUser.setEmail("test@example.com");
        validUser.setFirstName("Test");
        validUser.setLastName("User");
        validUser.setConfirmationToken("test-token-123");
        validUser.setEnabled(false);
        validUser.setRole("ROLE_USER");

        validConfirmation = new ConfirmationRequest();
        validConfirmation.setToken("test-token-123");
        validConfirmation.setPassword("StrongP@ssw0rd123");
    }

    @Test
    // The registration endpoint is likely public, but we'll add this annotation to be safe
    @WithMockUser
    void registerUser_WithNewEmail_ShouldReturnSuccess() throws Exception {
        // Given
        when(userService.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(post("/api/register")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()) // Add CSRF token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegistration)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("confirmation e-mail has been sent")));

        verify(userService).saveUser(any(User.class));
        verify(emailService).sendEmail(any(SimpleMailMessage.class));
    }

    @Test
    @WithMockUser
    void registerUser_WithExistingEmail_ShouldReturnConflict() throws Exception {
        // Given
        when(userService.findByEmail(anyString())).thenReturn(Optional.of(validUser));

        // When & Then
        mockMvc.perform(post("/api/register")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()) // Add CSRF token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegistration)))
                .andExpect(status().isConflict())
                .andExpect(content().string(containsString("already a user registered")));

        verify(userService, never()).saveUser(any(User.class));
        verify(emailService, never()).sendEmail(any(SimpleMailMessage.class));
    }

    @Test
    @WithMockUser
    void registerUser_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        // Given
        validRegistration.setEmail("invalid-email"); // Invalid email to trigger validation error

        // When & Then
        mockMvc.perform(post("/api/register")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()) // Add CSRF token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegistration)))
                .andExpect(status().isBadRequest());

        verify(userService, never()).saveUser(any(User.class));
    }

    @Test
    @WithMockUser
    void confirmRegistration_WithValidToken_ShouldReturnToken() throws Exception {
        // Given
        when(userService.findByConfirmationToken("test-token-123")).thenReturn(Optional.of(validUser));

        // When & Then
        mockMvc.perform(get("/api/register/confirm")
                        .param("token", "test-token-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test-token-123"))
                .andExpect(jsonPath("$.errorMessage").isEmpty());
    }

    @Test
    @WithMockUser
    void confirmRegistration_WithInvalidToken_ShouldReturnBadRequest() throws Exception {
        // Given
        when(userService.findByConfirmationToken("invalid-token")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/register/confirm")
                        .param("token", "invalid-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorMessage").value(containsString("invalid confirmation link")));
    }

    @Test
    @WithMockUser
    void confirmRegistration_WithValidTokenAndStrongPassword_ShouldEnableUser() throws Exception {
        // Given
        when(userService.findByConfirmationToken("test-token-123")).thenReturn(Optional.of(validUser));

        // When & Then
        mockMvc.perform(post("/api/register/confirm")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()) // Add CSRF token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validConfirmation)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("password has been set")));

        verify(userService).saveUser(any(User.class));
    }

    @Test
    @WithMockUser
    void confirmRegistration_WithValidTokenAndWeakPassword_ShouldReturnBadRequest() throws Exception {
        // Given
        validConfirmation.setPassword("weak"); // Set weak password

        // When & Then
        mockMvc.perform(post("/api/register/confirm")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()) // Add CSRF token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validConfirmation)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("password is too weak")));

        verify(userService, never()).saveUser(any(User.class));
    }

    @Test
    @WithMockUser
    void confirmRegistration_WithInvalidConfirmationToken_ShouldReturnBadRequest() throws Exception {
        // Given
        when(userService.findByConfirmationToken("test-token-123")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(post("/api/register/confirm")
                        .with(SecurityMockMvcRequestPostProcessors.csrf()) // Add CSRF token
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validConfirmation)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Invalid confirmation token")));

        verify(userService, never()).saveUser(any(User.class));
    }
}